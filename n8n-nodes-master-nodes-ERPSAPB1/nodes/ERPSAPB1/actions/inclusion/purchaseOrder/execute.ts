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
            && documentLine.UnitPrice !== undefined
            && documentLine.CostingCode,
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
            AttachmentEntry: optionalFields.attachmentEntry ?? undefined,
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
            throw new NodeOperationError(
                this.getNode(),
                `Nao foi possivel criar o pedido de compra. Detalhe: ${detailedMessage}.`,
            );
        }

        throw new NodeOperationError(this.getNode(), 'Nao foi possivel criar o pedido de compra.');
    }
}
