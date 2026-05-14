import { ItemProperties } from '../../Interfaces';

export const itemCreateDescription: ItemProperties = [
    {
        displayName: 'ItemCode',
        name: 'itemCode',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Nome do Item',
        name: 'itemName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Código do Grupo',
        name: 'itemsGroupCode',
        type: 'number',
        default: 0,
        required: false,
        typeOptions: {
            numberPrecision: 0,
        },
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['create'],
            },
        },
        description: 'ItemsGroupCode no SAP. Deixe 0 para não enviar o campo.',
    },
    {
        displayName: 'Item de Compra',
        name: 'purchaseItem',
        type: 'boolean',
        default: true,
        required: false,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Item de Venda',
        name: 'salesItem',
        type: 'boolean',
        default: true,
        required: false,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Item de Estoque',
        name: 'inventoryItem',
        type: 'boolean',
        default: true,
        required: false,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['create'],
            },
        },
    },
    {
        displayName: 'Código da Unidade de Medida',
        name: 'uomCode',
        type: 'number',
        default: 0,
        required: false,
        typeOptions: {
            numberPrecision: 0,
        },
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['create'],
            },
        },
        description: 'UoMGroupEntry no SAP. Deixe 0 para não enviar o campo.',
    },
    {
        displayName: 'Campos Dinâmicos',
        name: 'dynamicFields',
        type: 'fixedCollection',
        placeholder: 'Adicionar campo',
        default: {},
        required: false,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'dynamicFields',
                displayName: 'Campo',
                values: [
                    {
                        displayName: 'Nome do Campo',
                        name: 'name',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Valor',
                        name: 'value',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['create'],
            },
        },
    },
];
