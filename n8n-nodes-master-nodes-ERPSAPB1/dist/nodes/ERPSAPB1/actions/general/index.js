"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.descriptions = exports.genericQuery = exports.project = exports.profitCenter = exports.itemGroup = exports.item = exports.distribution = exports.dimension = exports.costCenterType = exports.blanketAgreement = void 0;
const blanketAgreement = __importStar(require("./blanketAgreement"));
exports.blanketAgreement = blanketAgreement;
const costCenterType = __importStar(require("./costCenterType"));
exports.costCenterType = costCenterType;
const dimension = __importStar(require("./dimension"));
exports.dimension = dimension;
const distribution = __importStar(require("./distribution"));
exports.distribution = distribution;
const item = __importStar(require("./item"));
exports.item = item;
const itemGroup = __importStar(require("./itemGroup"));
exports.itemGroup = itemGroup;
const profitCenter = __importStar(require("./profitCenter"));
exports.profitCenter = profitCenter;
const project = __importStar(require("./project"));
exports.project = project;
const genericQuery = __importStar(require("./genericQuery"));
exports.genericQuery = genericQuery;
exports.descriptions = [
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
