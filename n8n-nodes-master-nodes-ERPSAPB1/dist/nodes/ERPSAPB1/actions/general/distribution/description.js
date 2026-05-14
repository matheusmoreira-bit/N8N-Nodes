"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalDistributionDescription = void 0;
exports.generalDistributionDescription = [
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
                    'distribution',
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
                    'distribution',
                ],
            },
        },
        description: 'Chave customizável para passar adiante do fluxo.',
    },
];
