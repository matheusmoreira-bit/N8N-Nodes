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
exports.descriptions = exports.vendorPayment = exports.purchaseOrder = exports.manualJournalEntry = void 0;
const manualJournalEntry = __importStar(require("./manualJournalEntry"));
exports.manualJournalEntry = manualJournalEntry;
const purchaseOrder = __importStar(require("./purchaseOrder"));
exports.purchaseOrder = purchaseOrder;
const vendorPayment = __importStar(require("./vendorPayment"));
exports.vendorPayment = vendorPayment;
exports.descriptions = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
            },
        },
        options: [
            {
                name: 'Pedido de compra',
                value: 'purchaseOrder',
                description: 'Inclui um novo pedido de compra no SAP B1.',
            },
            {
                name: 'Lançamento contábil manual',
                value: 'manualJournalEntry',
                description: 'Inclui um novo lançamento contábil manual no SAP B1.',
            },
            {
                name: 'Baixa de NF/PC',
                value: 'vendorPayment',
                description: 'Inclui uma baixa de documento de fornecedor no endpoint VendorPayments.',
            },
        ],
        default: 'purchaseOrder',
        description: 'Operação a ser executada.',
    },
    ...purchaseOrder.description,
    ...manualJournalEntry.description,
    ...vendorPayment.description,
];
