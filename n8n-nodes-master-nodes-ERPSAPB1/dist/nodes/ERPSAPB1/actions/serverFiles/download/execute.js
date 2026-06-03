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
exports.execute = execute;
const path = __importStar(require("path"));
const helpers_1 = require("../helpers");
async function execute(index) {
    const credentials = await getOptionalCredentials.call(this);
    const basePath = (0, helpers_1.resolveBasePath)(this.getNodeParameter('serverBasePath', index, ''), credentials === null || credentials === void 0 ? void 0 : credentials.basePath);
    const filePath = this.getNodeParameter('serverFilePath', index);
    const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data');
    const { absolutePath, buffer } = await (0, helpers_1.readFileBuffer)(basePath, filePath, credentials);
    const fileName = path.basename(absolutePath);
    const binaryData = await this.helpers.prepareBinaryData(buffer, fileName, 'application/octet-stream');
    return [{
            json: {
                fileName,
                path: absolutePath,
                relativePath: path.relative(basePath, absolutePath),
                basePath,
                size: buffer.length,
                networkCredentialsConfigured: Boolean((credentials === null || credentials === void 0 ? void 0 : credentials.username) || (credentials === null || credentials === void 0 ? void 0 : credentials.domain)),
            },
            binary: {
                [binaryPropertyName]: binaryData,
            },
            pairedItem: { item: index },
        }];
}
async function getOptionalCredentials() {
    try {
        return await this.getCredentials('erpSAPB1ServerFiles');
    }
    catch {
        return undefined;
    }
}
