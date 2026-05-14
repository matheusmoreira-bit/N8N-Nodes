import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import {ERPSAPB1Api} from '../../../transport/ERPSAPB1Api';
import {
    IDocumentItems,
    IDocumentTemplate,
    IDynamicFieldValue,
    IPurchaseInvoice,
    ISalesOrder,
    ISAPB1OptionalFields
} from '../../../transport/Interfaces';
import {OnflyNodes} from '../../../../../src/OnflyNodes';
import {extractDateFromDateTime} from '../../../../../src/date';
import {ERPSAPB1Parser} from '../../../transport/ERPSAPB1Parser';
import {InvoiceReporter} from '../../../../../src/reports/InvoiceReporter';
import {ProcessError} from '../../../../../src/db/entity/ProcessError';


export async function invoice(this: IExecuteFunctions, api: ERPSAPB1Api): Promise<INodeExecutionData[]> {
    const companyId = this.getNodeParameter('companyId', 0) as number;

    const reporter = new InvoiceReporter<IPurchaseInvoice | ISalesOrder>(OnflyNodes.SAP_B1, this, companyId);

    reporter.onflyIdExtractor = (index: number) => this.getNodeParameter('sequenceSerial', index) as number;

    reporter.outputProvider = async (index: number) => {
        const bplId = this.getNodeParameter('bplId', index) as number,
            cardCode = this.getNodeParameter('cardCode', index) as string,
            sequenceCode = this.getNodeParameter('sequenceCode', index) as number,
            sequenceSerial = this.getNodeParameter('sequenceSerial', index) as number,
            docDateTime = new Date(this.getNodeParameter('docDate', index) as string),
            docDate = extractDateFromDateTime(docDateTime),
            docDueDateTime = new Date(this.getNodeParameter('dueDate', index) as string),
            docDueDate = extractDateFromDateTime(docDueDateTime),
            comments = this.getNodeParameter('comments', index) as string,
            journalMemo = this.getNodeParameter('journalMemo', index) as string,
            itemsAmount = this.getNodeParameter('itemsAmount', index) as number,
            refundedAmount = this.getNodeParameter('refundedAmount', index) as number,
            useDraft = this.getNodeParameter('useDraft', index) as boolean,
            sendAsSalesOrder = this.getNodeParameter('sendAsSalesOrder', index, false) as boolean,
            documentItems = this.getNodeParameter('documentItems', index) as IDocumentItems,
            {dynamicFields} = this.getNodeParameter('dynamicFields', index) as Partial<IDynamicFieldValue>,
            {sequenceModel} = this.getNodeParameter('optionalFields', index, {}) as ISAPB1OptionalFields;

        if (!sequenceSerial) {
            throw new NodeOperationError(this.getNode(), 'Id Fatura não fornecido.');
        }

        if (!documentItems.itemValues) {
            throw new NodeOperationError(this.getNode(), 'Itens da fatura não fornecidos.');
        }

        const documentLines = await ERPSAPB1Parser.getDocumentLinesFromItems(api, cardCode, documentItems.itemValues, documentItems.dynamicFields?.dynamicFields);

        const template: IDocumentTemplate = {
            Document: {
                BPL_IDAssignedToInvoice: bplId,
                CardCode: cardCode,
                SequenceCode: sequenceCode,
                SequenceSerial: sequenceSerial,
                DocDate: docDate,
                DocDueDate: docDueDate,
                TaxDate: docDate,
                Comments: comments,
                DiscountPercent: 100 - ((1 - (refundedAmount / itemsAmount)) * 100),
                DocumentLines: documentLines,
            },
        };

        if (journalMemo) {
            template.Document.JournalMemo = journalMemo;
        }

        if (sequenceModel) {
            template.Document.SequenceModel = sequenceModel;
        }

        if (dynamicFields) {
            ERPSAPB1Parser.setDynamicFields(template.Document, dynamicFields);
        }

        const insertedDocument: IPurchaseInvoice | ISalesOrder | ProcessError = sendAsSalesOrder ? await api.createSalesOrder(template, useDraft) : await api.createPurchaseInvoice(template, useDraft);

        if (!(insertedDocument instanceof ProcessError)) {
            insertedDocument.ParsedTotal = insertedDocument.DocTotal?.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
        }

        return insertedDocument;
    };

    const report = await reporter.getReport('ExternalId', {'Fatura Onfly': 'SequenceSerial', 'Documento': 'DocNum', 'Valor': 'ParsedTotal', 'Fornecedor': 'CardCode', 'Data do documento': 'DocDate'});

    return this.helpers.returnJsonArray(report);
}
