import { IntegrationProperties } from '../../Interfaces';

export const integrationTransactionDescription: IntegrationProperties = [
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
                    'transaction',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'A empresa do banco de dados de integração.',
    },
    {
        displayName: 'Id Transação',
        name: 'transactionId',
        type: 'number',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'transaction',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O id de transação na Onfly.',
    },
    {
        displayName: 'BPLID',
        name: 'bplId',
        type: 'number',
        default: '',
        required: false,
        displayOptions: {
            show: {
                operation: [
                    'transaction',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo BPLID do endpoint JournalEntry.',
    },
    {
        displayName: 'Data do lançamento',
        name: 'referenceDate',
        type: 'dateTime',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'transaction',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo ReferenceDate do endpoint JournalEntry.',
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
                    'transaction',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'Número de dias a ser adicionado da data do lançamento.',
    },
    {
        displayName: 'Observação',
        name: 'journalMemo',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                operation: [
                    'transaction',
                ],
                resource: [
                    'integration',
                ],
            },
        },
        description: 'O campo Memo do endpoint JournalEntry.',
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
                    'transaction',
                ],
            },
        },
    },
    {
        displayName: 'Opções de linha',
        name: 'lineEntries',
        type: 'fixedCollection',
        placeholder: 'Adicionar linha',
        default: '',
        required: true,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'lineEntryValues',
                displayName: 'Linha',
                values: [
                    {
                        displayName: 'Código da Conta Contábil',
                        name: 'accountCode',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'O campo AccountCode do endpoint JournalEntry.',
                    },
                    {
                        displayName: 'Débito / Crédito',
                        name: 'debitOrCreditIndicator',
                        type: 'options',
                        default: 'debit',
                        options: [
                            {
                                name: 'Débito',
                                value: 'debit',
                            },
                            {
                                name: 'Crédito',
                                value: 'credit',
                            },
                        ],
                        required: true,
                        description: 'O campo Debit ou Credit do endpoint JournalEntry.',
                    },
                    {
                        displayName: 'Valor do Lançamento',
                        name: 'amount',
                        type: 'number',
                        default: 0,
                        required: true,
                        description: 'O valor em centavos do Credit/Debit do endpoint JournalEntry.',
                    },
                    {
                        displayName: 'Descrição',
                        name: 'lineMemo',
                        type: 'string',
                        default: '',
                        required: true,
                        description: 'O campo LineMemo do endpoint JournalEntry.',
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
                                        description: 'O nome do campo dinâmico a ser preenchido no ITEM do endpoint JournalEntry.',
                                    },
                                    {
                                        displayName: 'Valor a ser preenchido',
                                        name: 'value',
                                        type: 'string',
                                        default: '',
                                        required: true,
                                        description: 'O valor a ser preenchido no campo dinâmico no ITEM do endpoint JournalEntry.',
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
                    'transaction',
                ],
                resource: [
                    'integration',
                ],
            },
        },
    },
];
