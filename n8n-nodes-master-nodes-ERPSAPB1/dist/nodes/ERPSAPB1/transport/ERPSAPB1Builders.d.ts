import { IDataObject } from 'n8n-workflow';
import { DebitOrCreditIndicator, IDocumentLine, IDynamicField, IJournalEntryLine } from './Interfaces';
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
    costingCode?: string;
    projectCode?: string;
    taxCode?: string;
    cfopCode?: string;
    usage?: number;
    warehouseCode?: string;
    accountCode?: string;
    tipoLancamento?: string;
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
export declare function applyDynamicFields<T extends IDataObject>(value: T, dynamicFields?: IDynamicField[]): T;
export declare function buildPurchaseOrderLines(lineValues: IPurchaseOrderLineInput[]): IDocumentLine[];
export declare function buildManualJournalLines(branchId: number | undefined, lineValues: IManualJournalLineInput[], businessPartnerCode?: string): IJournalEntryLine[];
export {};
