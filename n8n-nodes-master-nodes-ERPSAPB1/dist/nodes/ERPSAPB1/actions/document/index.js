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
exports.descriptions = exports.updateField = exports.list = exports.create = void 0;
const create = __importStar(require("./create"));
exports.create = create;
const list = __importStar(require("./list"));
exports.list = list;
const updateField = __importStar(require("./updateField"));
exports.updateField = updateField;
const constants_1 = require("./constants");
const documentTypeOptions = [
    {
        name: 'Adiantamento a Cliente',
        value: 'customerDownPayment',
        description: 'Endpoint DownPayments.',
    },
    {
        name: 'Adiantamento a Fornecedor',
        value: 'supplierDownPayment',
        description: 'Endpoint PurchaseDownPayments.',
    },
    {
        name: 'Contas a Pagar',
        value: 'accountsPayable',
        description: 'Endpoint VendorPayments.',
    },
    {
        name: 'Contas a Receber',
        value: 'accountsReceivable',
        description: 'Endpoint IncomingPayments.',
    },
    {
        name: 'Nota Fiscal de Entrada',
        value: 'purchaseInvoice',
        description: 'Endpoint PurchaseInvoices.',
    },
    {
        name: 'Nota Fiscal de Saida',
        value: 'salesInvoice',
        description: 'Endpoint Invoices.',
    },
    {
        name: 'Pedido de Compra',
        value: 'purchaseOrder',
        description: 'Endpoint PurchaseOrders.',
    },
    {
        name: 'Pedido de Venda',
        value: 'salesOrder',
        description: 'Endpoint Orders.',
    },
];
exports.descriptions = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: constants_1.managedDocumentResources,
            },
        },
        options: [
            {
                name: 'Listar',
                value: 'list',
                description: 'Lista documentos no SAP B1.',
            },
            {
                name: 'Criar',
                value: 'create',
                description: 'Cria um documento no SAP B1.',
            },
            {
                name: 'Editar campo',
                value: 'updateField',
                description: 'Atualiza um ou mais campos do documento no SAP B1.',
            },
        ],
        default: 'list',
        description: 'Operação a ser executada.',
    },
    {
        displayName: 'Tipo de Documento',
        name: 'documentType',
        type: 'options',
        noDataExpression: true,
        options: documentTypeOptions,
        default: 'purchaseOrder',
        displayOptions: {
            show: {
                resource: [
                    'document',
                ],
            },
        },
        description: 'Documento do SAP B1 a ser lido ou criado.',
    },
    ...create.description,
    ...list.description,
    ...updateField.description,
];
