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
exports.descriptions = exports.updateField = exports.createGroup = exports.create = void 0;
const create = __importStar(require("./create"));
exports.create = create;
const createGroup = __importStar(require("./createGroup"));
exports.createGroup = createGroup;
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
        default: 'create',
        description: 'Operação a ser executada.',
    },
    ...create.description,
    ...createGroup.description,
    ...updateField.description,
];
