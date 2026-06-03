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
exports.Omie = void 0;
const router_1 = require("./actions/router");
const OmieApi_1 = require("./transport/OmieApi");
const accountsPayable = __importStar(require("./actions/accountsPayable"));
const suppliers = __importStar(require("./actions/suppliers"));
const items = __importStar(require("./actions/items"));
const payments = __importStar(require("./actions/payments"));
class Omie {
    constructor() {
        this.description = {
            displayName: 'Omie',
            name: 'omie',
            icon: 'file:omie.svg',
            group: ['output'],
            version: 1,
            description: 'Operações de compras, fornecedores, itens e contas a pagar no Omie',
            defaults: {
                name: 'Omie',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: Omie.credentials,
            properties: [
                {
                    displayName: 'Recurso',
                    name: 'resource',
                    type: 'options',
                    options: [
                        {
                            name: 'Contas a Pagar',
                            value: 'accountsPayable',
                        },
                        {
                            name: 'Fornecedores',
                            value: 'supplier',
                        },
                        {
                            name: 'Itens',
                            value: 'item',
                        },
                        {
                            name: 'Pagamentos',
                            value: 'payment',
                        },
                    ],
                    default: 'accountsPayable',
                    description: 'Recurso Omie a ser utilizado',
                },
                ...accountsPayable.descriptions,
                ...suppliers.descriptions,
                ...items.descriptions,
                ...payments.descriptions,
            ],
        };
    }
    async execute() {
        const credentials = await this.getCredentials('omieApi');
        const api = OmieApi_1.OmieApi.createInstance(credentials, this);
        const results = await router_1.router.call(this, api);
        return [results];
    }
}
exports.Omie = Omie;
Omie.credentials = [
    {
        name: 'omieApi',
        required: true,
    },
];
//# sourceMappingURL=Omie.node.js.map