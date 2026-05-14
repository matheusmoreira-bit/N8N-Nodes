import * as getByAccount from './getByAccount';

import { INodeProperties } from 'n8n-workflow';

export {
    getByAccount,
};

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['expense'],
            },
        },
        options: [
            {
                name: 'Get Expenses by Account',
                value: 'getByAccount',
                description: 'Autentica, faz login e retorna despesas paginadas por conta',
            },
        ],
        default: 'getByAccount',
        description: 'Operação a ser executada.',
    },
    ...getByAccount.description,
];
