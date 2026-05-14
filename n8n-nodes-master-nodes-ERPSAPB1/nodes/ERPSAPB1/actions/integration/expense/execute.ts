import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import {ERPSAPB1Api} from '../../../transport/ERPSAPB1Api';
import {extractDateFromDateTime, getDateInFutureDays} from '../../../../../src/date';
import {
    IDocumentItems,
    IDocumentTemplate, IDynamicFieldValue, IPaymentExecutionOptions,
    IPurchaseDownPayment,
    ISAPB1SupplierOptions
} from '../../../transport/Interfaces';
import {OnflyNodes} from '../../../../../src/OnflyNodes';
import {ERPSAPB1Parser} from '../../../transport/ERPSAPB1Parser';
import {ExpenseReporter} from '../../../../../src/reports/ExpenseReporter';
import {ProcessError} from '../../../../../src/db/entity/ProcessError';
import {Company} from '../../../../../src/db/entity/Company';
import {NotFound} from '../../../../../src/errors/exceptions/NotFound';
import {removeUndefinedEntriesFromObject} from '../../../../../src/helpers';
import {UnprocessableEntity} from '../../../../../src/errors/exceptions/UnprocessableEntity';

export async function expense(this: IExecuteFunctions, api: ERPSAPB1Api): Promise<INodeExecutionData[]> {
    const companyId = this.getNodeParameter('companyId', 0) as number;

    const reporter = new ExpenseReporter<IPurchaseDownPayment>(OnflyNodes.SAP_B1, this, companyId);

    reporter.onflyIdExtractor = (index: number) => this.getNodeParameter('sequenceSerial', index) as number;

    reporter.outputProvider = async (index: number, company: Company) => {
        const bplId = this.getNodeParameter('bplId', index, null) as number | null,
            sequenceCode = this.getNodeParameter('sequenceCode', index) as number,
            sequenceSerial = this.getNodeParameter('sequenceSerial', index) as number,
            docDateTime = new Date(this.getNodeParameter('docDate', index) as string),
            docDate = extractDateFromDateTime(docDateTime),
            docDueDate = getDateInFutureDays(docDateTime, this.getNodeParameter('dueDays', index) as number),
            comments = this.getNodeParameter('comments', index) as string,
            journalMemo = this.getNodeParameter('journalMemo', index) as string,
            documentItems = this.getNodeParameter('documentItems', index) as IDocumentItems,
            supplierOptions = this.getNodeParameter('supplierOptions', index) as ISAPB1SupplierOptions,
            {dynamicFields} = this.getNodeParameter('dynamicFields', index) as Partial<IDynamicFieldValue>,
            {paymentExecution} = this.getNodeParameter('paymentExecutionOptions', index, {}) as IPaymentExecutionOptions;

        if (!documentItems.itemValues) {
            throw new NodeOperationError(this.getNode(), 'Item da despesa não fornecido.');
        }

        const cardCode = await api.getSupplierCardCode(supplierOptions, company);

        if (!cardCode) {
            throw new NotFound(`Fornecedor da despesa ${sequenceSerial} não encontrado.`);
        }

        const documentLines = await ERPSAPB1Parser.getDocumentLinesFromItems(api, cardCode, documentItems.itemValues, documentItems.dynamicFields?.dynamicFields);

        const template: IDocumentTemplate = removeUndefinedEntriesFromObject({
            Document: {
                CardCode: cardCode,
                SequenceCode: sequenceCode,
                SequenceSerial: sequenceSerial,
                DocDate: docDate,
                DocDueDate: docDueDate,
                TaxDate: docDate,
                Comments: comments,
                DownPaymentType: 'dptInvoice',
                DocumentLines: documentLines,
                BPL_IDAssignedToInvoice: bplId ?? undefined,
                JournalMemo: journalMemo?.length > 0 ? journalMemo : undefined,
            },
        });

        if (dynamicFields) {
            ERPSAPB1Parser.setDynamicFields(template.Document, dynamicFields);
        }

        const purchaseDownPayment = await api.createPurchaseDownPayment(template);

        if (purchaseDownPayment instanceof ProcessError) {
            return purchaseDownPayment;
        }

        purchaseDownPayment.ParsedTotal = purchaseDownPayment.DocTotal?.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});

        if (!paymentExecution) {
            return purchaseDownPayment;
        }

        const executePayment = await api.createVendorPayment(ERPSAPB1Parser.getVendorPaymentTemplate(cardCode, purchaseDownPayment.DocEntry, 'it_PurchaseDownPayment', bplId, paymentExecution));

        if (executePayment instanceof ProcessError) {
            const hasCanceledPurchaseDownPayment = await api.cancelPurchaseDownPayment(purchaseDownPayment.DocEntry);
            if (!hasCanceledPurchaseDownPayment) {
                throw new UnprocessableEntity(`Não foi possível executar a baixa da despesa ${sequenceSerial} e o documento não pôde ser cancelado.`);
            }
            throw new UnprocessableEntity(`Não foi possível executar a baixa da despesa ${sequenceSerial} e o documento foi cancelado com sucesso.`);
        }

        return purchaseDownPayment;
    };

    const report = await reporter.getReport('ExternalId',{'Despesa Onfly': 'SequenceSerial', 'Documento': 'DocNum', 'Valor': 'ParsedTotal', 'Fornecedor': 'CardCode', 'Data do documento': 'DocDate'});

    return this.helpers.returnJsonArray(report);
}
