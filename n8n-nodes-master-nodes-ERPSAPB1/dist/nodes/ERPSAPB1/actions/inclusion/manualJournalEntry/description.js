"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inclusionManualJournalEntryDescription = void 0;
exports.inclusionManualJournalEntryDescription = [
    {
        displayName: 'ReferenceDate',
        name: 'referenceDate',
        type: 'dateTime',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['manualJournalEntry'],
            },
        },
    },
    {
        displayName: 'Memo',
        name: 'memo',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['manualJournalEntry'],
            },
        },
    },
    {
        displayName: 'Modo de Envio das Linhas',
        name: 'journalLinesMode',
        type: 'options',
        default: 'manual',
        options: [
            {
                name: 'Manual',
                value: 'manual',
            },
            {
                name: 'JSON',
                value: 'json',
            },
        ],
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['manualJournalEntry'],
            },
        },
        description: 'Escolhe se as linhas serão montadas manualmente ou enviadas como JSON.',
    },
    {
        displayName: 'JournalEntryLines',
        name: 'lineEntries',
        type: 'fixedCollection',
        placeholder: 'Adicionar linha',
        default: {},
        required: false,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'lineEntryValues',
                displayName: 'Linha',
                values: [
                    {
                        displayName: 'AccountCode',
                        name: 'accountCode',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Debit',
                        name: 'debit',
                        type: 'number',
                        default: 0,
                        required: true,
                        typeOptions: {
                            numberPrecision: 2,
                        },
                    },
                    {
                        displayName: 'Credit',
                        name: 'credit',
                        type: 'number',
                        default: 0,
                        required: true,
                        typeOptions: {
                            numberPrecision: 2,
                        },
                    },
                    {
                        displayName: 'BPLID',
                        name: 'bplId',
                        type: 'number',
                        default: '',
                        required: false,
                    },
                    {
                        displayName: 'ProjectCode',
                        name: 'projectCode',
                        type: 'string',
                        default: '',
                        required: false,
                    },
                    {
                        displayName: 'CostingCode',
                        name: 'costingCode',
                        type: 'string',
                        default: '',
                        required: false,
                    },
                    {
                        displayName: 'DueDate',
                        name: 'dueDate',
                        type: 'dateTime',
                        default: '',
                        required: false,
                    },
                    {
                        displayName: 'TaxDate',
                        name: 'taxDate',
                        type: 'dateTime',
                        default: '',
                        required: false,
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['manualJournalEntry'],
                journalLinesMode: ['manual'],
            },
        },
    },
    {
        displayName: 'JSON do JournalEntryLines',
        name: 'journalLinesJson',
        type: 'string',
        default: '[]',
        required: false,
        typeOptions: {
            rows: 10,
        },
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['manualJournalEntry'],
                journalLinesMode: ['json'],
            },
        },
        description: 'Array JSON no formato do SAP para JournalEntryLines.',
    },
];
