"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalDimensionDescription = void 0;
exports.generalDimensionDescription = [
    {
        displayName: 'Filtros',
        name: 'filters',
        type: 'collection',
        placeholder: 'Adicionar filtro',
        default: {},
        options: [
            {
                displayName: 'Código',
                name: 'code',
                type: 'number',
                default: 1,
            },
            {
                displayName: 'Descrição',
                name: 'description',
                type: 'string',
                default: '',
            },
            {
                displayName: 'Ativo',
                name: 'isActive',
                type: 'boolean',
                default: true,
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
                    'dimension',
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
                    'dimension',
                ],
            },
        },
        description: 'Chave customizável para passar adiante do fluxo.',
    },
];
