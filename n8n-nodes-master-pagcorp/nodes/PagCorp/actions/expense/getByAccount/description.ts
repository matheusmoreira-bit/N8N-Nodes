import { ExpenseProperties } from '../../Interfaces';

export const expenseGetByAccountDescription: ExpenseProperties = [
    {
        displayName: 'Account ID',
        name: 'accountId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['expense'],
                operation: ['getByAccount'],
            },
        },
        description: 'Identificador da conta no endpoint /Expense/Account/{accountId}',
    },
    {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        required: false,
        default: '',
        displayOptions: {
            show: {
                resource: ['expense'],
                operation: ['getByAccount'],
            },
        },
        description: 'Data inicial. Se vazio, usa o primeiro dia do mês atual',
    },
    {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        required: false,
        default: '',
        displayOptions: {
            show: {
                resource: ['expense'],
                operation: ['getByAccount'],
            },
        },
        description: 'Data final. Se vazio, usa a data de hoje',
    },
    {
        displayName: 'Split Out Items',
        name: 'splitItems',
        type: 'boolean',
        required: true,
        default: true,
        displayOptions: {
            show: {
                resource: ['expense'],
                operation: ['getByAccount'],
            },
        },
        description: 'Se ativo, retorna cada item de despesa como item individual do n8n',
    },
];
