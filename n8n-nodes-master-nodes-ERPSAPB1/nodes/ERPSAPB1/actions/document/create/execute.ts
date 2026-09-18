import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { IDynamicField, SAPB1ManagedDocumentType } from '../../../transport/Interfaces';
import { applyDynamicFields, buildPurchaseOrderLines, IPurchaseOrderLineInput } from '../../../transport/ERPSAPB1Builders';
import { toSapDate } from '../../../utils/date';

interface IDynamicFieldParameter {
    dynamicFields?: IDynamicField[];
}

interface IDocumentLineParameter {
    lineValues?: IPurchaseOrderLineInput[];
}

interface IPaymentInvoiceInput {
    docEntry: number;
    sumApplied: number;
    invoiceType?: string;
}

interface IPaymentInvoiceParameter {
    invoiceValues?: IPaymentInvoiceInput[];
}

const PAYMENT_DOCUMENT_TYPES = new Set<SAPB1ManagedDocumentType>([
    'accountsPayable',
    'accountsReceivable',
]);

function normalizeText(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function normalizeOptionalNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }

    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
}

function resolveOptionalSapDate(value: unknown): string | undefined {
    const normalizedValue = normalizeText(value);
    return normalizedValue ? toSapDate(normalizedValue) : undefined;
}

function resolveRequiredSapDate(value: unknown): string {
    const normalizedValue = normalizeText(value);
    return normalizedValue ? toSapDate(normalizedValue) : toSapDate(new Date());
}

function removeEmptyProperties<T extends IDataObject>(value: T): T {
    return Object.fromEntries(
        Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== ''),
    ) as T;
}

function parsePayloadJson(rawValue: string): IDataObject {
    try {
        const payload = JSON.parse(rawValue);
        if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
            throw new Error();
        }

        return payload as IDataObject;
    } catch {
        throw new Error('Payload JSON deve ser um objeto JSON valido.');
    }
}

function buildPaymentInvoices(
    documentType: SAPB1ManagedDocumentType,
    paymentInvoices: IPaymentInvoiceParameter,
): IDataObject[] {
    const invoices = paymentInvoices.invoiceValues ?? [];
    if (!invoices.length) {
        throw new Error('Informe ao menos uma invoice para criar contas a pagar/receber.');
    }

    return invoices.map((invoice) => ({
        DocEntry: invoice.docEntry,
        SumApplied: invoice.sumApplied,
        InvoiceType: normalizeText(invoice.invoiceType)
            || (documentType === 'accountsPayable' ? 'it_PurchaseInvoice' : 'it_Invoice'),
    }));
}

function buildDocumentPayload(this: IExecuteFunctions, index: number): IDataObject {
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const documentLines = this.getNodeParameter('documentLines', index, {}) as IDocumentLineParameter;

    if (!cardCode) {
        throw new Error('CardCode é obrigatório para criar documento no SAP B1.');
    }

    return removeEmptyProperties({
        CardCode: cardCode,
        DocDate: resolveRequiredSapDate(this.getNodeParameter('docDate', index, '')),
        DocDueDate: resolveOptionalSapDate(this.getNodeParameter('dueDate', index, '')),
        TaxDate: resolveOptionalSapDate(this.getNodeParameter('taxDate', index, '')),
        BPL_IDAssignedToInvoice: normalizeOptionalNumber(this.getNodeParameter('bplId', index, undefined)),
        Comments: normalizeText(this.getNodeParameter('comments', index, '')) || undefined,
        JournalMemo: normalizeText(this.getNodeParameter('journalMemo', index, '')) || undefined,
        DocCurrency: normalizeText(this.getNodeParameter('docCurrency', index, '')) || undefined,
        DocRate: normalizeOptionalNumber(this.getNodeParameter('docRate', index, undefined)),
        DownPaymentPercentage: normalizeOptionalNumber(this.getNodeParameter('downPaymentPercentage', index, undefined)),
        DocumentLines: buildPurchaseOrderLines(documentLines.lineValues ?? []),
    } as IDataObject);
}

function buildPaymentPayload(
    this: IExecuteFunctions,
    documentType: SAPB1ManagedDocumentType,
    index: number,
): IDataObject {
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const paymentInvoices = this.getNodeParameter('paymentInvoices', index, {}) as IPaymentInvoiceParameter;

    if (!cardCode) {
        throw new Error('CardCode é obrigatório para criar contas a pagar/receber no SAP B1.');
    }

    return removeEmptyProperties({
        DocDate: resolveRequiredSapDate(this.getNodeParameter('docDate', index, '')),
        TaxDate: resolveRequiredSapDate(this.getNodeParameter('taxDate', index, '')),
        CardCode: cardCode,
        DocCurrency: normalizeText(this.getNodeParameter('docCurrency', index, '')) || undefined,
        DocRate: normalizeOptionalNumber(this.getNodeParameter('docRate', index, undefined)),
        LocalCurrency: this.getNodeParameter('localCurrency', index, 'tNO') as string,
        CashAccount: normalizeText(this.getNodeParameter('cashAccount', index, '')) || undefined,
        CashSum: normalizeOptionalNumber(this.getNodeParameter('cashSum', index, undefined)),
        Remarks: normalizeText(this.getNodeParameter('remarks', index, '')) || undefined,
        PaymentInvoices: buildPaymentInvoices(documentType, paymentInvoices),
    } as IDataObject);
}

function getDocumentType(this: IExecuteFunctions, index: number): SAPB1ManagedDocumentType {
    const resource = this.getNodeParameter('resource', index) as string;
    if (resource === 'document') {
        return this.getNodeParameter('documentType', index) as SAPB1ManagedDocumentType;
    }

    return resource as SAPB1ManagedDocumentType;
}

export async function create(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const documentType = getDocumentType.call(this, index);
    const payloadMode = this.getNodeParameter('payloadMode', index, 'json') as string;
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {}) as IDynamicFieldParameter;

    try {
        const payload = payloadMode === 'json'
            ? parsePayloadJson(this.getNodeParameter('payloadJson', index, '{}') as string)
            : PAYMENT_DOCUMENT_TYPES.has(documentType)
                ? buildPaymentPayload.call(this, documentType, index)
                : buildDocumentPayload.call(this, index);

        const createdDocument = await api.createDocument(
            documentType,
            applyDynamicFields(payload, dynamicFields),
        );

        return this.helpers.returnJsonArray([createdDocument]);
    } catch (error: unknown) {
        if (error instanceof NodeOperationError) {
            throw error;
        }

        throw new NodeOperationError(
            this.getNode(),
            error instanceof Error ? error.message : 'Nao foi possivel criar documento no SAP B1.',
            { itemIndex: index },
        );
    }
}
