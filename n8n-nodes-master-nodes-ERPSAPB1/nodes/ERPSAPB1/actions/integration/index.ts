import * as adv from './adv';
import * as expense from './expense';
import * as invoice from './invoice';
import * as rdv from './rdv';
import * as transaction from './transaction';

import { INodeProperties } from 'n8n-workflow';

export {
    adv,
    expense,
    invoice,
    rdv,
    transaction,
};

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        displayOptions: {
            show: {
                resource: [
                    'integration',
                ],
            },
        },
        options: [
            {
                name: 'Fluxo de adiantamentos',
                value: 'adv',
                description: 'Sincroniza adiantamentos da Onfly com SAP B1.',
            },
            {
                name: 'Fluxo de despesas',
                value: 'expense',
                description: 'Sincroniza despesas da Onfly com SAP B1.',
            },
            {
                name: 'Fluxo de relatórios de despesas',
                value: 'rdv',
                description: 'Sincroniza relatórios de despesas da Onfly com SAP B1.',
            },
            {
                name: 'Fluxo de faturas',
                value: 'invoice',
                description: 'Sincroniza faturas da Onfly com SAP B1.',
            },
            {
                name: 'Fluxo de transações do cartão Onfly',
                value: 'transaction',
                description: 'Sincroniza transações do cartão Onfly com SAP B1.',
            },
        ],
        default: 'adv',
        description: 'A operação a ser realizada.',
    },
    ...adv.description,
    ...expense.description,
    ...invoice.description,
    ...rdv.description,
    ...transaction.description,
];
