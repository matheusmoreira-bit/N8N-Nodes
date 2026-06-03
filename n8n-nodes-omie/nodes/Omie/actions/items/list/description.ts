import { INodeProperties } from 'n8n-workflow';

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Buscar Todas as Páginas',
        name: 'returnAll',
        type: 'boolean',
        default: true,
        description: 'Busca automaticamente todas as páginas retornadas pelo Omie',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Máximo de Itens',
        name: 'maxItems',
        type: 'number',
        default: 0,
        typeOptions: {
            minValue: 0,
        },
        description: 'Quantidade máxima de itens a buscar. Use 0 para não limitar.',
        displayOptions: {
            show: {
                operation: ['list'],
                returnAll: [true],
            },
        },
    },
    {
        displayName: 'Página Inicial',
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
                returnAll: [false],
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
        displayName: 'Código do item Omie',
        name: 'codigoItemOmie',
        type: 'string',
        default: '',
        description: 'Filtra pelo código do item no Omie',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Descrição',
        name: 'descricao',
        type: 'string',
        default: '',
        description: 'Filtra pela descrição do item',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
];
