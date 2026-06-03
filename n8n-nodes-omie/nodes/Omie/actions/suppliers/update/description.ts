import { INodeProperties } from 'n8n-workflow';

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Código do cliente Omie',
        name: 'codigoClienteOmie',
        type: 'number',
        default: 0,
        description: 'Código do cliente no Omie para atualização',
        required: true,
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
    {
        displayName: 'Código de integração do cliente',
        name: 'codigoClienteIntegracao',
        type: 'string',
        default: '',
        description: 'Código de integração do cliente no sistema externo',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
    {
        displayName: 'Razão social',
        name: 'razaoSocial',
        type: 'string',
        default: '',
        description: 'Razão social do cliente/fornecedor',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
    {
        displayName: 'Nome fantasia',
        name: 'nomeFantasia',
        type: 'string',
        default: '',
        description: 'Nome fantasia do cliente/fornecedor',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
    {
        displayName: 'E-mail',
        name: 'email',
        type: 'string',
        default: '',
        description: 'E-mail do cliente/fornecedor',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
    {
        displayName: 'CPF/CNPJ',
        name: 'cpfCnpj',
        type: 'string',
        default: '',
        description: 'CPF ou CNPJ do cliente/fornecedor',
        displayOptions: {
            show: {
                operation: ['update'],
            },
        },
    },
];
