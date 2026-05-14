import {
    IDocument,
    IDocumentItemValue,
    IDocumentItemValueArray,
    IDocumentLine,
    IDynamicField,
    IDynamicFieldValue,
    IJournalEntryLine,
    IJournalEntryTemplate,
    ILineEntries,
    ILineEntryValue,
    InvoiceType,
    IPaymentExecution,
    IVendorPaymentTemplate
} from './Interfaces';
import {ERPSAPB1Api} from './ERPSAPB1Api';
import {arraysMatchesSizes, removeUndefinedEntriesFromObject, toArray, toCollectionArray} from '../../../src/helpers';
import {extractDateFromDateTime} from '../../../src/date';
import {BreakError} from '../../../src/errors/exceptions/BreakError';
import {UnprocessableEntity} from '../../../src/errors/exceptions/UnprocessableEntity';

export class ERPSAPB1Parser {

    public static setDynamicFields<T extends Partial<IDocument | IDocumentLine | IJournalEntryTemplate>>(template: T, dynamicFields?: IDynamicField[]): void {
        dynamicFields?.forEach(field => {
            template[field.name] = field.value;
        });
    }

    private static getDynamicDocumentLineItems(documentItemValueArray: IDocumentItemValueArray, dynamicItemFields?: IDynamicFieldValue): Array<Partial<IDocumentLine>> {
        const dynamicFields = dynamicItemFields?.dynamicFields ? toCollectionArray(dynamicItemFields.dynamicFields.reduce((dynamicItemField, dynamicField) => {
            dynamicItemField[dynamicField.name] = dynamicField.value;
            return dynamicItemField;
        }, {} as Partial<IDocumentLine>)) : [];
        if (dynamicFields.length && !arraysMatchesSizes<number | Partial<IDocumentLine>>(documentItemValueArray.quantity, dynamicFields)) {
            throw new Error('Campos dinâmicos insuficientes para a quantidade de itens.');
        }
        return dynamicFields;
    }

    private static ensureArraySize(documentItem: IDocumentItemValue): IDocumentItemValueArray {
        const documentItemArray: IDocumentItemValueArray = {
            itemCode: toArray(documentItem.itemCode),
            taxCode: toArray(documentItem.taxCode),
            unitPrice: toArray(documentItem.unitPrice),
            quantity: toArray(documentItem.quantity),
        };
        if (documentItem.cfopCode) {
            documentItemArray.cfopCode = toArray(documentItem.cfopCode);
        }
        if (documentItem.usage) {
            documentItemArray.usage = toArray(documentItem.usage);
        }
        if (documentItem.warehouseCode) {
            documentItemArray.warehouseCode = toArray(documentItem.warehouseCode);
        }
        if (!arraysMatchesSizes<number | string>(documentItemArray.itemCode, documentItemArray.taxCode, documentItemArray.unitPrice, documentItemArray.quantity)) {
            throw new Error('O tamanho dos atributos dos itens enviados não coincide.');
        }
        if (documentItem.costingCodes) {
            documentItemArray.costingCodes = {};
            documentItemArray.costingCodes.costingCode = documentItem.costingCodes.costingCode ? toArray(documentItem.costingCodes.costingCode) : undefined;
            documentItemArray.costingCodes.costingCode2 = documentItem.costingCodes.costingCode2 ? toArray(documentItem.costingCodes.costingCode2) : undefined;
            documentItemArray.costingCodes.costingCode3 = documentItem.costingCodes.costingCode3 ? toArray(documentItem.costingCodes.costingCode3): undefined;
            documentItemArray.costingCodes.costingCode4 = documentItem.costingCodes.costingCode4 ? toArray(documentItem.costingCodes.costingCode4) : undefined;
        }
        return documentItemArray;
    }

    public static async getDocumentLinesFromItems(api: ERPSAPB1Api, cardCode: string, documentItem: IDocumentItemValue, dynamicItemFields?: IDynamicFieldValue): Promise<IDocumentLine[]> {
        const documentLines: IDocumentLine[] = [];
        const documentItemArray = ERPSAPB1Parser.ensureArraySize(documentItem);
        const itemCode = documentItemArray.itemCode?.[0];
        if (!itemCode) {
            throw new Error('Não é possível enviar um documento sem itens.');
        }
        const dynamicDocumentLineItems = ERPSAPB1Parser.getDynamicDocumentLineItems(documentItemArray, dynamicItemFields);
        const agreementNumber = await api.getBlanketAgreementNumberByBPCodeAndItemNumber(cardCode, itemCode);
        for (let i = 0; i < documentItemArray.itemCode.length; i++) {
            const documentLine: IDocumentLine = {
                ItemCode: documentItemArray.itemCode?.[i] ?? '',
                TaxCode: documentItemArray.taxCode?.[i] ?? '',
                CFOPCode: documentItemArray.cfopCode?.[i] ?? undefined,
                Usage: documentItemArray.usage?.[i] ?? undefined,
                Quantity: documentItemArray.quantity?.[i] ?? 0,
                UnitPrice: documentItemArray.unitPrice?.[i] ?? 0,
                WarehouseCode: documentItemArray.warehouseCode?.[i] ?? undefined,
                AgreementNo: agreementNumber ?? undefined,
                CostingCode: documentItemArray?.costingCodes?.costingCode?.[i] ?? undefined,
                CostingCode2: documentItemArray?.costingCodes?.costingCode2?.[i] ?? undefined,
                CostingCode3: documentItemArray?.costingCodes?.costingCode3?.[i] ?? undefined,
                CostingCode4: documentItemArray?.costingCodes?.costingCode4?.[i] ?? undefined,
                ...dynamicDocumentLineItems[i] ?? {},
            };
            documentLines.push(removeUndefinedEntriesFromObject(documentLine));
        }
        return documentLines;
    }

    public static getVendorPaymentTemplate(cardCode: string, docEntry: number, invoiceType: InvoiceType, branchId: number | null, paymentExecutionOptions: IPaymentExecution): IVendorPaymentTemplate {
        const paymentDate = extractDateFromDateTime(new Date(paymentExecutionOptions.transferDate), 'YYYY-MM-DD\T00:00:00\Z');
        return removeUndefinedEntriesFromObject({
            CardCode: cardCode,
            BPLID: branchId ?? undefined,
            PaymentInvoices: [
                {
                    DocEntry: docEntry,
                    InvoiceType: invoiceType,
                },
            ],
            TransferAccount: paymentExecutionOptions.transferAccount,
            TransferSum: paymentExecutionOptions.transferSum,
            TransferDate: paymentDate,
            TaxDate: paymentDate,
            DocDate: paymentDate,
            JournalRemarks: paymentExecutionOptions.journalRemarks,
        });
    }

    private static getJournalLineEntries(branchId: number, lineEntryValues: ILineEntryValue[], dynamicItemFields?: IDynamicFieldValue): IJournalEntryLine[] {
        const dynamicFields = dynamicItemFields?.dynamicFields ? toCollectionArray(dynamicItemFields.dynamicFields.reduce((dynamicItemField, dynamicField) => {
            dynamicItemField[dynamicField.name] = dynamicField.value;
            return dynamicItemField;
        }, {} as Partial<IJournalEntryLine>)) : [];
        return lineEntryValues.map((lineEntry, i) => {
           const amount = (lineEntry.amount / 100).toFixed(2);
           return {
               BPLID: branchId,
               AccountCode: lineEntry.accountCode,
               LineMemo: lineEntry.lineMemo,
               Credit: lineEntry.debitOrCreditIndicator === 'credit' ? amount : '0.00',
               Debit: lineEntry.debitOrCreditIndicator === 'debit' ? amount : '0.00',
               ...dynamicFields[i] ?? {},
           };
        });
    }

    private static isJournalBalanced(lines: ILineEntryValue[]): boolean {
        const totalDebit = lines
            .filter(line => line.debitOrCreditIndicator === 'debit')
            .reduce((sum, line) => sum + line.amount, 0);

        const totalCredit = lines
            .filter(line => line.debitOrCreditIndicator === 'credit')
            .reduce((sum, line) => sum + line.amount, 0);

        return totalDebit === totalCredit;
    }

    public static getJournalEntryTemplate(branchId: number, template: Partial<IJournalEntryTemplate>, lineEntries: ILineEntries): Partial<IJournalEntryTemplate> {
        if (!lineEntries.lineEntryValues) {
            throw new BreakError('É necessário ao menos duas linhas para o lançamento contábil manual (Crédito / Débito).');
        }
        if (!ERPSAPB1Parser.isJournalBalanced(lineEntries.lineEntryValues)) {
            throw new UnprocessableEntity('Linhas de débito e crédito não balanceadas.');
        }
        return {
            ...template,
            JournalEntryLines: ERPSAPB1Parser.getJournalLineEntries(branchId, lineEntries.lineEntryValues, lineEntries.dynamicFields?.[0]?.dynamicFields),
        };
    }

}
