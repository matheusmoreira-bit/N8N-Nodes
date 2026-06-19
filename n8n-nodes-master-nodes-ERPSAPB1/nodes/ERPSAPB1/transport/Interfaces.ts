import { IDataObject } from 'n8n-workflow';

export enum SAPB1DocumentObjectCode {
    JournalEntry = 30,
    PurchaseDownPayment = 204,
    PurchaseInvoice = 18,
    PurchaseOrder = 22,
    SalesOrder = 17,
}

export interface ISAPB1ExternalId {
    SequenceSerial: string | number;
    CardCode: string;
    DocDate: string;
    DocObjectCode?: SAPB1DocumentObjectCode;
}

export interface IDocument extends IDataObject {
    CardCode: string;
    SequenceCode: number;
    SequenceSerial: string | number;
    SequenceModel?: string;
    DocDate: string;
    DocDueDate: string;
    TaxDate: string;
    Comments: string;
    BPL_IDAssignedToInvoice?: number;
    JournalMemo?: string;
    DiscountPercent?: number;
    DownPaymentType?: string;
    DocumentLines: IDocumentLine[];
    DownPaymentPercentage?: number;
    DownPaymentsToDraw?: IPurchaseDownPaymentToDraw[];
    HandWritten?: string;
    Printed?: string;
    DocNum?: number;
    DocObjectCode?: number;
    AttachmentEntry?: number;
    ExternalId?: string;
    DocTotal?: number;
    ParsedTotal?: string;
}

export interface IDocumentLine extends IDataObject {
    ItemCode: string;
    ItemDescription?: string;
    Quantity: number;
    UnitPrice: number;
    TaxCode?: string;
    Usage?: number;
    CFOPCode?: string;
    CostingCode?: string;
    CostingCode2?: string;
    CostingCode3?: string;
    CostingCode4?: string;
    ProjectCode?: string;
    AgreementNo?: number;
    WarehouseCode?: string;
    AccountCode?: string;
}

export interface IDocumentTemplate extends IDataObject {
    Document: IDocument;
}

export interface IPurchaseDownPayment extends IDocument {
    DocEntry: number;
    DocNum: number;
    DocumentStatus: string;
    PaidToDate: number;
}

export interface IPurchaseDownPaymentToDraw extends IDataObject {
    DocEntry: number;
    AmountToDraw: number;
}

export interface IPurchaseInvoice extends IDocument {
    DocEntry: number;
    DocNum: number;
    DocumentStatus: string;
}

export interface IPurchaseOrder extends IDocument {
    DocEntry: number;
    DocNum: number;
    DocumentStatus: string;
}

export declare type BlanketAgreementStatus = 'asApproved' | 'asTerminated' | 'asOnHold';

export interface IBlanketAgreementOptions {
    code?: number;
    status?: BlanketAgreementStatus;
    bpCode?: string;
    projectCode?: string;
}

export interface IBlanketAgreementFilters extends IDataObject {
    AgreementNo?: number;
    Status?: BlanketAgreementStatus;
    BPCode?: string;
    Project?: string;
}

interface IBlanketAgreementItemLine extends IDataObject {
    AgreementNo: number;
    ItemNo: string;
    PlannedQuantity: number;
    UnitPrice: number;
}

export interface IBlanketAgreement extends IDataObject {
    AgreementType: string;
    BPCode: string;
    BlanketAgreements_ItemsLines: IBlanketAgreementItemLine[];
    EndDate: string;
    Status: string;
}

export interface ICostingCodes extends IDataObject {
    costingCode?: string;
    costingCode2?: string;
    costingCode3?: string;
    costingCode4?: string;
}

interface ICostingCodesArray extends IDataObject {
    costingCode?: string[];
    costingCode2?: string[];
    costingCode3?: string[];
    costingCode4?: string[];
}

export interface IDocumentItemValueArray {
    itemCode: string[];
    taxCode: string[];
    cfopCode?: string[];
    unitPrice: number[];
    quantity: number[];
    usage?: number[];
    warehouseCode?: string[];
    costingCodes?: ICostingCodesArray;
}

export interface IDocumentItemValue {
    itemCode: string | string[];
    taxCode: string | string[];
    cfopCode?: string | string[];
    unitPrice: number | number[];
    quantity: number | number[];
    usage?: number | number[];
    warehouseCode?: string | string[];
    costingCodes?: ICostingCodes | ICostingCodesArray;
}

export interface IDynamicField extends IDataObject {
    name: keyof IDataObject;
    value: string;
}

export interface IDynamicFieldValue extends IDataObject {
    dynamicFields: IDynamicField[];
}

export interface IDocumentItems extends IDataObject {
    itemValues?: IDocumentItemValue;
    dynamicFields?: {
        dynamicFields: IDynamicFieldValue;
    };
}

export interface IDocNum extends IDataObject {
    DocNum: number;
}

interface IAttachmentLine extends IDataObject {
    AbsoluteEntry: number;
    LineNum: number;
    SourcePath: string;
    FileName: string;
    FileExtension: string;
    AttachmentDate: string;
    Override: string;
    FreeText: string | null;
    CopyToTargetDoc: string;
}

export interface IAttachment extends IDataObject {
    AbsoluteEntry: number;
    Attachments2_Lines: IAttachmentLine[];
}

export interface IBPFiscalTaxID extends IDataObject {
    BPCode: string;
    TaxId0: string | null;
    TaxId4: string | null;
}

export interface IBPFiscalTaxIDCollection extends IDataObject {
    'BusinessPartners/BPFiscalTaxIDCollection': IBPFiscalTaxID;
}

export interface IQueryResponse<T extends IDataObject> extends IDataObject {
    'odata.metadata': string;
    value: T[];
    'odata.nextLink'?: string;
    '@odata.nextLink'?: string;
    'odata.nextlink'?: string;
    '@odata.nextlink'?: string;
}

export interface ISAPB1SupplierOptions {
    cardCode?: string;
    useSupplierMapper: boolean;
    employeeId?: number;
    supplierDocument?: string;
}

export interface IItem extends IDataObject {
    ItemCode: string;
    ItemName: string;
}

export interface IDistributionRuleLine extends IDataObject {
    CenterCode: string;
    TotalInCenter: number;
}

export interface IDistributionRule extends IDataObject {
    FactorCode: string;
    FactorDescription: string;
    TotalFactor: number;
    DistributionRuleLines: IDistributionRuleLine[];
}

export interface ISAPB1OptionalFields {
    sequenceModel?: string;
}

export interface IDistributionRuleOptions {
    code?: string;
    isActive?: boolean;
    inWhichDimension?: number;
    description?: string;
}

export interface IDistributionRuleFilters extends IDataObject {
    FactorCode?: string;
    FactorDescription?: string;
    InWhichDimension?: number;
    Active?: boolean;
}

export interface IItemOptions {
    code?: string;
    name?: string;
    groupCode?: number;
    isValid?: boolean;
}

export interface IItemFilters extends IDataObject {
    ItemCode?: string;
    ItemName?: string;
    ItemsGroupCode?: number;
    Valid?: boolean;
}

export interface IItemGroupOptions {
    code?: number;
    name?: string;
}

export interface IItemGroupFilters extends IDataObject {
    Number?: number;
    GroupName?: string;
}

export interface IItemGroup extends IDataObject {
    Number: number;
    GroupName: string;
}

export interface IDimensionOptions {
    code?: number;
    isActive?: boolean;
    name?: string;
    description?: string;
}

export interface IDimensionFilters extends IDataObject {
    DimensionName?: string;
    DimensionDescription?: string;
    DimensionCode?: number;
    IsActive?: boolean;
}

export interface IDimension extends IDataObject {
    DimensionCode: number;
    DimensionName: string;
    DimensionDescription: string;
}

export interface ISAPB1RequestTemplate<F extends IDataObject> {
    select?: string[];
    expand?: string;
    filters?: F;
    orderBy?: string;
}

export interface ICostCenterTypeOptions {
    code?: number;
    name?: string;
}

export interface ICostCenterTypeFilters extends IDataObject {
    CostCenterTypeCode?: string;
    CostCenterTypeName?: string;
}

export interface ICostCenterType extends IDataObject {
    CostCenterTypeCode: string;
    CostCenterTypeName: string;
}

export interface IProfitCenterOptions {
    code?: number;
    name?: string;
    isActive?: boolean;
    inWhichDimension?: number;
}

export interface IProfitCenterFilters extends IDataObject {
    CenterCode?: string;
    CenterName?: string;
    Active?: string;
    InWhichDimension?: number;
}

export interface IProfitCenter extends IDataObject {
    CenterCode: string;
    CenterName: string;
    CostCenterType: string | null;
    CostCenterType2: ICostCenterType | null;
    CenterOwner: number | null;
    InWhichDimension: number;
}

export interface IProjectOptions {
    code?: number;
    name?: string;
    isActive?: boolean;
}

export interface IProjectFilters extends IDataObject {
    Code?: string;
    Name?: string;
    Active?: string;
}

export interface IProject extends IDataObject {
    Code: string;
    Name: string;
    Active: string;
}

export declare type InvoiceType = 'it_PurchaseDownPayment' | 'it_PurchaseInvoice';

export interface IPaymentExecution {
    transferAccount: string;
    transferDate: Date;
    transferSum: number;
    journalRemarks: string;
}

export interface IPaymentExecutionOptions {
    paymentExecution?: IPaymentExecution;
}

export interface IVendorPaymentInvoiceEntry extends IDataObject {
    DocEntry: number;
    InvoiceType: InvoiceType;
}

export interface IVendorPaymentTemplate extends IDataObject {
    CardCode: string;
    BPLID?: number;
    PaymentInvoices: IVendorPaymentInvoiceEntry[];
    JournalRemarks: string;
    TransferAccount: string;
    TransferSum: number;
    TransferDate: string;
    DocDate: string;
    TaxDate: string;
}

export interface IVendorPayment extends IVendorPaymentTemplate {
    DocEntry: number;
}

export interface IVendorPaymentInvoiceLine extends IDataObject {
    DocEntry: number;
    SumApplied: number;
    InvoiceType: InvoiceType;
}

export interface IVendorPaymentRequest extends IDataObject {
    DocDate: string;
    TaxDate: string;
    CardCode: string;
    DocCurrency?: string;
    DocRate?: number;
    LocalCurrency?: 'tYES' | 'tNO';
    CashAccount?: string;
    CashSum?: number;
    Remarks?: string;
    PaymentInvoices: IVendorPaymentInvoiceLine[];
}

export interface ICardOptions {
    card?: {
        blueExpendituresId: unknown[],
    };
}

export interface ISalesOrder extends IDocument {
    DocEntry: number;
    DocNum: number;
    DocumentStatus: string;
}

export type DebitOrCreditIndicator = 'debit' | 'credit';

export interface ILineEntryValue {
    accountCode: string;
    debitOrCreditIndicator: DebitOrCreditIndicator;
    amount: number;
    lineMemo: string;
}

export interface ILineEntries extends IDataObject {
    lineEntryValues?: ILineEntryValue[];
    dynamicFields?: Array<{
        dynamicFields: IDynamicFieldValue;
    }>;
}

export interface IJournalEntryLine extends IDataObject {
    AccountCode: string;
    Debit: number | string;
    Credit: number | string;
    LineMemo: string;
    BPLID?: number;
    ShortName?: string;
    ProjectCode?: string;
    CostingCode?: string;
    DueDate?: string;
    TaxDate?: string;
}

export interface IJournalEntryTemplate extends IDataObject {
    ReferenceDate: string;
    DueDate: string;
    TaxDate: string;
    Memo: string;
    JournalEntryLines: IJournalEntryLine[];
}

export interface IJournalEntry extends IJournalEntryTemplate {
    JdtNum: number;
    Number: number;
}

export interface ICreatedJournalEntry extends IJournalEntry {
    ExternalId: string;
}
