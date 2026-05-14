"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vendorPayment = vendorPayment;
const n8n_workflow_1 = require("n8n-workflow");
const date_1 = require("../../../utils/date");
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
function resolvePaymentInvoices(paymentInvoices) {
    var _a;
    if (!((_a = paymentInvoices.invoiceValues) === null || _a === void 0 ? void 0 : _a.length)) {
        throw new Error('Informe ao menos uma invoice para realizar a baixa.');
    }
    return paymentInvoices.invoiceValues.map((invoice) => ({
        DocEntry: invoice.docEntry,
        SumApplied: invoice.sumApplied,
        InvoiceType: invoice.invoiceType,
    }));
}
async function vendorPayment(api, index) {
    const docDate = (0, date_1.toSapDate)(this.getNodeParameter('docDate', index));
    const taxDate = (0, date_1.toSapDate)(this.getNodeParameter('taxDate', index));
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const docCurrency = normalizeText(this.getNodeParameter('docCurrency', index, ''));
    const docRateRaw = this.getNodeParameter('docRate', index, undefined);
    const cashAccount = normalizeText(this.getNodeParameter('cashAccount', index, ''));
    const cashSumRaw = this.getNodeParameter('cashSum', index, undefined);
    const remarks = normalizeText(this.getNodeParameter('remarks', index, ''));
    const localCurrency = this.getNodeParameter('localCurrency', index, 'tNO');
    const paymentInvoices = this.getNodeParameter('paymentInvoices', index, {});
    const payload = {
        DocDate: docDate,
        TaxDate: taxDate,
        CardCode: cardCode,
        DocCurrency: docCurrency || undefined,
        DocRate: typeof docRateRaw === 'number' ? docRateRaw : undefined,
        LocalCurrency: localCurrency,
        CashAccount: cashAccount || undefined,
        CashSum: typeof cashSumRaw === 'number' ? cashSumRaw : undefined,
        Remarks: remarks || undefined,
        PaymentInvoices: resolvePaymentInvoices(paymentInvoices),
    };
    try {
        const response = await api.createVendorPayment(payload);
        return this.helpers.returnJsonArray([response]);
    }
    catch (error) {
        if (error instanceof n8n_workflow_1.NodeOperationError) {
            throw error;
        }
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'Nao foi possivel realizar a baixa de NF/PC.');
    }
}
