import axios from 'axios';
import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import {
    IDocument,
    IDynamicField,
    IDocumentLine,
    IPurchaseOrder,
} from '../../../transport/Interfaces';
import {
    applyDynamicFields,
    buildPurchaseOrderLines,
    IPurchaseOrderLineInput,
} from '../../../transport/ERPSAPB1Builders';
import { toSapDate } from '../../../utils/date';

interface IDynamicFieldParameter {
    dynamicFields?: IDynamicField[];
}

interface IOptionalPurchaseOrderFields {
    attachmentEntry?: number;
    sequenceCode?: number;
    sequenceModel?: string;
    sequenceSerial?: string;
}

interface IDocumentLineParameter {
    lineValues?: IPurchaseOrderLineInput[];
}

interface IAttachmentUrlParameter {
    url?: string;
    fileName?: string;
}

interface IAttachmentUrlsParameter {
    attachmentUrls?: IAttachmentUrlParameter[];
}

interface IAttachmentFileInput {
    fileName: string;
    content: Buffer;
}

type AttachmentSource = 'none' | 'binary' | 'url' | 'binaryAndUrl';

const ATTACHMENT_URL_TIMEOUT_MS = 60000;

function isSapDocumentLineArray(value: unknown): value is IDocumentLine[] {
    return Array.isArray(value) && value.every((lineValue) => {
        if (typeof lineValue !== 'object' || lineValue === null) {
            return false;
        }

        const documentLine = lineValue as IDocumentLine;
        return Boolean(
            documentLine.ItemCode
            && documentLine.ItemDescription
            && documentLine.Quantity !== undefined
            && documentLine.UnitPrice !== undefined,
        );
    });
}

function isPurchaseOrderLineInputArray(value: unknown): value is IPurchaseOrderLineInput[] {
    return Array.isArray(value) && value.every((lineValue) => typeof lineValue === 'object' && lineValue !== null && 'itemCode' in lineValue);
}

function parseDocumentLinesJson(rawValue: string): unknown {
    try {
        return JSON.parse(rawValue);
    } catch {
        throw new Error('O JSON informado para documentLines é invalido.');
    }
}

function resolveDocumentLines(documentLinesMode: string, manualDocumentLines: IDocumentLineParameter, documentLinesJson: string): IDocumentLine[] {
    if (documentLinesMode === 'manual') {
        if (!manualDocumentLines.lineValues?.length) {
            throw new Error('Informe ao menos um item para criar o pedido de compra.');
        }

        return buildPurchaseOrderLines(manualDocumentLines.lineValues);
    }

    const parsedDocumentLines = parseDocumentLinesJson(documentLinesJson);

    if (isSapDocumentLineArray(parsedDocumentLines)) {
        return parsedDocumentLines;
    }

    if (isPurchaseOrderLineInputArray(parsedDocumentLines)) {
        return buildPurchaseOrderLines(parsedDocumentLines);
    }

    if (
        typeof parsedDocumentLines === 'object'
        && parsedDocumentLines !== null
        && 'lineValues' in parsedDocumentLines
        && isPurchaseOrderLineInputArray((parsedDocumentLines as IDocumentLineParameter).lineValues)
    ) {
        return buildPurchaseOrderLines((parsedDocumentLines as IDocumentLineParameter).lineValues!);
    }

    throw new Error('O JSON de documentLines deve ser um array no formato SAP ou um array de itens no formato simplificado do node.');
}

function resolveOptionalSapDate(value: string): string | undefined {
    return value ? toSapDate(value) : undefined;
}

function resolveRequiredSapDate(value: string): string {
    if (value) {
        return toSapDate(value);
    }

    return toSapDate(new Date());
}

function safeTrim(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function splitCommaSeparated(value: unknown): string[] {
    return safeTrim(value)
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part.length > 0);
}

function sanitizeFileName(fileName: string): string {
    return fileName.replace(/[\\/:*?"<>|]/g, '_').trim() || 'anexo';
}

function fileNameFromContentDisposition(contentDisposition: unknown): string {
    if (typeof contentDisposition !== 'string' || !contentDisposition) {
        return '';
    }

    const utfFileName = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
    if (utfFileName?.[1]) {
        try {
            return decodeURIComponent(utfFileName[1].replace(/"/g, ''));
        } catch {
            return utfFileName[1].replace(/"/g, '');
        }
    }

    const regularFileName = /filename="?([^";]+)"?/i.exec(contentDisposition);
    return regularFileName?.[1] ?? '';
}

function fileNameFromUrl(url: string, fallbackIndex: number): string {
    try {
        const parsedUrl = new URL(url);
        const urlFileName = parsedUrl.pathname.split('/').filter(Boolean).pop();
        if (urlFileName) {
            return decodeURIComponent(urlFileName);
        }
    } catch {
        const urlFileName = url.split('?')[0].split('/').filter(Boolean).pop();
        if (urlFileName) {
            return urlFileName;
        }
    }

    return `anexo-${fallbackIndex + 1}`;
}

function shouldCollectBinaryAttachments(source: AttachmentSource): boolean {
    return source === 'binary' || source === 'binaryAndUrl';
}

function shouldCollectUrlAttachments(source: AttachmentSource): boolean {
    return source === 'url' || source === 'binaryAndUrl';
}

async function collectBinaryAttachmentFiles(
    this: IExecuteFunctions,
    index: number,
    binaryKeys: string[],
): Promise<IAttachmentFileInput[]> {
    if (!binaryKeys.length) {
        throw new Error('Informe ao menos uma chave binaria para anexar ao pedido de compra.');
    }

    const item = this.getInputData()[index];
    if (!item.binary) {
        throw new Error('Arquivo binario nao esta presente no item de entrada.');
    }

    const files: IAttachmentFileInput[] = [];
    for (const binaryKey of binaryKeys) {
        const binaryFile = item.binary[binaryKey];
        if (!binaryFile) {
            throw new Error(`Nao ha anexo binario com a chave "${binaryKey}".`);
        }

        const fileContent = await this.helpers.getBinaryDataBuffer(index, binaryKey);
        files.push({
            fileName: sanitizeFileName(binaryFile.fileName || `${binaryKey}.bin`),
            content: fileContent,
        });
    }

    return files;
}

async function collectUrlAttachmentFiles(attachmentUrls: IAttachmentUrlParameter[] = []): Promise<IAttachmentFileInput[]> {
    const normalizedUrls = attachmentUrls
        .map((attachmentUrl) => ({
            url: safeTrim(attachmentUrl.url),
            fileName: safeTrim(attachmentUrl.fileName),
        }))
        .filter((attachmentUrl) => attachmentUrl.url.length > 0);

    if (!normalizedUrls.length) {
        throw new Error('Informe ao menos uma URL para anexar ao pedido de compra.');
    }

    const files: IAttachmentFileInput[] = [];
    for (const [urlIndex, attachmentUrl] of normalizedUrls.entries()) {
        const response = await axios.get<ArrayBuffer>(attachmentUrl.url, {
            responseType: 'arraybuffer',
            timeout: ATTACHMENT_URL_TIMEOUT_MS,
        });

        const inferredFileName = attachmentUrl.fileName
            || fileNameFromContentDisposition(response.headers['content-disposition'])
            || fileNameFromUrl(attachmentUrl.url, urlIndex);

        files.push({
            fileName: sanitizeFileName(inferredFileName),
            content: Buffer.from(response.data),
        });
    }

    return files;
}

async function resolvePurchaseOrderAttachmentEntry(
    this: IExecuteFunctions,
    api: ERPSAPB1Api,
    index: number,
    existingAttachmentEntry: number | undefined,
    attachmentSource: AttachmentSource,
    attachmentBinaryKeys: string,
    attachmentUrlFields: IAttachmentUrlsParameter,
): Promise<number | undefined> {
    if (attachmentSource === 'none') {
        return existingAttachmentEntry ?? undefined;
    }

    const files: IAttachmentFileInput[] = [];
    if (shouldCollectBinaryAttachments(attachmentSource)) {
        files.push(...await collectBinaryAttachmentFiles.call(this, index, splitCommaSeparated(attachmentBinaryKeys)));
    }

    if (shouldCollectUrlAttachments(attachmentSource)) {
        files.push(...await collectUrlAttachmentFiles(attachmentUrlFields.attachmentUrls));
    }

    if (!files.length) {
        throw new Error('Informe ao menos um anexo binario ou URL para criar o AttachmentEntry.');
    }

    const attachment = await api.createAttachmentFiles(files);
    if (!attachment?.AbsoluteEntry) {
        throw new Error('Nao foi possivel criar o registro de anexo no SAP B1.');
    }

    return attachment.AbsoluteEntry;
}

function normalizeDocCurrency(value: unknown): string | undefined {
    const normalized = safeTrim(value);
    if (!normalized) {
        return undefined;
    }

    if (normalized.toUpperCase() === 'BRL' || normalized === 'R$') {
        return undefined;
    }

    return normalized;
}

function resolveOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }

    if (typeof value === 'number') {
        return Number.isNaN(value) || value <= 0 ? undefined : value;
    }

    const normalized = String(value).trim().replace(',', '.');
    if (!normalized) {
        return undefined;
    }

    const parsed = Number(normalized);
    return Number.isNaN(parsed) || parsed <= 0 ? undefined : parsed;
}

function extractDetailedErrorMessage(error: unknown): string | undefined {
    const axiosError = error as {
        response?: {
            data?: {
                error?: {
                    message?: {
                        value?: string;
                    } | string;
                };
                detail?: string;
                message?: string;
            };
        };
        message?: string;
    };

    if (axiosError.message?.includes('Endpoint de PurchaseOrders nao encontrado')) {
        return axiosError.message;
    }

    const errorMessageValue = axiosError.response?.data?.error?.message;
    if (typeof errorMessageValue === 'string' && errorMessageValue) {
        return errorMessageValue;
    }

    if (typeof errorMessageValue === 'object' && errorMessageValue?.value) {
        return errorMessageValue.value;
    }

    if (axiosError.response?.data?.detail) {
        return axiosError.response.data.detail;
    }

    if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
    }

    return axiosError.message;
}

function normalizeForComparison(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveDynamicFieldValue(dynamicFields: IDynamicField[] | undefined, fieldNames: string[]): string {
    if (!dynamicFields?.length) {
        return '';
    }

    const normalizedFieldNames = fieldNames.map((fieldName) => fieldName.toLowerCase());
    const matchedField = dynamicFields.find((field) => normalizedFieldNames.includes(String(field.name).toLowerCase()));
    return safeTrim(matchedField?.value);
}

export async function purchaseOrder(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const cardCode = safeTrim(this.getNodeParameter('cardCode', index, ''));
    const supplierDocument = safeTrim(this.getNodeParameter('supplierDocument', index, ''));
    const docDate = resolveRequiredSapDate(this.getNodeParameter('docDate', index, '') as string);
    const dueDate = resolveRequiredSapDate(this.getNodeParameter('dueDate', index, '') as string);
    const taxDate = resolveRequiredSapDate(this.getNodeParameter('taxDate', index, '') as string);
    const bplId = this.getNodeParameter('bplId', index, undefined) as number | undefined;
    const comments = this.getNodeParameter('comments', index, '') as string;
    const journalMemo = this.getNodeParameter('journalMemo', index, '') as string;
    const docCurrency = normalizeDocCurrency(this.getNodeParameter('docCurrency', index, ''));
    const docRateRaw = this.getNodeParameter('docRate', index, undefined) as unknown;
    const docRate = resolveOptionalNumber(docRateRaw);
    const documentLinesMode = this.getNodeParameter('documentLinesMode', index, 'manual') as string;
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {}) as IDynamicFieldParameter;
    const manualDocumentLines = this.getNodeParameter('documentLines', index, {}) as IDocumentLineParameter;
    const documentLinesJson = this.getNodeParameter('documentLinesJson', index, '[]') as string;
    const optionalFields = this.getNodeParameter('optionalFields', index, {}) as IOptionalPurchaseOrderFields;
    const attachmentSource = this.getNodeParameter('attachmentSource', index, 'none') as AttachmentSource;
    const requireAttachment = this.getNodeParameter('requireAttachment', index, true) as boolean;
    const attachmentBinaryKeys = this.getNodeParameter('attachmentBinaryKeys', index, 'data') as string;
    const attachmentUrlFields = this.getNodeParameter('attachmentUrls', index, {}) as IAttachmentUrlsParameter;

    try {
        let resolvedDocCurrency = docCurrency;
        if (resolvedDocCurrency) {
            const currencyCodes = await api.listCurrencyCodes();
            const directMatch = currencyCodes.find((code) => code === resolvedDocCurrency);
            const normalizedInput = normalizeForComparison(resolvedDocCurrency);
            const looseMatch = currencyCodes.find((code) => normalizeForComparison(code) === normalizedInput);

            if (directMatch) {
                resolvedDocCurrency = directMatch;
            } else if (looseMatch) {
                resolvedDocCurrency = looseMatch;
            } else {
                throw new Error(
                    `Moeda "${resolvedDocCurrency}" não encontrada no SAP. Use um dos códigos cadastrados: ${currencyCodes.join(', ')}`,
                );
            }
        }

        let resolvedCardCode = cardCode || resolveDynamicFieldValue(dynamicFields, ['CardCode', 'cardCode']);
        const resolvedSupplierDocument = supplierDocument || resolveDynamicFieldValue(dynamicFields, ['supplierDocument', 'SupplierDocument', 'taxId0', 'TaxId0', 'FederalTaxID']);
        if (!resolvedCardCode && resolvedSupplierDocument) {
            const supplier = await api.getSupplierByDocument(resolvedSupplierDocument);
            if (!supplier?.BPCode) {
                throw new Error(`Nao foi possivel localizar fornecedor no SAP para o documento ${resolvedSupplierDocument}.`);
            }
            resolvedCardCode = supplier.BPCode;
        }

        if (!resolvedCardCode) {
            throw new Error('Informe CardCode ou CNPJ/CPF do fornecedor para criar o pedido de compra.');
        }

        const attachmentEntry = await resolvePurchaseOrderAttachmentEntry.call(
            this,
            api,
            index,
            optionalFields.attachmentEntry,
            attachmentSource,
            attachmentBinaryKeys,
            attachmentUrlFields,
        );

        if (requireAttachment && !attachmentEntry) {
            throw new Error(
                'A regra FGR do SAP exige anexo no pedido de compra. '
                + 'Informe um AttachmentEntry existente em Campos opcionais ou selecione Origem dos Anexos como Binário, URL ou Binário e URL.',
            );
        }

        const purchaseOrder = applyDynamicFields({
            CardCode: resolvedCardCode,
            DocDate: docDate,
            DocDueDate: dueDate,
            TaxDate: taxDate,
            BPL_IDAssignedToInvoice: bplId,
            Comments: comments || undefined,
            JournalMemo: journalMemo || undefined,
            DocCurrency: resolvedDocCurrency,
            DocRate: docRate,
            U_FGR_RATEIO_CC: 'N',
            U_FGR_CONTRATO: 'N',
            AttachmentEntry: attachmentEntry,
            SequenceCode: optionalFields.sequenceCode ?? undefined,
            SequenceModel: optionalFields.sequenceModel ?? undefined,
            SequenceSerial: optionalFields.sequenceSerial ?? undefined,
            DocumentLines: resolveDocumentLines(documentLinesMode, manualDocumentLines, documentLinesJson),
        } as IDocument, dynamicFields);

        const createdPurchaseOrder = await api.createPurchaseOrder(purchaseOrder);

        return this.helpers.returnJsonArray([createdPurchaseOrder as unknown as IPurchaseOrder]);
    } catch (error: unknown) {
        if (error instanceof NodeOperationError) {
            throw error;
        }

        const detailedMessage = extractDetailedErrorMessage(error);
        if (detailedMessage) {
            const attachmentHint = detailedMessage.includes('OBRIGATÓRIO ANEXAR')
                ? ' Configure Origem dos Anexos como Binário, URL ou Binário e URL, ou informe AttachmentEntry existente.'
                : '';

            throw new NodeOperationError(
                this.getNode(),
                `Nao foi possivel criar o pedido de compra. Detalhe: ${detailedMessage}.${attachmentHint}`,
            );
        }

        throw new NodeOperationError(this.getNode(), 'Nao foi possivel criar o pedido de compra.');
    }
}
