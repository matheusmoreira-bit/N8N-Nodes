import * as create from './create';
import * as list from './list';
import { INodeProperties } from 'n8n-workflow';

export {
    create,
    list,
};

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        displayOptions: {
            show: {
                resource: [
                    'attachments',
                ],
            },
        },
        options: [
            {
                name: 'Listar anexos',
                value: 'list',
                description: 'Obtem todos os anexos.',
            },
            {
                name: 'Criar anexo',
                value: 'create',
                description: 'Cria um novo anexo.',
            },
        ],
        default: 'create',
        description: 'A operação a ser realizada.',
    },
    {
        displayName: 'Limitar Paginação',
        name: 'limitPagination',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                resource: [
                    'attachments',
                ],
                operation: [
                    'list',
                ],
            },
        },
        description: 'Se ativo, para a paginação após atingir o número máximo de páginas informado.',
    },
    {
        displayName: 'Máximo de Páginas',
        name: 'maxPages',
        type: 'number',
        default: 1,
        typeOptions: {
            minValue: 1,
            numberPrecision: 0,
        },
        displayOptions: {
            show: {
                resource: [
                    'attachments',
                ],
                operation: [
                    'list',
                ],
                limitPagination: [
                    true,
                ],
            },
        },
        description: 'Quantidade máxima de páginas retornadas pelo SAP.',
    },
    {
        displayName: 'Seleção de Campos',
        name: 'selectMode',
        type: 'options',
        default: 'all',
        options: [
            {
                name: 'Todos os Campos',
                value: 'all',
            },
            {
                name: 'Lista Customizada ($select)',
                value: 'custom',
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'attachments',
                ],
                operation: [
                    'list',
                ],
            },
        },
    },
    {
        displayName: 'Campos ($select)',
        name: 'selectFields',
        type: 'string',
        default: '',
        placeholder: 'Ex.: AbsoluteEntry,Attachments2_Lines',
        displayOptions: {
            show: {
                resource: [
                    'attachments',
                ],
                operation: [
                    'list',
                ],
                selectMode: [
                    'custom',
                ],
            },
        },
        description: 'Campos separados por vírgula para montar o parâmetro $select.',
    },
    ...create.description,
    ...list.description,
];
