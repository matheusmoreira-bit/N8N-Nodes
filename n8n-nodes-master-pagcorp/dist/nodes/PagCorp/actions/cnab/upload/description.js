"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cnabUploadDescription = void 0;
exports.cnabUploadDescription = [
    {
        displayName: 'Binary Property',
        name: 'binaryPropertyName',
        type: 'string',
        required: true,
        default: 'data',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['upload'],
            },
        },
        description: 'Nome da propriedade binaria que contem o arquivo CNAB',
    },
    {
        displayName: 'Endpoint Path',
        name: 'cnabUploadEndpointPath',
        type: 'string',
        required: true,
        default: 'CNAB/Upload',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['upload'],
            },
        },
        description: 'Caminho relativo ao API Base URL usado para subir o CNAB',
    },
    {
        displayName: 'Request Format',
        name: 'cnabUploadRequestFormat',
        type: 'options',
        required: true,
        default: 'multipart',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['upload'],
            },
        },
        options: [
            {
                name: 'Multipart Form Data',
                value: 'multipart',
            },
            {
                name: 'Raw File Body',
                value: 'raw',
            },
        ],
        description: 'Formato usado para enviar o arquivo CNAB',
    },
    {
        displayName: 'Form File Field Name',
        name: 'cnabUploadFormFileFieldName',
        type: 'string',
        required: true,
        default: 'file',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['upload'],
                cnabUploadRequestFormat: ['multipart'],
            },
        },
        description: 'Nome do campo multipart que recebe o arquivo',
    },
    {
        displayName: 'Additional Fields',
        name: 'cnabUploadAdditionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['upload'],
            },
        },
        options: [
            {
                displayName: 'Content Type',
                name: 'contentType',
                type: 'string',
                default: '',
                placeholder: 'text/plain',
                description: 'Sobrescreve o content type do arquivo',
            },
            {
                displayName: 'Extra Form Fields JSON',
                name: 'formFieldsJson',
                type: 'json',
                default: '{}',
                description: 'Objeto JSON com campos extras enviados no multipart',
            },
            {
                displayName: 'File Name',
                name: 'fileName',
                type: 'string',
                default: '',
                description: 'Sobrescreve o nome do arquivo enviado',
            },
            {
                displayName: 'File Name Field Name',
                name: 'fileNameFieldName',
                type: 'string',
                default: '',
                placeholder: 'fileName',
                description: 'Se preenchido, envia o nome do arquivo tambem como campo multipart',
            },
            {
                displayName: 'Hash Field Name',
                name: 'hashFieldName',
                type: 'string',
                default: '',
                placeholder: 'hash',
                description: 'Se preenchido, envia o SHA-256 do arquivo como campo multipart',
            },
            {
                displayName: 'Query Parameters JSON',
                name: 'queryParametersJson',
                type: 'json',
                default: '{}',
                description: 'Objeto JSON enviado como query string',
            },
        ],
    },
];
