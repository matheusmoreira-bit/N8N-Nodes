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
        displayName: 'Apenas importado pela API',
        name: 'onlyApiImported',
        type: 'boolean',
        default: false,
        description: 'Retorna somente registros criados pela API Omie',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Ordenar em ordem decrescente',
        name: 'orderDescending',
        type: 'boolean',
        default: false,
        description: 'Busca os resultados em ordem decrescente',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Data inicial',
        name: 'dateFrom',
        type: 'dateTime',
        default: '',
        description: 'Filtra registros a partir desta data de vencimento',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Data final',
        name: 'dateTo',
        type: 'dateTime',
        default: '',
        description: 'Filtra registros até esta data de vencimento',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
];
