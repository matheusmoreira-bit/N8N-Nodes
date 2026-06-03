import { INodeProperties } from 'n8n-workflow';

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Código do produto Omie',
        name: 'codigoProdutoOmie',
        type: 'string',
        default: '',
        required: true,
        description: 'Código do produto no Omie para atualização',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
    {
        displayName: 'Código de integração do produto',
        name: 'codigoProdutoIntegracao',
        type: 'string',
        default: '',
        description: 'Código de integração do produto no sistema externo',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
    {
        displayName: 'Descrição',
        name: 'descricao',
        type: 'string',
        default: '',
        description: 'Descrição do produto/serviço',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
    {
        displayName: 'Unidade',
        name: 'unidade',
        type: 'string',
        default: '',
        description: 'Unidade de medida do produto/serviço',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
    {
        displayName: 'NCM',
        name: 'ncm',
        type: 'string',
        default: '',
        description: 'Código NCM do produto/serviço',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
];
