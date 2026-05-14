"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalCostCenterTypeDescription = void 0;
exports.generalCostCenterTypeDescription = [
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
                    'costCenterType',
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
                    'costCenterType',
                ],
            },
        },
        description: 'Chave customizável para passar adiante do fluxo.',
    },
];
