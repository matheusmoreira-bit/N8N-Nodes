"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.documentListDescription = void 0;
const constants_1 = require("../constants");
exports.documentListDescription = [
    {
        displayName: 'Filtros',
        name: 'filters',
        type: 'collection',
        placeholder: 'Adicionar filtro',
        default: {},
        options: [
            {
                displayName: 'CardCode',
                name: 'cardCode',
                type: 'string',
                default: '',
            },
            {
                displayName: 'Data Final',
                name: 'docDateTo',
                type: 'dateTime',
                default: '',
            },
            {
                displayName: 'Data Inicial',
                name: 'docDateFrom',
                type: 'dateTime',
                default: '',
            },
            {
                displayName: 'DocEntry',
                name: 'docEntry',
                type: 'number',
                default: '',
                typeOptions: {
                    numberPrecision: 0,
                },
            },
            {
                displayName: 'DocNum',
                name: 'docNum',
                type: 'number',
                default: '',
                typeOptions: {
                    numberPrecision: 0,
                },
            },
            {
                displayName: 'Filtro OData Customizado',
                name: 'rawFilter',
                type: 'string',
                default: '',
                placeholder: "Ex.: DocumentStatus eq 'bost_Open'",
                description: 'Trecho de $filter adicional para casos específicos do Service Layer.',
            },
            {
                displayName: 'Status do Documento',
                name: 'documentStatus',
                type: 'string',
                default: '',
                placeholder: 'Ex.: bost_Open',
            },
        ],
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'list',
                ],
            },
        },
    },
    {
        displayName: 'Limitar Paginação',
        name: 'limitPagination',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'list',
                ],
            },
        },
        description: 'Se ativo, para a paginação após atingir o número máximo de páginas informado.',
    },
    {
        displayName: 'Máximo de Páginas',
        name: 'maxPages',
        type: 'number',
        default: 1,
        typeOptions: {
            minValue: 1,
            numberPrecision: 0,
        },
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'list',
                ],
                limitPagination: [
                    true,
                ],
            },
        },
        description: 'Quantidade máxima de páginas retornadas pelo SAP.',
    },
    {
        displayName: 'Seleção de Campos',
        name: 'selectMode',
        type: 'options',
        default: 'all',
        options: [
            {
                name: 'Todos os Campos',
                value: 'all',
            },
            {
                name: 'Lista Customizada ($select)',
                value: 'custom',
            },
        ],
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'list',
                ],
            },
        },
    },
    {
        displayName: 'Campos ($select)',
        name: 'selectFields',
        type: 'string',
        default: '',
        placeholder: 'Ex.: DocEntry,DocNum,CardCode,DocDate,DocTotal',
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
                operation: [
                    'list',
                ],
                selectMode: [
                    'custom',
                ],
            },
        },
        description: 'Campos separados por vírgula para montar o parâmetro $select.',
    },
];
