"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const n8n_workflow_1 = require("n8n-workflow");
const ERPSAPB1Builders_1 = require("../../../transport/ERPSAPB1Builders");
const date_1 = require("../../../utils/date");
const PAYMENT_DOCUMENT_TYPES = new Set([
    'accountsPayable',
    'accountsReceivable',
]);
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
function normalizeOptionalNumber(value) {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
}
function resolveOptionalSapDate(value) {
    const normalizedValue = normalizeText(value);
    return normalizedValue ? (0, date_1.toSapDate)(normalizedValue) : undefined;
}
function resolveRequiredSapDate(value) {
    const normalizedValue = normalizeText(value);
    return normalizedValue ? (0, date_1.toSapDate)(normalizedValue) : (0, date_1.toSapDate)(new Date());
}
function removeEmptyProperties(value) {
    return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== ''));
}
function parsePayloadJson(rawValue) {
    try {
        const payload = JSON.parse(rawValue);
        if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
            throw new Error();
        }
        return payload;
    }
    catch {
        throw new Error('Payload JSON deve ser um objeto JSON valido.');
    }
}
function buildPaymentInvoices(documentType, paymentInvoices) {
    var _a;
    const invoices = (_a = paymentInvoices.invoiceValues) !== null && _a !== void 0 ? _a : [];
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
function buildDocumentPayload(index) {
    var _a;
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const documentLines = this.getNodeParameter('documentLines', index, {});
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
        DocumentLines: (0, ERPSAPB1Builders_1.buildPurchaseOrderLines)((_a = documentLines.lineValues) !== null && _a !== void 0 ? _a : []),
    });
}
function buildPaymentPayload(documentType, index) {
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const paymentInvoices = this.getNodeParameter('paymentInvoices', index, {});
    if (!cardCode) {
        throw new Error('CardCode é obrigatório para criar contas a pagar/receber no SAP B1.');
    }
    return removeEmptyProperties({
        DocDate: resolveRequiredSapDate(this.getNodeParameter('docDate', index, '')),
        TaxDate: resolveRequiredSapDate(this.getNodeParameter('taxDate', index, '')),
        CardCode: cardCode,
        DocCurrency: normalizeText(this.getNodeParameter('docCurrency', index, '')) || undefined,
        DocRate: normalizeOptionalNumber(this.getNodeParameter('docRate', index, undefined)),
        LocalCurrency: this.getNodeParameter('localCurrency', index, 'tNO'),
        CashAccount: normalizeText(this.getNodeParameter('cashAccount', index, '')) || undefined,
        CashSum: normalizeOptionalNumber(this.getNodeParameter('cashSum', index, undefined)),
        Remarks: normalizeText(this.getNodeParameter('remarks', index, '')) || undefined,
        PaymentInvoices: buildPaymentInvoices(documentType, paymentInvoices),
    });
}
function getDocumentType(index) {
    const resource = this.getNodeParameter('resource', index);
    if (resource === 'document') {
        return this.getNodeParameter('documentType', index);
    }
    return resource;
}
async function create(api, index) {
    const documentType = getDocumentType.call(this, index);
    const payloadMode = this.getNodeParameter('payloadMode', index, 'json');
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {});
    try {
        const payload = payloadMode === 'json'
            ? parsePayloadJson(this.getNodeParameter('payloadJson', index, '{}'))
            : PAYMENT_DOCUMENT_TYPES.has(documentType)
                ? buildPaymentPayload.call(this, documentType, index)
                : buildDocumentPayload.call(this, index);
        const createdDocument = await api.createDocument(documentType, (0, ERPSAPB1Builders_1.applyDynamicFields)(payload, dynamicFields));
        return this.helpers.returnJsonArray([createdDocument]);
    }
    catch (error) {
        if (error instanceof n8n_workflow_1.NodeOperationError) {
            throw error;
        }
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'Nao foi possivel criar documento no SAP B1.', { itemIndex: index });
    }
}
