"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Accesstage = void 0;
const form_data_1 = __importDefault(require("form-data"));
const crypto_1 = require("crypto");
const AccesstageApi_1 = require("./transport/AccesstageApi");
const ACCESSTAGE_UPLOAD_HASH_ALGORITHM = 'sha256';
class Accesstage {
    constructor() {
        this.description = {
            displayName: 'Accesstage APUS',
            name: 'accesstage',
            icon: 'file:accesstage-logo.png',
            group: ['transform'],
            version: 1,
            description: 'Upload, download and list files in Accesstage APUS',
            defaults: {
                name: 'Accesstage APUS',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'accesstageApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'File',
                            value: 'file',
                        },
                    ],
                    default: 'file',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Upload',
                            value: 'upload',
                            description: 'Upload a file to APUS',
                            action: 'Upload a file',
                        },
                        {
                            name: 'Download',
                            value: 'download',
                            description: 'Download a returned file from APUS',
                            action: 'Download a file',
                        },
                        {
                            name: 'List Return Files',
                            value: 'list',
                            description: 'List returned files available to download by date range',
                            action: 'List return files',
                        },
                        {
                            name: 'List Transactions',
                            value: 'listTransactions',
                            description: 'List remittance and return transactions by date range',
                            action: 'List transactions',
                        },
                        {
                            name: 'Resubmit File',
                            value: 'resubmit',
                            description: 'Request a file to be made available again',
                            action: 'Resubmit a file',
                        },
                    ],
                    default: 'upload',
                },
                {
                    displayName: 'Company Code',
                    name: 'companyCode',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['upload'],
                        },
                    },
                    default: '',
                    placeholder: '2429631',
                    description: 'Code used in the upload endpoint path',
                    required: true,
                },
                {
                    displayName: 'Binary Property',
                    name: 'binaryPropertyName',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['upload'],
                        },
                    },
                    default: 'data',
                    required: true,
                    description: 'Name of the binary property that contains the file to upload',
                },
                {
                    displayName: 'Hash Algorithm',
                    name: 'hashAlgorithm',
                    type: 'options',
                    displayOptions: {
                        show: {
                            operation: ['upload'],
                        },
                    },
                    options: [
                        { name: 'SHA256', value: 'sha256' },
                    ],
                    default: 'sha256',
                    description: 'Hash sent in the multipart field named hash. Accesstage APUS validates uploads with SHA-256.',
                },
                {
                    displayName: 'Tracking ID',
                    name: 'fileId',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['download', 'resubmit'],
                        },
                    },
                    default: '',
                    placeholder: '00820260518105657455990618',
                    description: 'Tracking returned by the list files endpoint',
                    required: true,
                },
                {
                    displayName: 'Output Binary Property',
                    name: 'outputBinaryPropertyName',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['download'],
                        },
                    },
                    default: 'data',
                    required: true,
                },
                {
                    displayName: 'Output File Name',
                    name: 'outputFileName',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['download'],
                        },
                    },
                    default: '',
                    placeholder: 'retorno.txt',
                    description: 'Optional file name for the downloaded binary data',
                },
                {
                    displayName: 'From',
                    name: 'from',
                    type: 'dateTime',
                    displayOptions: {
                        show: {
                            operation: ['list', 'listTransactions'],
                        },
                    },
                    default: '',
                    description: 'Start date. If empty, today is used.',
                },
                {
                    displayName: 'To',
                    name: 'to',
                    type: 'dateTime',
                    displayOptions: {
                        show: {
                            operation: ['list', 'listTransactions'],
                        },
                    },
                    default: '',
                    description: 'End date. If empty, today is used.',
                },
            ],
        };
    }
    async execute() {
        var _a, _b, _c;
        const inputItems = this.getInputData();
        const items = inputItems.length > 0 ? inputItems : [{ json: {} }];
        const operation = this.getNodeParameter('operation', 0);
        const credentials = await this.getCredentials('accesstageApi');
        const client = new AccesstageApi_1.AccesstageApiClient(credentials);
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            if (operation === 'upload') {
                const companyCode = this.getNodeParameter('companyCode', i);
                const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i);
                const configuredHashAlgorithm = this.getNodeParameter('hashAlgorithm', i, ACCESSTAGE_UPLOAD_HASH_ALGORITHM);
                const hashAlgorithm = ACCESSTAGE_UPLOAD_HASH_ALGORITHM;
                const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
                const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryData);
                const hash = (0, crypto_1.createHash)(hashAlgorithm).update(fileBuffer).digest('hex');
                const fileName = (_a = binaryData.fileName) !== null && _a !== void 0 ? _a : 'arquivo.rem';
                const mimeType = (_b = binaryData.mimeType) !== null && _b !== void 0 ? _b : 'application/octet-stream';
                const form = new form_data_1.default();
                form.append('file', fileBuffer, {
                    filename: fileName,
                    contentType: mimeType,
                });
                form.append('hash', hash);
                const response = await client.upload(companyCode.trim(), form);
                returnData.push({
                    json: {
                        operation,
                        companyCode: companyCode.trim(),
                        fileName,
                        size: fileBuffer.length,
                        hashAlgorithm,
                        configuredHashAlgorithm,
                        hash,
                        response,
                    },
                    pairedItem: { item: i },
                });
                continue;
            }
            if (operation === 'download') {
                const fileId = this.getNodeParameter('fileId', i);
                const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i);
                const configuredFileName = this.getNodeParameter('outputFileName', i);
                const fileName = (configuredFileName === null || configuredFileName === void 0 ? void 0 : configuredFileName.trim()) || `${fileId}.txt`;
                const response = await client.download(fileId.trim());
                const binaryData = await this.helpers.prepareBinaryData(response.data, fileName, 'application/octet-stream');
                returnData.push({
                    json: {
                        operation,
                        tracking: fileId.trim(),
                        fileName,
                        size: response.data.length,
                        contentType: (_c = getHeader(response.headers, 'content-type')) !== null && _c !== void 0 ? _c : 'application/octet-stream',
                    },
                    binary: {
                        [outputBinaryPropertyName]: binaryData,
                    },
                    pairedItem: { item: i },
                });
                continue;
            }
            if (operation === 'list') {
                const from = toApiDate(this.getNodeParameter('from', i, ''));
                const to = toApiDate(this.getNodeParameter('to', i, ''));
                const response = await client.listFiles(from, to);
                const rows = normalizeRows(response);
                for (const row of rows) {
                    returnData.push({
                        json: {
                            from,
                            to,
                            ...row,
                        },
                        pairedItem: { item: i },
                    });
                }
                continue;
            }
            if (operation === 'listTransactions') {
                const from = toApiDate(this.getNodeParameter('from', i, ''));
                const to = toApiDate(this.getNodeParameter('to', i, ''));
                const response = await client.listTransactions(from, to);
                const rows = normalizeRows(response);
                for (const row of rows) {
                    returnData.push({
                        json: {
                            from,
                            to,
                            ...row,
                        },
                        pairedItem: { item: i },
                    });
                }
                continue;
            }
            if (operation === 'resubmit') {
                const fileId = this.getNodeParameter('fileId', i);
                const response = await client.resubmit(fileId.trim());
                returnData.push({
                    json: {
                        operation,
                        tracking: fileId.trim(),
                        response,
                    },
                    pairedItem: { item: i },
                });
                continue;
            }
            throw new Error(`Operação Accesstage não suportada: ${operation}`);
        }
        return [returnData];
    }
}
exports.Accesstage = Accesstage;
function toApiDate(value) {
    if (!value) {
        return formatLocalDate(new Date());
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
        return formatLocalDate(parsedDate);
    }
    return value.slice(0, 10);
}
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function normalizeRows(response) {
    if (Array.isArray(response)) {
        return response;
    }
    const raw = response.raw;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [parsed];
        }
        catch {
            return [response];
        }
    }
    return [response];
}
function getHeader(headers, name) {
    var _a;
    const value = (_a = headers[name]) !== null && _a !== void 0 ? _a : headers[name.toLowerCase()];
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    return typeof value === 'string' ? value : undefined;
}
