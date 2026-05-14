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
const attachments = __importStar(require("./attachments"));
const general = __importStar(require("./general"));
const debug = __importStar(require("./debug"));
const inclusion = __importStar(require("./inclusion"));
const item = __importStar(require("./item"));
const supplier = __importStar(require("./supplier"));
async function router(api) {
    const items = this.getInputData();
    const operationResult = [];
    for (let i = 0; i < items.length; i++) {
        const resource = this.getNodeParameter('resource', i);
        const operation = this.getNodeParameter('operation', i);
        const erpsapb1 = {
            resource,
            operation,
        };
        try {
            if (erpsapb1.resource === 'attachments') {
                operationResult.push(...await attachments[erpsapb1.operation].execute.call(this, api, i));
            }
            else if (erpsapb1.resource === 'general') {
                operationResult.push(...await general[erpsapb1.operation].execute.call(this, api, i));
            }
            else if (erpsapb1.resource === 'debug') {
                operationResult.push(...await debug[erpsapb1.operation].execute.call(this, api, i));
            }
            else if (erpsapb1.resource === 'inclusion') {
                operationResult.push(...await inclusion[erpsapb1.operation].execute.call(this, api, i));
            }
            else if (erpsapb1.resource === 'item') {
                operationResult.push(...await item[erpsapb1.operation].execute.call(this, api, i));
            }
            else if (erpsapb1.resource === 'supplier') {
                if (erpsapb1.operation === 'getByDocument') {
                    operationResult.push(...await supplier[erpsapb1.operation].execute.call(this, api, i));
                    continue;
                }
                operationResult.push(...await supplier[erpsapb1.operation].execute.call(this, api, i));
                if (erpsapb1.operation === 'list') {
                    break;
                }
            }
        }
        catch (err) {
            if (this.continueOnFail()) {
                operationResult.push({ json: items[i].json, error: err });
            }
            else {
                throw err;
            }
        }
    }
    return operationResult;
}
