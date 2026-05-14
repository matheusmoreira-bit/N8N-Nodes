import { ItemProperties } from '../../Interfaces';

export const itemCreateGroupDescription: ItemProperties = [
    {
        displayName: 'Nome do Grupo',
        name: 'groupName',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['createGroup'],
            },
        },
        description: 'GroupName no SAP.',
    },
    {
        displayName: 'Unidade Base',
        name: 'baseUnit',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['item'],
                operation: ['createGroup'],
            },
        },
        description: 'BaseUnit no SAP. Opcional.',
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
                operation: ['createGroup'],
            },
        },
    },
];
