import {
    AllEntities,
    Entity,
    PropertiesOf,
} from 'n8n-workflow';

type PagCorpMap = {
    expense: 'getByAccount',
};

export type PagCorpEntity = AllEntities<PagCorpMap>;
export type PagCorpExpense = Entity<PagCorpMap, 'expense'>;
export type ExpenseProperties = PropertiesOf<PagCorpExpense>;
