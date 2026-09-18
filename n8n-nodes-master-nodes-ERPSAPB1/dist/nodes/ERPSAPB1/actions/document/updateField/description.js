"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentUpdateFieldDescription = void 0;
const constants_1 = require("../constants");
exports.documentUpdateFieldDescription = [
    {
        displayName: 'DocEntry',
        name: 'docEntry',
        type: 'number',
        default: 0,
        required: true,
        typeOptions: {
            minValue: 1,
            numberPrecision: 0,
        },
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'updateField',
                ],
            },
        },
    },
    {
        displayName: 'Modo de Edição',
        name: 'updateMode',
        type: 'options',
        default: 'single',
        options: [
            {
                name: 'Campo Único',
                value: 'single',
            },
            {
                name: 'Múltiplos Campos',
                value: 'multiple',
            },
        ],
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'updateField',
                ],
            },
        },
    },
    {
        displayName: 'Nome do Campo',
        name: 'fieldName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'updateField',
                ],
                updateMode: [
                    'single',
                ],
            },
        },
        description: 'Exemplo: Comments, JournalMemo, U_CAMPO_CUSTOM.',
    },
    {
        displayName: 'Tipo do Valor',
        name: 'fieldValueType',
        type: 'options',
        default: 'string',
        options: [
            { name: 'String', value: 'string' },
            { name: 'Número', value: 'number' },
            { name: 'Booleano', value: 'boolean' },
            { name: 'JSON', value: 'json' },
            { name: 'Nulo', value: 'null' },
        ],
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'updateField',
                ],
                updateMode: [
                    'single',
                ],
            },
        },
    },
    {
        displayName: 'Novo Valor',
        name: 'fieldValue',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'updateField',
                ],
                updateMode: [
                    'single',
                ],
                fieldValueType: ['string', 'number', 'boolean', 'json'],
            },
        },
    },
    {
        displayName: 'Campos para Atualizar',
        name: 'fieldsToUpdate',
        type: 'fixedCollection',
        placeholder: 'Adicionar campo',
        default: {},
        required: false,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'fields',
                displayName: 'Campo',
                values: [
                    {
                        displayName: 'Nome do Campo',
                        name: 'fieldName',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Tipo do Valor',
                        name: 'fieldValueType',
                        type: 'options',
                        default: 'string',
                        options: [
                            { name: 'String', value: 'string' },
                            { name: 'Número', value: 'number' },
                            { name: 'Booleano', value: 'boolean' },
                            { name: 'JSON', value: 'json' },
                            { name: 'Nulo', value: 'null' },
                        ],
                    },
                    {
                        displayName: 'Novo Valor',
                        name: 'fieldValue',
                        type: 'string',
                        default: '',
                        required: false,
                        displayOptions: {
                            show: {
                                fieldValueType: ['string', 'number', 'boolean', 'json'],
                            },
                        },
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'updateField',
                ],
                updateMode: [
                    'multiple',
                ],
            },
        },
    },
];
