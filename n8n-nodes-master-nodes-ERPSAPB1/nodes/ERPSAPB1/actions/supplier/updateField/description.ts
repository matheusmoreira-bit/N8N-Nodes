import { SupplierProperties } from '../../Interfaces';

export const supplierUpdateFieldDescription: SupplierProperties = [
    {
        displayName: 'CardCode',
        name: 'cardCode',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['updateField'],
            },
        },
    },
    {
        displayName: 'Nome do Campo',
        name: 'fieldName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['updateField'],
            },
        },
        description: 'Exemplo: CardName, Phone1, U_CAMPO_CUSTOM.',
    },
    {
        displayName: 'Tipo do Valor',
        name: 'fieldValueType',
        type: 'options',
        default: 'string',
        options: [
            { name: 'String', value: 'string' },
            { name: 'Número', value: 'number' },
            { name: 'Booleano', value: 'boolean' },
            { name: 'JSON', value: 'json' },
            { name: 'Nulo', value: 'null' },
        ],
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['updateField'],
            },
        },
    },
    {
        displayName: 'Novo Valor',
        name: 'fieldValue',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['supplier'],
                operation: ['updateField'],
                fieldValueType: ['string', 'number', 'boolean', 'json'],
            },
        },
    },
];
