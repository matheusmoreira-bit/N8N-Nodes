import {
    AllEntities,
    Entity,
    PropertiesOf,
} from 'n8n-workflow';

type ERPSAPB1Map = {
    attachments: 'list' | 'create',
    general: 'blanketAgreement' | 'dimension' | 'distribution' | 'item' | 'itemGroup' | 'costCenterType' | 'profitCenter' | 'project' | 'genericQuery',
    debug: 'getInvoice' | 'getPayment' | 'getSalesOrder',
    inclusion: 'purchaseOrder' | 'manualJournalEntry' | 'vendorPayment',
    item: 'create' | 'createGroup' | 'updateField',
    supplier: 'getByDocument' | 'list' | 'create' | 'updateField',
};

export type ERPSAPB1 = AllEntities<ERPSAPB1Map>;

export type ERPSAPB1Attachments = Entity<ERPSAPB1Map, 'attachments'>;
export type ERPSAPB1General = Entity<ERPSAPB1Map, 'general'>;
export type ERPSAPB1Debug = Entity<ERPSAPB1Map, 'debug'>;
export type ERPSAPB1Inclusion = Entity<ERPSAPB1Map, 'inclusion'>;
export type ERPSAPB1Item = Entity<ERPSAPB1Map, 'item'>;
export type ERPSAPB1Supplier = Entity<ERPSAPB1Map, 'supplier'>;

export type AttachmentsProperties = PropertiesOf<ERPSAPB1Attachments>;
export type GeneralProperties = PropertiesOf<ERPSAPB1General>;
export type DebugProperties = PropertiesOf<ERPSAPB1Debug>;
export type InclusionProperties = PropertiesOf<ERPSAPB1Inclusion>;
export type ItemProperties = PropertiesOf<ERPSAPB1Item>;
export type SupplierProperties = PropertiesOf<ERPSAPB1Supplier>;
