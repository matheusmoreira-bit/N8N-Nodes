import { SupplierProperties } from '../../Interfaces';

export const supplierCreateFromReceitaDescription: SupplierProperties = [
    {
        displayName: 'CNPJ',
        name: 'receitaCnpj',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['createFromReceita'],
            },
        },
        description: 'CNPJ a consultar na API pública antes de criar o fornecedor no SAP B1.',
    },
    {
        displayName: 'Fonte da Consulta',
        name: 'receitaProvider',
        type: 'options',
        default: 'auto',
        options: [
            {
                name: 'Automático',
                value: 'auto',
            },
            {
                name: 'Publica CNPJ.ws',
                value: 'publicaCnpjWs',
            },
            {
                name: 'ReceitaWS',
                value: 'receitaWs',
            },
        ],
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['createFromReceita'],
            },
        },
        description: 'Em automático, tenta primeiro publica.cnpj.ws e usa ReceitaWS como contingência.',
    },
    {
        displayName: 'CardCode',
        name: 'receitaCardCode',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['createFromReceita'],
            },
        },
        description: 'Opcional. Se vazio, o node gera automaticamente no padrão F000001.',
    },
    {
        displayName: 'Nome do Fornecedor',
        name: 'receitaCardName',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['createFromReceita'],
            },
        },
        description: 'Opcional. Se vazio, usa a razão social retornada pela API.',
    },
    {
        displayName: 'E-mail',
        name: 'receitaEmail',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['createFromReceita'],
            },
        },
        description: 'Opcional. Se vazio, usa o e-mail retornado pela API.',
    },
    {
        displayName: 'DDD',
        name: 'receitaPhoneDdd',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['createFromReceita'],
            },
        },
        description: 'Opcional. Se vazio, usa o DDD retornado pela API.',
    },
    {
        displayName: 'Telefone',
        name: 'receitaPhone',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['createFromReceita'],
            },
        },
        description: 'Opcional. Se vazio, usa o telefone retornado pela API.',
    },
    {
        displayName: 'Nome Base do Endereço',
        name: 'receitaAddressName',
        type: 'string',
        default: 'PRINCIPAL',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['createFromReceita'],
            },
        },
    },
    {
        displayName: 'Campos Dinâmicos',
        name: 'receitaDynamicFields',
        type: 'fixedCollection',
        placeholder: 'Adicionar campo',
        default: {},
        required: false,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'dynamicFields',
                displayName: 'Campo',
                values: [
                    {
                        displayName: 'Nome do Campo',
                        name: 'name',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Valor',
                        name: 'value',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['createFromReceita'],
            },
        },
    },
];
