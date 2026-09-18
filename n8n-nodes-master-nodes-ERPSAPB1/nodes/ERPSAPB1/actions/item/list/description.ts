import { ItemProperties } from '../../Interfaces';

export const itemListDescription: ItemProperties = [
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
                    'item',
                ],
                operation: [
                    'list',
                ],
            },
        },
    },
];
