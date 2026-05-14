import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import {ERPSAPB1Api} from '../../../transport/ERPSAPB1Api';
import {
    ICardOptions,
    IDocumentItems,
    IDocumentTemplate,
    IDynamicFieldValue,
    IPurchaseDownPaymentToDraw,
    IPurchaseInvoice,
    ISalesOrder,
    ISAPB1OptionalFields,
    ISAPB1SupplierOptions,
    SAPB1DocumentObjectCode
} from '../../../transport/Interfaces';
import {OnflyNodes} from '../../../../../src/OnflyNodes';
import {extractDateFromDateTime, getDateInFutureDays} from '../../../../../src/date';
import {ERPSAPB1Parser} from '../../../transport/ERPSAPB1Parser';
import {RdvReporter} from '../../../../../src/reports/RdvReporter';
import {Company} from '../../../../../src/db/entity/Company';
import {advancePaymentRepository} from '../../../../../src/db/repository/AdvancePaymentRepository';
import {ProcessError} from '../../../../../src/db/entity/ProcessError';
import {IntegrationStatus} from '../../../../../src/IntegrationStatus';
import {NotFound} from '../../../../../src/errors/exceptions/NotFound';
import {UnprocessableEntity} from '../../../../../src/errors/exceptions/UnprocessableEntity';
import {expenseRepository} from '../../../../../src/db/repository/ExpenseRepository';


export async function rdv(this: IExecuteFunctions, api: ERPSAPB1Api): Promise<INodeExecutionData[]> {
    const companyId = this.getNodeParameter('companyId', 0) as number;

    const reporter = new RdvReporter<IPurchaseInvoice | ISalesOrder>(OnflyNodes.SAP_B1, this, companyId);

    reporter.onflyIdExtractor = (index: number) => this.getNodeParameter('sequenceSerial', index) as number;

    reporter.outputProvider = async (index: number, company: Company) => {
        const bplId = this.getNodeParameter('bplId', index, null) as number,
            sequenceCode = this.getNodeParameter('sequenceCode', index) as number,
            sequenceSerial = this.getNodeParameter('sequenceSerial', index) as number,
            docDateTime = new Date(this.getNodeParameter('docDate', index) as string),
            docDate = extractDateFromDateTime(docDateTime),
            docDueDate = getDateInFutureDays(docDateTime, this.getNodeParameter('dueDays', index) as number),
            comments = this.getNodeParameter('comments', index) as string,
            journalMemo = this.getNodeParameter('journalMemo', index) as string,
            advancePaymentsId = this.getNodeParameter('advancePaymentsId', index) as unknown[],
            reimbursableAmount = this.getNodeParameter('reimbursableAmount', index) as number,
            advanceAmount = this.getNodeParameter('advanceAmount', index) as number,
            useDraft = this.getNodeParameter('useDraft', index) as boolean,
            sendAsSalesOrder = this.getNodeParameter('sendAsSalesOrder', index, false) as boolean,
            {card} = this.getNodeParameter('cardOptions', index, {}) as ICardOptions,
            blueExpendituresId = card?.blueExpendituresId ?? [],
            documentItems = this.getNodeParameter('documentItems', index) as IDocumentItems,
            supplierOptions = this.getNodeParameter('supplierOptions', index) as ISAPB1SupplierOptions,
            {dynamicFields} = this.getNodeParameter('dynamicFields', index) as Partial<IDynamicFieldValue>,
            {sequenceModel} = this.getNodeParameter('optionalFields', index, {}) as ISAPB1OptionalFields;

        if (!documentItems.itemValues) {
            throw new NodeOperationError(this.getNode(), 'Itens do RDV não fornecidos.');
        }

        if (advancePaymentsId === undefined || advanceAmount === undefined || reimbursableAmount === undefined) {
            throw new NodeOperationError(this.getNode(), 'Array de adiantamentos, valor reembolsável ou valor adiantado não fornecidos.');
        }

        const cardCode = await api.getSupplierCardCode(supplierOptions, company);

        if (!cardCode) {
            throw new NotFound(`Colaborador do relatório ${sequenceSerial} não encontrado.`);
        }

        const purchaseDownPaymentsExternalIds: string[] = [];

        for (const blueExpenditureId of blueExpendituresId) {
            const blueExpense = await expenseRepository.findByOnflyId(company, OnflyNodes.SAP_B1, blueExpenditureId as string);
            if (!blueExpense || blueExpense.statusExternal !== IntegrationStatus.SUCCEEDED) {
                throw new UnprocessableEntity(`Despesa de Cartão Onfly ${blueExpenditureId} não integrada previamente, entre em contato caso a data da despesa ultrapassou um dia após a compra.`);
            }
            purchaseDownPaymentsExternalIds.push(blueExpense.externalId!);
        }

        for (const advancePaymentId of advancePaymentsId) {
            const advancePayment = await advancePaymentRepository.findByOnflyId(company, OnflyNodes.SAP_B1, advancePaymentId as string);
            if (!advancePayment || advancePayment.statusExternal !== IntegrationStatus.SUCCEEDED) {
                throw new UnprocessableEntity(`Adiantamento Onfly ${advancePaymentId} não integrado previamente, entre em contato para resolução.`);
            }
            purchaseDownPaymentsExternalIds.push(advancePayment.externalId!);
        }

        const purchaseDownPaymentsToDraw: IPurchaseDownPaymentToDraw[] = [];

        let drawnAmount = 0;

        for (const purchaseDownPaymentExternalId of purchaseDownPaymentsExternalIds) {
            const purchaseDownPaymentToDraw = await api.getPurchaseDownPaymentToDraw(purchaseDownPaymentExternalId);
            const remainingAmount = (Math.abs(reimbursableAmount) / 100) - drawnAmount;
            if (reimbursableAmount < 0 && remainingAmount !== 0) {
                if (purchaseDownPaymentToDraw.AmountToDraw - remainingAmount <= 0) {
                    drawnAmount += purchaseDownPaymentToDraw.AmountToDraw;
                    continue;
                }
                purchaseDownPaymentToDraw.AmountToDraw -= remainingAmount;
                drawnAmount += remainingAmount;
            }
            purchaseDownPaymentsToDraw.push(purchaseDownPaymentToDraw);
        }

        const documentLines = await ERPSAPB1Parser.getDocumentLinesFromItems(api, cardCode, documentItems.itemValues, documentItems.dynamicFields?.dynamicFields);

        const totalItemsAmount = documentLines.reduce((subtotal, item) => {
            subtotal += item.UnitPrice * item.Quantity;
            return subtotal;
        }, 0);

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
                DiscountPercent: (1 - ((reimbursableAmount + advanceAmount) / (totalItemsAmount * 100))) * 100,
                DocumentLines: documentLines,
            },
        };

        if (journalMemo) {
            template.Document.JournalMemo = journalMemo;
        }

        if (purchaseDownPaymentsToDraw.length && advanceAmount > 0) {
            template.Document.DownPaymentPercentage = 100;
            template.Document.DownPaymentsToDraw = purchaseDownPaymentsToDraw;
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

    const report = await reporter.getReport('ExternalId', {'RDV Onfly': 'SequenceSerial', 'Documento': 'DocNum', 'Valor': 'ParsedTotal', 'Fornecedor': 'CardCode', 'Data do documento': 'DocDate'});

    const rdvsToSync = await reporter.getEntitiesToSync((externalId: string) => {
        const parsedExternalId = ERPSAPB1Api.parseExternalId(externalId);
        if (parsedExternalId?.DocObjectCode === SAPB1DocumentObjectCode.SalesOrder) {
            return api.isSalesOrderPaid(externalId);
        }
        return api.isPurchaseInvoicePaid(externalId);
    });

    return this.helpers.returnJsonArray({...report, rdvsToSync});
}
