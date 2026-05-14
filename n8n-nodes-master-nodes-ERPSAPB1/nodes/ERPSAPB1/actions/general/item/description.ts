import { GeneralProperties } from '../../Interfaces';

export const generalItemDescription: GeneralProperties = [
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
                displayName: 'Válido',
                name: 'isValid',
                type: 'boolean',
                default: true,
            },
            {
                displayName: 'Código do Grupo',
                name: 'groupCode',
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
                    'item',
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
                    'item',
                ],
            },
        },
        description: 'Chave customizável para passar adiante do fluxo.',
    },
];
