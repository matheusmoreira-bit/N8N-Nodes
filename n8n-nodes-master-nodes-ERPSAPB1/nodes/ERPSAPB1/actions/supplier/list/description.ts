import { SupplierProperties } from '../../Interfaces';

export const supplierListDescription: SupplierProperties = [
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
                displayName: 'Nome',
                name: 'cardName',
                type: 'string',
                default: '',
            },
            {
                displayName: 'CPF/CNPJ',
                name: 'document',
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
                    'supplier',
                ],
                operation: [
                    'list',
                ],
            },
        },
    },
];
