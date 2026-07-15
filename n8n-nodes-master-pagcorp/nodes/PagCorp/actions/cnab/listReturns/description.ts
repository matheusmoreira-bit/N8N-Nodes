import { CnabProperties } from '../../Interfaces';

export const cnabListReturnsDescription: CnabProperties = [
    {
        displayName: 'Endpoint Path',
        name: 'cnabListReturnsEndpointPath',
        type: 'string',
        required: true,
        default: 'CNAB/Return',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['listReturns'],
            },
        },
        description: 'Caminho relativo ao API Base URL usado para buscar retornos CNAB',
    },
    {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        required: false,
        default: '',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['listReturns'],
            },
        },
        description: 'Data inicial. Se vazio, usa o dia de hoje',
    },
    {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        required: false,
        default: '',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['listReturns'],
            },
        },
        description: 'Data final. Se vazio, usa o dia de hoje',
    },
    {
        displayName: 'Split Out Items',
        name: 'splitItems',
        type: 'boolean',
        required: true,
        default: true,
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['listReturns'],
            },
        },
        description: 'Se ativo, retorna cada retorno como item individual do n8n',
    },
    {
        displayName: 'Additional Fields',
        name: 'cnabListReturnsAdditionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['listReturns'],
            },
        },
        options: [
            {
                displayName: 'End Date Query Name',
                name: 'endDateQueryName',
                type: 'string',
                default: 'endDate',
                description: 'Nome do parametro de query usado para a data final',
            },
            {
                displayName: 'Query Parameters JSON',
                name: 'queryParametersJson',
                type: 'json',
                default: '{}',
                description: 'Objeto JSON enviado como query string alem das datas',
            },
            {
                displayName: 'Start Date Query Name',
                name: 'startDateQueryName',
                type: 'string',
                default: 'startDate',
                description: 'Nome do parametro de query usado para a data inicial',
            },
        ],
    },
];
