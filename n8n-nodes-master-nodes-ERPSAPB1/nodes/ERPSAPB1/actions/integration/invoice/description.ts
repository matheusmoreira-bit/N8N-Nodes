import { IntegrationProperties } from '../../Interfaces';

export const integrationInvoiceDescription: IntegrationProperties = [
    {
        displayName: 'Empresa',
        name: 'companyId',
        type: 'options',
        typeOptions: {
            loadOptionsMethod: 'getCompanies',
        },
        options: [],
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'A empresa do banco de dados de integração.',
    },
    {
        displayName: 'BPL_ID',
        name: 'bplId',
        type: 'number',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo BPL_IDAssignedToInvoice do endpoint PurchaseInvoices.',
    },
    {
        displayName: 'CardCode',
        name: 'cardCode',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo CardCode do endpoint PurchaseInvoices.',
    },
    {
        displayName: 'SequenceCode',
        name: 'sequenceCode',
        type: 'number',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo SequenceCode do endpoint PurchaseInvoices.',
    },
    {
        displayName: 'Id Fatura',
        name: 'sequenceSerial',
        type: 'number',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O id de rfatura na Onfly.',
    },
    {
        displayName: 'Data do documento',
        name: 'docDate',
        type: 'dateTime',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo DocDate do endpoint PurchaseInvoices.',
    },
    {
        displayName: 'Data do vencimento',
        name: 'dueDate',
        type: 'dateTime',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo DueDate do endpoint PurchaseInvoices.',
    },
    {
        displayName: 'Descrição',
        name: 'comments',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo Comments do endpoint PurchaseInvoices.',
    },
    {
        displayName: 'Observações',
        name: 'journalMemo',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo JournalMemo do endpoint PurchaseInvoices.',
    },
    {
        displayName: 'Valor total dos itens',
        name: 'itemsAmount',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O valor itemsAmount da fatura.',
    },
    {
        displayName: 'Descontos de reembolso',
        name: 'refundedAmount',
        type: 'number',
        default: 0,
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O valor refundedAmount da fatura.',
    },
    {
        displayName: 'Enviar como esboço',
        name: 'useDraft',
        type: 'boolean',
        default: false,
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'Se o documento será enviado para Drafts ou PurchaseInvoices.',
    },
    {
        displayName: 'Enviar como pedido de venda',
        name: 'sendAsSalesOrder',
        type: 'boolean',
        default: false,
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'Se o documento será enviado para o contas a receber ao invés de a pagar.',
    },
    {
        displayName: 'Campos opcionais',
        name: 'optionalFields',
        type: 'collection',
        placeholder: 'Adicionar campo',
        default: {},
        displayOptions: {
            show: {
                resource: [
                    'integration',
                ],
                operation: [
                    'invoice',
                ],
            },
        },
        options: [
            {
                displayName: 'Modelo do Documento',
                name: 'sequenceModel',
                type: 'string',
                default: '',
                description: 'O campo SequenceModel do endpoint PurchaseInvoices.',
            },
        ],
    },
    {
        displayName: 'Campos dinâmicos',
        name: 'dynamicFields',
        type: 'fixedCollection',
        placeholder: 'Adicionar campo dinâmico',
        default: '',
        required: true,
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
                        description: 'O nome do campo dinâmico a ser preenchido.',
                    },
                    {
                        displayName: 'Valor a ser preenchido',
                        name: 'value',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'O valor a ser preenchido no campo dinâmico.',
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'integration',
                ],
                operation: [
                    'invoice',
                ],
            },
        },
    },
    {
        displayName: 'Opções de itens',
        name: 'documentItems',
        type: 'fixedCollection',
        placeholder: 'Adicionar item',
        default: '',
        required: true,
        typeOptions: {
            multipleValues: false,
        },
        options: [
            {
                name: 'itemValues',
                displayName: 'Itens',
                values: [
                    {
                        displayName: 'Código do Item',
                        name: 'itemCode',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'O campo ItemCode do endpoint PurchaseInvoices.',
                    },
                    {
                        displayName: 'Código da Taxa',
                        name: 'taxCode',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'O campo TaxCode do endpoint PurchaseInvoices.',
                    },
                    {
                        displayName: 'Código CFOP',
                        name: 'cfopCode',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'O campo CFOPCode do endpoint PurchaseInvoices.',
                    },
                    {
                        displayName: 'Preço unitário',
                        name: 'unitPrice',
                        type: 'number',
                        default: 1.0,
                        required: true,
                        typeOptions: {
                            numberPrecision: 2,
                        },
                        description: 'O campo UnitPrice do endpoint PurchaseInvoices.',
                    },
                    {
                        displayName: 'Quantidade',
                        name: 'quantity',
                        type: 'number',
                        default: '',
                        typeOptions: {
                            numberPrecision: 2,
                        },
                        required: true,
                        description: 'O campo Quantity do endpoint PurchaseInvoices.',
                    },
                    {
                        displayName: 'Utilização',
                        name: 'usage',
                        type: 'number',
                        default: '',
                        required: false,
                        description: 'O campo Usage do endpoint PurchaseInvoices.',
                    },
                    {
                        displayName: 'Depósito',
                        name: 'warehouseCode',
                        type: 'string',
                        default: '',
                        required: false,
                        description: 'O campo WarehouseCode do endpoint PurchaseInvoices.',
                    },
                    {
                        displayName: 'CostingCodes',
                        name: 'costingCodes',
                        type: 'collection',
                        placeholder: 'Adicionar CostingCode',
                        default: {},
                        options: [
                            {
                                displayName: 'CostingCode',
                                name: 'costingCode',
                                type: 'string',
                                default: '',
                            },
                            {
                                displayName: 'CostingCode2',
                                name: 'costingCode2',
                                type: 'string',
                                default: '',
                            },
                            {
                                displayName: 'CostingCode3',
                                name: 'costingCode3',
                                type: 'string',
                                default: '',
                            },
                            {
                                displayName: 'CostingCode4',
                                name: 'costingCode4',
                                type: 'string',
                                default: '',
                            },
                        ],
                    },
                ],
            },
            {
                name: 'dynamicFields',
                displayName: 'Campos dinâmicos',
                values: [
                    {
                        displayName: 'Campo dinâmico',
                        name: 'dynamicFields',
                        type: 'fixedCollection',
                        placeholder: 'Adicionar campo dinâmico',
                        default: '',
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
                                        description: 'O nome do campo dinâmico a ser preenchido no ITEM do endpoint fatura/pagar.',
                                    },
                                    {
                                        displayName: 'Valor a ser preenchido',
                                        name: 'value',
                                        type: 'string',
                                        default: '',
                                        required: true,
                                        description: 'O valor a ser preenchido no campo dinâmico no ITEM do endpoint fatura/pagar.',
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                operation: [
                    'invoice',
                ],
                resource: [
                    'integration',
                ],
            },
        },
    },
];
