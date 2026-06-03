import { INodeProperties } from 'n8n-workflow';

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Página',
        name: 'page',
        type: 'number',
        default: 1,
        typeOptions: {
            minValue: 1,
        },
        description: 'Página a ser retornada pela API',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Registros por página',
        name: 'pageSize',
        type: 'number',
        default: 50,
        typeOptions: {
            minValue: 1,
            maxValue: 200,
        },
        description: 'Quantidade de registros por página',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Somente importado pela API',
        name: 'onlyApiImported',
        type: 'boolean',
        default: false,
        description: 'Retorna apenas registros criados pela API Omie',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'CPF/CNPJ',
        name: 'cpfCnpj',
        type: 'string',
        default: '',
        description: 'Filtra pelo CPF ou CNPJ do cliente/fornecedor',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Nome fantasia',
        name: 'nomeFantasia',
        type: 'string',
        default: '',
        description: 'Filtra pelo nome fantasia do cliente/fornecedor',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
];
