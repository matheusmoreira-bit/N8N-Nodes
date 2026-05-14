import { IntegrationProperties } from '../../Interfaces';

export const integrationAdvDescription: IntegrationProperties = [
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
                    'adv',
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
        displayOptions: {
            show: {
                operation: [
                    'adv',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo BPL_IDAssignedToInvoice do endpoint PurchaseDownPayments.',
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
                    'adv',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo SequenceCode do endpoint PurchaseDownPayments.',
    },
    {
        displayName: 'Id Adiantamento',
        name: 'sequenceSerial',
        type: 'number',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'adv',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O id de adiantamento na Onfly.',
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
                    'adv',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo DocDate do endpoint PurchaseDownPayments.',
    },
    {
        displayName: 'Dias para vencimento',
        name: 'dueDays',
        type: 'number',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'adv',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'Número de dias a ser adicionado da data do documento.',
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
                    'adv',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo Comments do endpoint PurchaseDownPayments.',
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
                    'adv',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo JournalMemo do endpoint PurchaseDownPayments.',
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
                    'adv',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'Se o documento será enviado para Drafts ou PurchaseDownPayments.',
    },
    {
        displayName: 'Opções de fornecedor',
        name: 'supplierOptions',
        type: 'collection',
        placeholder: 'Associar fornecedor',
        default: {},
        displayOptions: {
            show: {
                resource: [
                    'integration',
                ],
                operation: [
                    'adv',
                ],
            },
        },
        options: [
            {
                displayName: 'Código do Fornecedor',
                name: 'cardCode',
                type: 'string',
                default: '',
                description: 'O campo CardCode do endpoint PurchaseDownPayments.',
            },
            {
                displayName: 'Mapear por documento',
                name: 'useSupplierMapper',
                type: 'boolean',
                required: true,
                default: false,
                description: 'Encontrar e mapear colaboradores sem código de fornecedor.',
            },
            {
                displayName: 'Id Colaborador Onfly',
                name: 'employeeId',
                type: 'number',
                default: '',
                displayOptions: {
                    show: {
                        useSupplierMapper: [
                            true,
                        ],
                    },
                },
            },
            {
                displayName: 'Documento do Fornecedor',
                name: 'supplierDocument',
                type: 'string',
                default: '',
                displayOptions: {
                    show: {
                        useSupplierMapper: [
                            true,
                        ],
                    },
                },
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
                    'adv',
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
                        description: 'O campo ItemCode do endpoint PurchaseDownPayments.',
                    },
                    {
                        displayName: 'Código da Taxa',
                        name: 'taxCode',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'O campo TaxCode do endpoint PurchaseDownPayments.',
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
                        description: 'O campo UnitPrice do endpoint PurchaseDownPayments.',
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
                        description: 'O campo Quantity do endpoint PurchaseDownPayments.',
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
                    'adv',
                ],
                resource: [
                    'integration',
                ],
            },
        },
    },
    {
        displayName: 'Opções de baixa',
        name: 'paymentExecutionOptions',
        type: 'fixedCollection',
        placeholder: 'Adicionar baixa',
        required: true,
        default: {},
        displayOptions: {
            show: {
                resource: [
                    'integration',
                ],
                operation: [
                    'adv',
                ],
            },
        },
        options: [
            {
                name: 'paymentExecution',
                displayName: 'Baixa',
                values: [
                    {
                        displayName: 'Código da conta contábil',
                        name: 'transferAccount',
                        type: 'string',
                        default: '',
                        description: 'O campo TransferAccount do endpoint VendorPayments.',
                    },
                    {
                        displayName: 'Data da baixa',
                        name: 'transferDate',
                        type: 'dateTime',
                        default: '',
                        description: 'O campo TransferDate do endpoint VendorPayments.',
                    },
                    {
                        displayName: 'Valor da baixa',
                        name: 'transferSum',
                        type: 'number',
                        default: '',
                        description: 'O campo TransferSum do endpoint VendorPayments.',
                    },
                    {
                        displayName: 'Descrição no diário contábil',
                        name: 'journalRemarks',
                        type: 'string',
                        default: '',
                        description: 'O campo JournalRemarks do endpoint VendorPayments.',
                    },
                ],
            },
        ],
    },
];
