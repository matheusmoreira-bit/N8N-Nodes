import * as create from './create';
import * as createGroup from './createGroup';
import * as list from './list';
import * as updateField from './updateField';

import { INodeProperties } from 'n8n-workflow';

export {
    create,
    createGroup,
    list,
    updateField,
};

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: [
                    'item',
                ],
            },
        },
        options: [
            {
                name: 'Listar itens',
                value: 'list',
                description: 'Lista todos os itens cadastrados no SAP B1.',
            },
            {
                name: 'Criar item',
                value: 'create',
                description: 'Cria um novo item no SAP.',
            },
            {
                name: 'Criar grupo de itens',
                value: 'createGroup',
                description: 'Cria um novo grupo de itens no SAP.',
            },
            {
                name: 'Editar campo do item',
                value: 'updateField',
                description: 'Atualiza um campo especifico do item.',
            },
        ],
        default: 'list',
        description: 'Operação a ser executada.',
    },
    {
        displayName: 'Limitar Paginação',
        name: 'limitPagination',
        type: 'boolean',
        default: false,
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
                    'item',
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
                    'item',
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
        placeholder: 'Ex.: ItemCode,ItemName,Valid',
        displayOptions: {
            show: {
                resource: [
                    'item',
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
    ...createGroup.description,
    ...list.description,
    ...updateField.description,
];
