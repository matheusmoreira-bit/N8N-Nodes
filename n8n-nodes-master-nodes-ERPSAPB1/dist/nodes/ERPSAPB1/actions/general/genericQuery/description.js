"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalGenericQueryDescription = void 0;
exports.generalGenericQueryDescription = [
    {
        displayName: 'Query',
        name: 'querystring',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: [
                    'general',
                ],
                operation: [
                    'genericQuery',
                ],
            },
        },
    },
    {
        displayName: 'Metadados de Origem',
        name: 'originMetadata',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'general',
                ],
                operation: [
                    'genericQuery',
                ],
            },
        },
        description: 'Chave customizável para passar adiante do fluxo.',
    },
    {
        displayName: 'Limitar Paginação',
        name: 'limitPagination',
        type: 'boolean',
        default: false,
        required: true,
        displayOptions: {
            show: {
                resource: [
                    'general',
                ],
                operation: [
                    'genericQuery',
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
        required: true,
        typeOptions: {
            minValue: 1,
            numberPrecision: 0,
        },
        displayOptions: {
            show: {
                resource: [
                    'general',
                ],
                operation: [
                    'genericQuery',
                ],
                limitPagination: [
                    true,
                ],
            },
        },
        description: 'Quantidade máxima de páginas retornadas pelo SAP.',
    },
];
