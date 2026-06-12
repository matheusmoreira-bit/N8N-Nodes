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
exports.router = router;
const accountsPayable = __importStar(require("./accountsPayable"));
const suppliers = __importStar(require("./suppliers"));
const items = __importStar(require("./items"));
const payments = __importStar(require("./payments"));
const cnabSicoob = __importStar(require("./cnabSicoob"));
function getOmieResource(context, itemIndex) {
    return context.getNodeParameter('omieResource', itemIndex, context.getNodeParameter('resource', itemIndex, 'accountsPayable'));
}
async function router(api) {
    const inputItems = this.getInputData();
    const operationResult = [];
    const resource = getOmieResource(this, 0);
    const operation = this.getNodeParameter('operation', 0);
    if (resource === 'cnabSicoob') {
        if (operation === 'generatePaymentRemittance') {
            return cnabSicoob.generatePaymentRemittanceExecute.call(this, api);
        }
        throw new Error(`Operação '${operation}' não suportada para CNAB 240 Sicoob.`);
    }
    for (let i = 0; i < inputItems.length; i++) {
        const resource = getOmieResource(this, i);
        const operation = this.getNodeParameter('operation', i);
        try {
            if (resource === 'accountsPayable') {
                if (operation === 'list') {
                    operationResult.push(...await accountsPayable.listExecute.call(this, api, i));
                }
                else if (operation === 'settle') {
                    operationResult.push(...await accountsPayable.settleExecute.call(this, api, i));
                }
                else {
                    throw new Error(`Operação '${operation}' não suportada para contas a pagar.`);
                }
            }
            else if (resource === 'supplier') {
                if (operation === 'list') {
                    operationResult.push(...await suppliers.listExecute.call(this, api, i));
                }
                else if (operation === 'update') {
                    operationResult.push(...await suppliers.updateExecute.call(this, api, i));
                }
                else {
                    throw new Error(`Operação '${operation}' não suportada para fornecedores.`);
                }
            }
            else if (resource === 'item') {
                if (operation === 'list') {
                    operationResult.push(...await items.listExecute.call(this, api, i));
                }
                else if (operation === 'update') {
                    operationResult.push(...await items.updateExecute.call(this, api, i));
                }
                else {
                    throw new Error(`Operação '${operation}' não suportada para itens.`);
                }
            }
            else if (resource === 'payment') {
                if (operation === 'list') {
                    operationResult.push(...await payments.listExecute.call(this, api, i));
                }
                else if (operation === 'settle') {
                    operationResult.push(...await payments.settleExecute.call(this, api, i));
                }
                else {
                    throw new Error(`Operação '${operation}' não suportada para pagamentos.`);
                }
            }
            else {
                throw new Error(`Recurso '${resource}' não está implementado.`);
            }
        }
        catch (err) {
            if (this.continueOnFail()) {
                operationResult.push({ json: inputItems[i].json, error: err });
            }
            else {
                throw err;
            }
        }
    }
    return operationResult;
}
//# sourceMappingURL=router.js.map