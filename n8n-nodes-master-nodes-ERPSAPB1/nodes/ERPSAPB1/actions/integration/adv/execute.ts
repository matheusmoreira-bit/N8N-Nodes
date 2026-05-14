import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import {ERPSAPB1Api} from '../../../transport/ERPSAPB1Api';
import {extractDateFromDateTime, getDateInFutureDays} from '../../../../../src/date';
import {
    IDocumentItems,
    IDocumentTemplate,
    IDynamicFieldValue,
    IPaymentExecutionOptions,
    IPurchaseDownPayment,
    ISAPB1SupplierOptions
} from '../../../transport/Interfaces';
import {OnflyNodes} from '../../../../../src/OnflyNodes';
import {ERPSAPB1Parser} from '../../../transport/ERPSAPB1Parser';
import {AdvancePaymentReporter} from '../../../../../src/reports/AdvancePaymentReporter';
import {ProcessError} from '../../../../../src/db/entity/ProcessError';
import {Company} from '../../../../../src/db/entity/Company';
import {NotFound} from '../../../../../src/errors/exceptions/NotFound';
import {UnprocessableEntity} from '../../../../../src/errors/exceptions/UnprocessableEntity';

export async function adv(this: IExecuteFunctions, api: ERPSAPB1Api): Promise<INodeExecutionData[]> {
    const companyId = this.getNodeParameter('companyId', 0) as number;

    const reporter = new AdvancePaymentReporter<IPurchaseDownPayment>(OnflyNodes.SAP_B1, this, companyId);

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
            useDraft = this.getNodeParameter('useDraft', index) as boolean,
            documentItems = this.getNodeParameter('documentItems', index) as IDocumentItems,
            {dynamicFields} = this.getNodeParameter('dynamicFields', index) as Partial<IDynamicFieldValue>,
            supplierOptions = this.getNodeParameter('supplierOptions', index) as ISAPB1SupplierOptions,
            {paymentExecution} = this.getNodeParameter('paymentExecutionOptions', index, {}) as IPaymentExecutionOptions;

        if (!documentItems.itemValues) {
            throw new NodeOperationError(this.getNode(), 'Itens do Adiantamento não fornecidos.');
        }

        const cardCode = await api.getSupplierCardCode(supplierOptions, company);

        if (!cardCode) {
            throw new NotFound(`Fornecedor do adiantamento ${sequenceSerial} não encontrado.`);
        }

        const documentLines = await ERPSAPB1Parser.getDocumentLinesFromItems(api, cardCode, documentItems.itemValues, documentItems.dynamicFields?.dynamicFields);

        const template: IDocumentTemplate = {
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
            },
        };

        if (bplId) {
            template.Document.BPL_IDAssignedToInvoice = bplId;
        }

        if (journalMemo) {
            template.Document.JournalMemo = journalMemo;
        }

        if (dynamicFields) {
            ERPSAPB1Parser.setDynamicFields(template.Document, dynamicFields);
        }

        const purchaseDownPayment = await api.createPurchaseDownPayment(template, useDraft);

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
                throw new UnprocessableEntity(`Não foi possível executar a baixa do adiantamento ${sequenceSerial} e o documento não pôde ser cancelado.`);
            }
            throw new UnprocessableEntity(`Não foi possível executar a baixa do adiantamento ${sequenceSerial} e o documento foi cancelado com sucesso.`);
        }

        return purchaseDownPayment;
    };

    const report = await reporter.getReport('ExternalId',{'Adiantamento Onfly': 'SequenceSerial', 'Documento': 'DocNum', 'Valor': 'ParsedTotal', 'Fornecedor': 'CardCode', 'Data do documento': 'DocDate'});

    const advancePaymentsToSync = await reporter.getEntitiesToSync((externalId: string) => api.isPurchaseDownPaymentPaid(externalId));

    return this.helpers.returnJsonArray({...report, advancePaymentsToSync});
}
