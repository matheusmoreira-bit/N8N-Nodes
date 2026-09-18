import * as create from './create';
import * as getByDocument from './getByDocument';
import * as list from './list';
import * as updateField from './updateField';

import { INodeProperties } from 'n8n-workflow';

export {
    create,
    getByDocument,
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
                    'customer',
                ],
            },
        },
        options: [
            {
                name: 'Listar clientes',
                value: 'list',
                description: 'Lista clientes cadastrados no SAP.',
            },
            {
                name: 'Criar cliente',
                value: 'create',
                description: 'Cria um novo cliente no SAP.',
            },
            {
                name: 'Editar campo do cliente',
                value: 'updateField',
                description: 'Atualiza um campo específico do cliente.',
            },
            {
                name: 'Obter cliente por documento',
                value: 'getByDocument',
                description: 'Obtém um cliente por CPF ou CNPJ.',
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
                    'customer',
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
                    'customer',
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
                    'customer',
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
        placeholder: 'Ex.: CardCode,CardName,FederalTaxID',
        displayOptions: {
            show: {
                resource: [
                    'customer',
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
    ...getByDocument.description,
    ...list.description,
    ...updateField.description,
];
