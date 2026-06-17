"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supplierCreateDescription = void 0;
exports.supplierCreateDescription = [
    {
        displayName: 'CardCode',
        name: 'cardCode',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
        description: 'Opcional. Se vazio, o node gera automaticamente no padrão F000001.',
    },
    {
        displayName: 'Nome do Fornecedor',
        name: 'cardName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'CNPJ',
        name: 'cnpj',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
        description: 'Opcional. Se informado, será replicado para FederalTaxID e U_FGR_TAXID0.',
    },
    {
        displayName: 'E-mail',
        name: 'email',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
        description: 'E-mail principal do PN. Enviado ao SAP B1 como EmailAddress.',
    },
    {
        displayName: 'Nome Base do Endereço',
        name: 'addressName',
        type: 'string',
        default: 'PRINCIPAL',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
        description: 'O node replica os dados para Entrega e Cobrança automaticamente.',
    },
    {
        displayName: 'Rua',
        name: 'street',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Tipo de Logradouro',
        name: 'streetType',
        type: 'string',
        default: 'Rua',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
        description: 'Tipo de logradouro do endereço no SAP B1. Ex.: Rua, Avenida, Alameda.',
    },
    {
        displayName: 'Número',
        name: 'streetNo',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Bairro',
        name: 'block',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Complemento',
        name: 'buildingFloorRoom',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Cidade',
        name: 'city',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Município',
        name: 'county',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
        description: 'Município do endereço no SAP B1. Se vazio, usa a Cidade informada.',
    },
    {
        displayName: 'CEP',
        name: 'zipCode',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Estado',
        name: 'state',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'País',
        name: 'country',
        type: 'string',
        default: 'BR',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Campos Dinâmicos',
        name: 'dynamicFields',
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
                operation: ['create'],
            },
        },
    },
];
