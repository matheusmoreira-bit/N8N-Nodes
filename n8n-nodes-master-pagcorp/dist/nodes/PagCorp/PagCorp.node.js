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
exports.PagCorp = void 0;
const expense = __importStar(require("./actions/expense"));
const router_1 = require("./actions/router");
const PagCorpApi_1 = require("./transport/PagCorpApi");
class PagCorp {
    constructor() {
        this.description = {
            displayName: 'PagCorp',
            name: 'pagCorp',
            group: ['output'],
            description: 'Consulta despesas na API PagCorp com autenticação criptografada',
            icon: 'file:pagcorp.png',
            version: 1,
            defaults: {
                name: 'PagCorp',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: PagCorp.credentials,
            properties: [
                {
                    displayName: 'Recurso',
                    name: 'resource',
                    type: 'options',
                    options: [
                        {
                            name: 'Expense',
                            value: 'expense',
                        },
                    ],
                    default: 'expense',
                    description: 'Recurso a ser utilizado',
                },
                ...expense.descriptions,
            ],
        };
    }
    async execute() {
        const credentials = await this.getCredentials('pagCorpApi');
        const api = PagCorpApi_1.PagCorpApi.createInstance(credentials, this);
        return [await router_1.router.call(this, api)];
    }
}
exports.PagCorp = PagCorp;
PagCorp.credentials = [
    {
        name: 'pagCorpApi',
        required: true,
    },
];
