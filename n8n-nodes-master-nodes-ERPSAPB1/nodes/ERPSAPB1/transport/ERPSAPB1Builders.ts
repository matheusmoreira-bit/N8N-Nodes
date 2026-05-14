import { IDataObject } from 'n8n-workflow';

import {
    DebitOrCreditIndicator,
    IDocumentLine,
    IDynamicField,
    IJournalEntryLine,
} from './Interfaces';

interface IDynamicFieldCollection extends IDataObject {
    dynamicFields?: IDynamicField[];
}

interface ICostingCodeCollection extends IDataObject {
    costingCode?: string;
    costingCode2?: string;
    costingCode3?: string;
    costingCode4?: string;
}

export interface IPurchaseOrderLineInput extends IDataObject {
    itemCode: string;
    itemDescription: string;
    quantity: number;
    unitPrice: number;
    costingCode: string;
    projectCode: string;
    taxCode?: string;
    cfopCode?: string;
    usage?: number;
    warehouseCode?: string;
    costingCodes?: ICostingCodeCollection;
    dynamicFields?: IDynamicFieldCollection;
}

export interface IManualJournalLineInput extends IDataObject {
    accountCode: string;
    debitOrCreditIndicator: DebitOrCreditIndicator;
    amount: number;
    lineMemo: string;
    projectCode?: string;
    costingCode?: string;
    dueDate?: string;
    taxDate?: string;
    dynamicFields?: IDynamicFieldCollection;
}

function removeEmptyProperties<T extends IDataObject>(value: T): T {
    return Object.fromEntries(
        Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== ''),
    ) as T;
}

function removeEmptyPropertiesKeeping<T extends IDataObject>(value: T, keepEmptyStringKeys: string[]): T {
    return Object.fromEntries(
        Object.entries(value).filter(([entryKey, entryValue]) => {
            if (entryValue === '') {
                return keepEmptyStringKeys.includes(entryKey);
            }

            return entryValue !== undefined && entryValue !== null;
        }),
    ) as T;
}

export function applyDynamicFields<T extends IDataObject>(value: T, dynamicFields?: IDynamicField[]): T {
    const mutableValue = value as IDataObject;

    dynamicFields?.forEach((field) => {
        mutableValue[field.name] = field.value;
    });

    return value;
}

function toAmountInCents(value: number): number {
    return Math.round(Number(value) * 100);
}

export function buildPurchaseOrderLines(lineValues: IPurchaseOrderLineInput[]): IDocumentLine[] {
    if (!lineValues.length) {
        throw new Error('Informe ao menos um item para criar o pedido de compra.');
    }

    return lineValues.map((lineValue) => {
        if (!lineValue.itemCode || !lineValue.itemDescription || !lineValue.costingCode || !lineValue.projectCode) {
            throw new Error('Cada item deve conter ItemCode, ItemDescription, CostingCode e ProjectCode.');
        }

        if (lineValue.quantity === undefined || lineValue.unitPrice === undefined) {
            throw new Error('Cada item deve conter Quantity e UnitPrice.');
        }

        const documentLine = applyDynamicFields({
            ItemCode: lineValue.itemCode,
            ItemDescription: lineValue.itemDescription,
            TaxCode: lineValue.taxCode ?? '',
            Quantity: lineValue.quantity,
            UnitPrice: lineValue.unitPrice,
            CFOPCode: lineValue.cfopCode,
            Usage: lineValue.usage,
            WarehouseCode: lineValue.warehouseCode,
            CostingCode: lineValue.costingCode || lineValue.costingCodes?.costingCode,
            CostingCode2: lineValue.costingCodes?.costingCode2,
            CostingCode3: lineValue.costingCodes?.costingCode3,
            CostingCode4: lineValue.costingCodes?.costingCode4,
            ProjectCode: lineValue.projectCode,
        } as IDataObject, lineValue.dynamicFields?.dynamicFields);

        return removeEmptyPropertiesKeeping(documentLine, ['TaxCode']) as IDocumentLine;
    });
}

function isJournalBalanced(lineValues: IManualJournalLineInput[]): boolean {
    const totalDebit = lineValues
        .filter((lineValue) => lineValue.debitOrCreditIndicator === 'debit')
        .reduce((sum, lineValue) => sum + toAmountInCents(lineValue.amount), 0);

    const totalCredit = lineValues
        .filter((lineValue) => lineValue.debitOrCreditIndicator === 'credit')
        .reduce((sum, lineValue) => sum + toAmountInCents(lineValue.amount), 0);

    return totalDebit === totalCredit;
}

export function buildManualJournalLines(
    branchId: number | undefined,
    lineValues: IManualJournalLineInput[],
    businessPartnerCode?: string,
): IJournalEntryLine[] {
    if (lineValues.length < 2) {
        throw new Error('Informe ao menos duas linhas para o lancamento contabil manual.');
    }

    if (!isJournalBalanced(lineValues)) {
        throw new Error('As linhas de debito e credito precisam estar balanceadas.');
    }

    return lineValues.map((lineValue) => {
        const amount = Number(lineValue.amount).toFixed(2);
        const journalLine = applyDynamicFields({
            AccountCode: lineValue.accountCode,
            Debit: lineValue.debitOrCreditIndicator === 'debit' ? amount : '0.00',
            Credit: lineValue.debitOrCreditIndicator === 'credit' ? amount : '0.00',
            LineMemo: lineValue.lineMemo,
            BPLID: branchId,
            ShortName: businessPartnerCode,
            ProjectCode: lineValue.projectCode,
            CostingCode: lineValue.costingCode,
            DueDate: lineValue.dueDate,
            TaxDate: lineValue.taxDate,
        } as IDataObject, lineValue.dynamicFields?.dynamicFields);

        return removeEmptyProperties(journalLine) as IJournalEntryLine;
    });
}
