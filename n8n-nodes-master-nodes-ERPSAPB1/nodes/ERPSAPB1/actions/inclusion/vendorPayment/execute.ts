import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { InvoiceType, IVendorPaymentInvoiceLine, IVendorPaymentRequest } from '../../../transport/Interfaces';
import { toSapDate } from '../../../utils/date';

interface IPaymentInvoiceInput {
    docEntry: number;
    sumApplied: number;
    invoiceType: InvoiceType;
}

interface IPaymentInvoiceParameter {
    invoiceValues?: IPaymentInvoiceInput[];
}

function normalizeText(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function resolvePaymentInvoices(paymentInvoices: IPaymentInvoiceParameter): IVendorPaymentInvoiceLine[] {
    if (!paymentInvoices.invoiceValues?.length) {
        throw new Error('Informe ao menos uma invoice para realizar a baixa.');
    }

    return paymentInvoices.invoiceValues.map((invoice) => ({
        DocEntry: invoice.docEntry,
        SumApplied: invoice.sumApplied,
        InvoiceType: invoice.invoiceType,
    }));
}

export async function vendorPayment(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const docDate = toSapDate(this.getNodeParameter('docDate', index) as string);
    const taxDate = toSapDate(this.getNodeParameter('taxDate', index) as string);
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const docCurrency = normalizeText(this.getNodeParameter('docCurrency', index, ''));
    const docRateRaw = this.getNodeParameter('docRate', index, undefined) as number | null | undefined;
    const cashAccount = normalizeText(this.getNodeParameter('cashAccount', index, ''));
    const cashSumRaw = this.getNodeParameter('cashSum', index, undefined) as number | null | undefined;
    const remarks = normalizeText(this.getNodeParameter('remarks', index, ''));
    const localCurrency = this.getNodeParameter('localCurrency', index, 'tNO') as 'tYES' | 'tNO';
    const paymentInvoices = this.getNodeParameter('paymentInvoices', index, {}) as IPaymentInvoiceParameter;

    const payload: IVendorPaymentRequest = {
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
    } catch (error: unknown) {
        if (error instanceof NodeOperationError) {
            throw error;
        }

        throw new NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'Nao foi possivel realizar a baixa de NF/PC.');
    }
}
