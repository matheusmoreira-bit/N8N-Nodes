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
exports.ERPSAPB1 = void 0;
const attachments = __importStar(require("./actions/attachments"));
const general = __importStar(require("./actions/general"));
const debug = __importStar(require("./actions/debug"));
const inclusion = __importStar(require("./actions/inclusion"));
const item = __importStar(require("./actions/item"));
const supplier = __importStar(require("./actions/supplier"));
const router_1 = require("./actions/router");
const ERPSAPB1Api_1 = require("./transport/ERPSAPB1Api");
class ERPSAPB1 {
    constructor() {
        this.description = {
            displayName: 'SAP Business One',
            name: 'erpSAPB1',
            group: ['output'],
            description: 'Comunicação com ERP SAP B1',
            icon: 'file:sap.png',
            version: 1,
            defaults: {
                name: 'SAP B1',
            },
            inputs: ["main" /* NodeConnectionType.Main */],
            outputs: ["main" /* NodeConnectionType.Main */],
            credentials: ERPSAPB1.credentials,
            properties: [
                {
                    displayName: 'Recurso',
                    name: 'resource',
                    type: 'options',
                    options: [
                        {
                            name: 'Anexos',
                            value: 'attachments',
                        },
                        {
                            name: 'Debug',
                            value: 'debug',
                        },
                        {
                            name: 'Inclusão',
                            value: 'inclusion',
                        },
                        {
                            name: 'Configurações',
                            value: 'general',
                        },
                        {
                            name: 'Fornecedores',
                            value: 'supplier',
                        },
                        {
                            name: 'Itens',
                            value: 'item',
                        },
                    ],
                    default: 'general',
                    description: 'O recurso a ser utilizado pelo conector',
                },
                ...attachments.descriptions,
                ...debug.descriptions,
                ...inclusion.descriptions,
                ...general.descriptions,
                ...item.descriptions,
                ...supplier.descriptions,
            ],
        };
    }
    async execute() {
        const credentials = await this.getCredentials('erpSAPB1Api');
        const api = ERPSAPB1Api_1.ERPSAPB1Api.createInstance(credentials, this);
        // Router returns INodeExecutionData[]
        // We need to output INodeExecutionData[][]
        // So we wrap in []
        return [await router_1.router.call(this, api)];
    }
}
exports.ERPSAPB1 = ERPSAPB1;
ERPSAPB1.credentials = [
    {
        name: 'erpSAPB1Api',
        required: true,
    },
];
