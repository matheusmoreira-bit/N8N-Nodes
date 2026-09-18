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
exports.descriptions = exports.updateField = exports.list = exports.createGroup = exports.create = void 0;
const create = __importStar(require("./create"));
exports.create = create;
const createGroup = __importStar(require("./createGroup"));
exports.createGroup = createGroup;
const list = __importStar(require("./list"));
exports.list = list;
const updateField = __importStar(require("./updateField"));
exports.updateField = updateField;
exports.descriptions = [
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
