import { AllEntities, Entity, PropertiesOf } from 'n8n-workflow';
type PagCorpMap = {
    expense: 'getByAccount';
    cnab: 'upload' | 'listReturns' | 'downloadReturn';
};
export type PagCorpEntity = AllEntities<PagCorpMap>;
export type PagCorpExpense = Entity<PagCorpMap, 'expense'>;
export type PagCorpCnab = Entity<PagCorpMap, 'cnab'>;
export type ExpenseProperties = PropertiesOf<PagCorpExpense>;
export type CnabProperties = PropertiesOf<PagCorpCnab>;
export {};
