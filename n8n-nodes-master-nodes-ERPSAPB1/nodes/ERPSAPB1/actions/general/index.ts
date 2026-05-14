import * as blanketAgreement from './blanketAgreement';
import * as costCenterType from './costCenterType';
import * as dimension from './dimension';
import * as distribution from './distribution';
import * as item from './item';
import * as itemGroup from './itemGroup';
import * as profitCenter from './profitCenter';
import * as project from './project';
import * as genericQuery from './genericQuery';

import { INodeProperties } from 'n8n-workflow';

export {
    blanketAgreement,
    costCenterType,
    dimension,
    distribution,
    item,
    itemGroup,
    profitCenter,
    project,
    genericQuery,
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
                    'general',
                ],
            },
        },
        options: [
            {
                name: 'Listar contratos guarda-chuva',
                value: 'blanketAgreement',
                description: 'Lista todos os contratos guarda-chuvas cadastrados no SAP B1.',
            },
            {
                name: 'Listar dimensões',
                value: 'dimension',
                description: 'Lista todas as dimensões cadastradas no SAP B1.',
            },
            {
                name: 'Listar distribuições',
                value: 'distribution',
                description: 'Lista todas as distribuições cadastradas no SAP B1.',
            },
            {
                name: 'Listar grupos de itens',
                value: 'itemGroup',
                description: 'Lista todos os grupos de itens cadastrados no SAP B1.',
            },
            {
                name: 'Listar itens',
                value: 'item',
                description: 'Lista todos os itens cadastrados no SAP B1.',
            },
            {
                name: 'Listar tipos de centro de custos',
                value: 'costCenterType',
                description: 'Lista todos os tipos de centro de custos cadastrados no SAP B1.',
            },
            {
                name: 'Listar centros de lucro',
                value: 'profitCenter',
                description: 'Lista todos os centros de lucro cadastrados no SAP B1.',
            },
            {
                name: 'Listar projetos',
                value: 'project',
                description: 'Lista todos os projetos cadastrados no SAP B1.',
            },
            {
                name: 'Listagem genérica',
                value: 'genericQuery',
                description: 'Lista um recurso qualquer no SAP B1.',
            },
        ],
        default: 'item',
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
                    'general',
                ],
                operation: [
                    'blanketAgreement',
                    'costCenterType',
                    'dimension',
                    'distribution',
                    'item',
                    'itemGroup',
                    'profitCenter',
                    'project',
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
                    'general',
                ],
                operation: [
                    'blanketAgreement',
                    'costCenterType',
                    'dimension',
                    'distribution',
                    'item',
                    'itemGroup',
                    'profitCenter',
                    'project',
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
                    'general',
                ],
                operation: [
                    'blanketAgreement',
                    'costCenterType',
                    'dimension',
                    'distribution',
                    'item',
                    'itemGroup',
                    'profitCenter',
                    'project',
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
                    'general',
                ],
                operation: [
                    'blanketAgreement',
                    'costCenterType',
                    'dimension',
                    'distribution',
                    'item',
                    'itemGroup',
                    'profitCenter',
                    'project',
                ],
                selectMode: [
                    'custom',
                ],
            },
        },
        description: 'Campos separados por vírgula para montar o parâmetro $select.',
    },
    ...blanketAgreement.description,
    ...costCenterType.description,
    ...dimension.description,
    ...distribution.description,
    ...item.description,
    ...itemGroup.description,
    ...profitCenter.description,
    ...project.description,
    ...genericQuery.description,
];
