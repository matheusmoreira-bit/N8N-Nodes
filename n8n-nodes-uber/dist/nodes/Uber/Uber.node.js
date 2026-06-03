"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Uber = void 0;
const sync_1 = require("csv-parse/sync");
const UberSftpClient_1 = require("./transport/UberSftpClient");
const DATE_FIELD_CANDIDATES = [
    'date',
    'data',
    'data_corrida',
    'trip_date',
    'tripDate',
    'request_date',
    'requestDate',
    'request_time',
    'requestTime',
    'start_time',
    'startTime',
    'begin_trip_time',
    'beginTripTime',
    'pickup_time',
    'pickupTime',
];
class Uber {
    constructor() {
        this.description = {
            displayName: 'Uber SFTP',
            name: 'uber',
            icon: 'file:uber-logo.png',
            group: ['transform'],
            version: 1,
            description: 'List, download and read Uber files from SFTP',
            defaults: {
                name: 'Uber SFTP',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'uberSftpApi',
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
                        { name: 'File', value: 'file' },
                        { name: 'Ride', value: 'ride' },
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
                            name: 'List Files',
                            value: 'listFiles',
                            description: 'List files in a SFTP folder',
                            action: 'List files',
                        },
                        {
                            name: 'Download File',
                            value: 'downloadFile',
                            description: 'Download one file from SFTP',
                            action: 'Download a file',
                        },
                        {
                            name: 'Get Rides',
                            value: 'getRides',
                            description: 'Read ride files and return rides by period',
                            action: 'Get rides',
                        },
                    ],
                    default: 'listFiles',
                },
                {
                    displayName: 'Directory Path',
                    name: 'directoryPath',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['file'],
                            operation: ['listFiles'],
                        },
                    },
                    default: '/',
                    placeholder: '/reports',
                    description: 'Folder to list. Relative paths are resolved from credential Base Path.',
                },
                {
                    displayName: 'File Path',
                    name: 'filePath',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['file'],
                            operation: ['downloadFile'],
                        },
                    },
                    default: '',
                    placeholder: '/reports/rides.csv',
                    required: true,
                },
                {
                    displayName: 'Ride Files Path',
                    name: 'rideFilesPath',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['ride'],
                            operation: ['getRides'],
                        },
                    },
                    default: '/',
                    placeholder: '/reports/rides',
                    description: 'Folder or file containing ride reports',
                    required: true,
                },
                {
                    displayName: 'Recursive',
                    name: 'recursive',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            operation: ['listFiles', 'getRides'],
                        },
                    },
                    default: false,
                    description: 'Whether to include files from subfolders',
                },
                {
                    displayName: 'Modified From',
                    name: 'modifiedFrom',
                    type: 'dateTime',
                    displayOptions: {
                        show: {
                            operation: ['listFiles'],
                        },
                    },
                    default: '',
                    description: 'Only return files modified on or after this date',
                },
                {
                    displayName: 'Modified To',
                    name: 'modifiedTo',
                    type: 'dateTime',
                    displayOptions: {
                        show: {
                            operation: ['listFiles'],
                        },
                    },
                    default: '',
                    description: 'Only return files modified on or before this date',
                },
                {
                    displayName: 'File Name Contains',
                    name: 'fileNameContains',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['listFiles', 'getRides'],
                        },
                    },
                    default: '',
                },
                {
                    displayName: 'File Name Regex',
                    name: 'fileNameRegex',
                    type: 'string',
                    displayOptions: {
                        show: {
                            operation: ['listFiles', 'getRides'],
                        },
                    },
                    default: '',
                    placeholder: '.*\\.csv$',
                    description: 'Optional JavaScript regular expression to filter file names',
                },
                {
                    displayName: 'Output Binary Property',
                    name: 'outputBinaryPropertyName',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['file'],
                            operation: ['downloadFile'],
                        },
                    },
                    default: 'data',
                    required: true,
                },
                {
                    displayName: 'From',
                    name: 'from',
                    type: 'dateTime',
                    displayOptions: {
                        show: {
                            resource: ['ride'],
                            operation: ['getRides'],
                        },
                    },
                    default: '',
                    required: true,
                    description: 'Ride period start',
                },
                {
                    displayName: 'To',
                    name: 'to',
                    type: 'dateTime',
                    displayOptions: {
                        show: {
                            resource: ['ride'],
                            operation: ['getRides'],
                        },
                    },
                    default: '',
                    required: true,
                    description: 'Ride period end',
                },
                {
                    displayName: 'Date Field',
                    name: 'dateField',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['ride'],
                            operation: ['getRides'],
                        },
                    },
                    default: '',
                    placeholder: 'request_time',
                    description: 'Ride date field. Leave empty to auto-detect common fields.',
                },
                {
                    displayName: 'File Format',
                    name: 'fileFormat',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['ride'],
                            operation: ['getRides'],
                        },
                    },
                    options: [
                        { name: 'Auto Detect', value: 'auto' },
                        { name: 'CSV', value: 'csv' },
                        { name: 'JSON', value: 'json' },
                    ],
                    default: 'auto',
                },
                {
                    displayName: 'CSV Delimiter',
                    name: 'csvDelimiter',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['ride'],
                            operation: ['getRides'],
                        },
                    },
                    default: ',',
                    description: 'Delimiter used when reading CSV files',
                },
                {
                    displayName: 'Encoding',
                    name: 'encoding',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['ride'],
                            operation: ['getRides'],
                        },
                    },
                    options: [
                        { name: 'UTF-8', value: 'utf8' },
                        { name: 'Latin1', value: 'latin1' },
                    ],
                    default: 'utf8',
                },
                {
                    displayName: 'Max Files',
                    name: 'maxFiles',
                    type: 'number',
                    displayOptions: {
                        show: {
                            resource: ['ride'],
                            operation: ['getRides'],
                        },
                    },
                    default: 100,
                    typeOptions: {
                        minValue: 1,
                    },
                    description: 'Maximum number of report files to read',
                },
            ],
        };
    }
    async execute() {
        const inputItems = this.getInputData();
        const items = inputItems.length > 0 ? inputItems : [{ json: {} }];
        const operation = this.getNodeParameter('operation', 0);
        const credentials = await this.getCredentials('uberSftpApi');
        const sftp = new UberSftpClient_1.UberSftpClient(credentials);
        const returnData = [];
        await sftp.connect();
        try {
            for (let i = 0; i < items.length; i++) {
                if (operation === 'listFiles') {
                    const directoryPath = this.getNodeParameter('directoryPath', i);
                    const recursive = this.getNodeParameter('recursive', i);
                    const modifiedFrom = parseDateParameter(this.getNodeParameter('modifiedFrom', i, ''));
                    const modifiedTo = parseDateParameter(this.getNodeParameter('modifiedTo', i, ''), true);
                    const filteredFiles = filterFiles(await sftp.list(directoryPath, recursive), {
                        fileNameContains: this.getNodeParameter('fileNameContains', i, ''),
                        fileNameRegex: this.getNodeParameter('fileNameRegex', i, ''),
                        modifiedFrom,
                        modifiedTo,
                    });
                    for (const file of filteredFiles) {
                        returnData.push({
                            json: serializeFile(file),
                            pairedItem: { item: i },
                        });
                    }
                    continue;
                }
                if (operation === 'downloadFile') {
                    const filePath = this.getNodeParameter('filePath', i);
                    const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i);
                    const fileBuffer = await sftp.download(filePath);
                    const fileName = filePath.split('/').filter(Boolean).pop() || 'uber-file';
                    const binaryData = await this.helpers.prepareBinaryData(fileBuffer, fileName, 'application/octet-stream');
                    returnData.push({
                        json: {
                            filePath: sftp.resolvePath(filePath),
                            fileName,
                            size: fileBuffer.length,
                        },
                        binary: {
                            [outputBinaryPropertyName]: binaryData,
                        },
                        pairedItem: { item: i },
                    });
                    continue;
                }
                if (operation === 'getRides') {
                    const ridesPath = this.getNodeParameter('rideFilesPath', i);
                    const recursive = this.getNodeParameter('recursive', i);
                    const from = parseRequiredDate(this.getNodeParameter('from', i, ''), 'From');
                    const to = parseRequiredDate(this.getNodeParameter('to', i, ''), 'To', true);
                    const dateField = this.getNodeParameter('dateField', i, '');
                    const fileFormat = this.getNodeParameter('fileFormat', i);
                    const csvDelimiter = this.getNodeParameter('csvDelimiter', i);
                    const encoding = this.getNodeParameter('encoding', i);
                    const maxFiles = Number(this.getNodeParameter('maxFiles', i));
                    const files = await resolveRideFiles(sftp, ridesPath, recursive);
                    const filteredFiles = filterFiles(files, {
                        fileNameContains: this.getNodeParameter('fileNameContains', i, ''),
                        fileNameRegex: this.getNodeParameter('fileNameRegex', i, ''),
                    }).slice(0, maxFiles);
                    for (const file of filteredFiles) {
                        const fileBuffer = await sftp.download(file.path);
                        const rides = parseRideFile(fileBuffer, file.path, {
                            format: fileFormat,
                            csvDelimiter,
                            encoding,
                        });
                        for (const ride of rides) {
                            const rideDate = getRideDate(ride, dateField);
                            if (!rideDate || rideDate < from || rideDate > to) {
                                continue;
                            }
                            returnData.push({
                                json: {
                                    ...ride,
                                    _uberSftp: {
                                        sourceFile: file.path,
                                        rideDate: rideDate.toISOString(),
                                    },
                                },
                                pairedItem: { item: i },
                            });
                        }
                    }
                    continue;
                }
                throw new Error(`Operação Uber SFTP não suportada: ${operation}`);
            }
        }
        finally {
            await sftp.end();
        }
        return [returnData];
    }
}
exports.Uber = Uber;
function filterFiles(files, filters) {
    var _a, _b;
    const contains = (_a = filters.fileNameContains) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
    const regex = ((_b = filters.fileNameRegex) === null || _b === void 0 ? void 0 : _b.trim()) ? new RegExp(filters.fileNameRegex.trim()) : undefined;
    return files.filter((file) => {
        if (contains && !file.name.toLowerCase().includes(contains)) {
            return false;
        }
        if (regex && !regex.test(file.name)) {
            return false;
        }
        if (filters.modifiedFrom || filters.modifiedTo) {
            const modified = file.modifyTime ? new Date(file.modifyTime) : undefined;
            if (!modified) {
                return false;
            }
            if (filters.modifiedFrom && modified < filters.modifiedFrom) {
                return false;
            }
            if (filters.modifiedTo && modified > filters.modifiedTo) {
                return false;
            }
        }
        return true;
    });
}
function serializeFile(file) {
    return {
        name: file.name,
        path: file.path,
        type: file.type,
        size: file.size,
        modifyTime: file.modifyTime,
        modifiedAt: file.modifyTime ? new Date(file.modifyTime).toISOString() : undefined,
        accessTime: file.accessTime,
        accessedAt: file.accessTime ? new Date(file.accessTime).toISOString() : undefined,
    };
}
async function resolveRideFiles(sftp, path, recursive) {
    try {
        return await sftp.list(path, recursive);
    }
    catch (error) {
        const resolvedPath = sftp.resolvePath(path);
        const name = resolvedPath.split('/').filter(Boolean).pop() || resolvedPath;
        return [{
                name,
                path: resolvedPath,
                type: '-',
                size: 0,
            }];
    }
}
function parseRideFile(buffer, filePath, options) {
    const format = detectFormat(filePath, options.format);
    const content = buffer.toString(options.encoding).replace(/^\uFEFF/, '');
    if (format === 'json') {
        return extractJsonRows(JSON.parse(content));
    }
    return (0, sync_1.parse)(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter: options.csvDelimiter || ',',
        relax_column_count: true,
    });
}
function detectFormat(filePath, configuredFormat) {
    if (configuredFormat === 'csv' || configuredFormat === 'json') {
        return configuredFormat;
    }
    return filePath.toLowerCase().endsWith('.json') ? 'json' : 'csv';
}
function extractJsonRows(data) {
    if (Array.isArray(data)) {
        return data.filter(isDataObject);
    }
    if (isDataObject(data)) {
        for (const key of ['rides', 'trips', 'data', 'items', 'results']) {
            const value = data[key];
            if (Array.isArray(value)) {
                return value.filter(isDataObject);
            }
        }
        return [data];
    }
    return [];
}
function getRideDate(ride, configuredDateField) {
    const fields = configuredDateField.trim() ? [configuredDateField.trim()] : DATE_FIELD_CANDIDATES;
    for (const field of fields) {
        const value = getNestedValue(ride, field);
        const parsed = parseDateValue(value);
        if (parsed) {
            return parsed;
        }
    }
    return undefined;
}
function getNestedValue(data, path) {
    return path.split('.').reduce((current, part) => {
        if (!isDataObject(current)) {
            return undefined;
        }
        return current[part];
    }, data);
}
function parseDateValue(value) {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }
    if (typeof value === 'number') {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? undefined : date;
    }
    if (typeof value !== 'string' || !value.trim()) {
        return undefined;
    }
    const normalized = normalizeBrazilianDate(value.trim());
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? undefined : date;
}
function normalizeBrazilianDate(value) {
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})(.*)$/);
    if (!match) {
        return value;
    }
    const [, day, month, year, rest] = match;
    return `${year}-${month}-${day}${rest}`;
}
function parseDateParameter(value, endOfDay = false) {
    if (!value) {
        return undefined;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }
    if (endOfDay && value.length <= 10) {
        date.setHours(23, 59, 59, 999);
    }
    return date;
}
function parseRequiredDate(value, fieldName, endOfDay = false) {
    const date = parseDateParameter(value, endOfDay);
    if (!date) {
        throw new Error(`Campo obrigatório '${fieldName}' precisa ser uma data válida.`);
    }
    return date;
}
function isDataObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
