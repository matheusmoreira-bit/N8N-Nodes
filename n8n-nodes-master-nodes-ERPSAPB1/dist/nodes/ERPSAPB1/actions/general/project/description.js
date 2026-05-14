"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalProjectDescription = void 0;
exports.generalProjectDescription = [
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
        ],
        displayOptions: {
            show: {
                resource: [
                    'general',
                ],
                operation: [
                    'project',
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
                    'project',
                ],
            },
        },
        description: 'Chave customizável para passar adiante do fluxo.',
    },
];
