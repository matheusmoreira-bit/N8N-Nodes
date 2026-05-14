"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalProfitCenterDescription = void 0;
exports.generalProfitCenterDescription = [
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
                type: 'string',
                default: '',
            },
            {
                displayName: 'Nome',
                name: 'name',
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
                displayName: 'Dimensão',
                name: 'inWhichDimension',
                type: 'number',
                default: 1,
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'general',
                ],
                operation: [
                    'profitCenter',
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
                    'profitCenter',
                ],
            },
        },
        description: 'Chave customizável para passar adiante do fluxo.',
    },
];
