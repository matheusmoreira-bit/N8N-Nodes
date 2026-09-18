"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentCreateDescription = void 0;
const constants_1 = require("../constants");
exports.documentCreateDescription = [
    {
        displayName: 'Modo de Payload',
        name: 'payloadMode',
        type: 'options',
        default: 'json',
        options: [
            {
                name: 'JSON SAP Completo',
                value: 'json',
            },
            {
                name: 'Campos Básicos',
                value: 'fields',
            },
        ],
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'create',
                ],
            },
        },
        description: 'Use JSON para enviar exatamente o payload esperado pelo Service Layer.',
    },
    {
        displayName: 'Payload JSON',
        name: 'payloadJson',
        type: 'json',
        default: '{}',
        required: true,
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'json',
                ],
            },
        },
        description: 'Payload completo enviado ao endpoint do SAP B1.',
    },
    {
        displayName: 'CardCode',
        name: 'cardCode',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Data do Documento',
        name: 'docDate',
        type: 'dateTime',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Data de Vencimento',
        name: 'dueDate',
        type: 'dateTime',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.documentWithLinesResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Data Fiscal',
        name: 'taxDate',
        type: 'dateTime',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'BPL_ID',
        name: 'bplId',
        type: 'number',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.documentWithLinesResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
        description: 'Filial do documento no SAP.',
    },
    {
        displayName: 'Comentários',
        name: 'comments',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.documentWithLinesResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Observações Contábeis',
        name: 'journalMemo',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.documentWithLinesResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Moeda',
        name: 'docCurrency',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
        description: 'Código da moeda do documento (ex.: BRL, USD).',
    },
    {
        displayName: 'Cotação',
        name: 'docRate',
        type: 'number',
        default: '',
        required: false,
        typeOptions: {
            numberPrecision: 6,
        },
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Percentual de Adiantamento',
        name: 'downPaymentPercentage',
        type: 'number',
        default: '',
        required: false,
        typeOptions: {
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                resource: constants_1.downPaymentDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Linhas do Documento',
        name: 'documentLines',
        type: 'fixedCollection',
        placeholder: 'Adicionar linha',
        default: {},
        required: true,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'lineValues',
                displayName: 'Linha',
                values: [
                    {
                        displayName: 'ItemCode',
                        name: 'itemCode',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Descrição',
                        name: 'itemDescription',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Quantidade',
                        name: 'quantity',
                        type: 'number',
                        default: 1,
                        required: true,
                    },
                    {
                        displayName: 'Preço Unitário',
                        name: 'unitPrice',
                        type: 'number',
                        default: 0,
                        required: true,
                        typeOptions: {
                            numberPrecision: 6,
                        },
                    },
                    {
                        displayName: 'TaxCode',
                        name: 'taxCode',
                        type: 'string',
                        default: '',
                    },
                    {
                        displayName: 'CFOPCode',
                        name: 'cfopCode',
                        type: 'string',
                        default: '',
                    },
                    {
                        displayName: 'Usage',
                        name: 'usage',
                        type: 'number',
                        default: '',
                    },
                    {
                        displayName: 'Depósito',
                        name: 'warehouseCode',
                        type: 'string',
                        default: '',
                    },
                    {
                        displayName: 'Conta Contábil',
                        name: 'accountCode',
                        type: 'string',
                        default: '',
                    },
                    {
                        displayName: 'Centro de Custo',
                        name: 'costingCode',
                        type: 'string',
                        default: '',
                    },
                    {
                        displayName: 'Projeto',
                        name: 'projectCode',
                        type: 'string',
                        default: '',
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: constants_1.documentWithLinesResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Conta Caixa',
        name: 'cashAccount',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.paymentDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
        description: 'CashAccount enviado ao VendorPayments ou IncomingPayments.',
    },
    {
        displayName: 'Valor Caixa',
        name: 'cashSum',
        type: 'number',
        default: '',
        required: false,
        typeOptions: {
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                resource: constants_1.paymentDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Moeda Local',
        name: 'localCurrency',
        type: 'options',
        options: [
            {
                name: 'tYES',
                value: 'tYES',
            },
            {
                name: 'tNO',
                value: 'tNO',
            },
        ],
        default: 'tNO',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.paymentDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Observações',
        name: 'remarks',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.paymentDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
            },
        },
    },
    {
        displayName: 'Invoices do Pagamento',
        name: 'paymentInvoices',
        type: 'fixedCollection',
        placeholder: 'Adicionar invoice',
        default: {},
        required: true,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'invoiceValues',
                displayName: 'Invoice',
                values: [
                    {
                        displayName: 'DocEntry',
                        name: 'docEntry',
                        type: 'number',
                        default: 0,
                        required: true,
                    },
                    {
                        displayName: 'Valor Aplicado',
                        name: 'sumApplied',
                        type: 'number',
                        default: 0,
                        required: true,
                        typeOptions: {
                            numberPrecision: 2,
                        },
                    },
                    {
                        displayName: 'Tipo da Invoice',
                        name: 'invoiceType',
                        type: 'string',
                        default: '',
                        placeholder: 'Ex.: it_PurchaseInvoice ou it_Invoice',
                        required: false,
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: constants_1.paymentDocumentResources,
                operation: [
                    'create',
                ],
                payloadMode: [
                    'fields',
                ],
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
                resource: constants_1.managedDocumentResources,
                operation: [
                    'create',
                ],
            },
        },
    },
];
