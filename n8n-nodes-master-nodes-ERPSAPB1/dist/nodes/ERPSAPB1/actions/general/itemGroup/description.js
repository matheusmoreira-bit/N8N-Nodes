"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalItemGroupDescription = void 0;
exports.generalItemGroupDescription = [
    {
        displayName: 'Filtros',
        name: 'filters',
        type: 'collection',
        placeholder: 'Adicionar filtro',
        default: {},
        options: [
            {
                displayName: 'Número',
                name: 'code',
                type: 'number',
                default: 1,
            },
            {
                displayName: 'Nome',
                name: 'name',
                type: 'string',
                default: '',
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'general',
                ],
                operation: [
                    'itemGroup',
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
                    'itemGroup',
                ],
            },
        },
        description: 'Chave customizável para passar adiante do fluxo.',
    },
];
