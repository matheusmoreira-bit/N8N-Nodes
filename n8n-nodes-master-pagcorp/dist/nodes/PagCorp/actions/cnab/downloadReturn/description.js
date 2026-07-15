"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cnabDownloadReturnDescription = void 0;
exports.cnabDownloadReturnDescription = [
    {
        displayName: 'Return ID',
        name: 'returnId',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['downloadReturn'],
            },
        },
        description: 'Identificador do retorno CNAB. Substitui {returnId} no Endpoint Path',
    },
    {
        displayName: 'Endpoint Path',
        name: 'cnabDownloadReturnEndpointPath',
        type: 'string',
        required: true,
        default: 'CNAB/Return/{returnId}',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['downloadReturn'],
            },
        },
        description: 'Caminho relativo ao API Base URL usado para baixar o retorno CNAB',
    },
    {
        displayName: 'Output Binary Property',
        name: 'outputBinaryPropertyName',
        type: 'string',
        required: true,
        default: 'data',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['downloadReturn'],
            },
        },
        description: 'Nome da propriedade binaria que recebera o arquivo de retorno',
    },
    {
        displayName: 'Output File Name',
        name: 'outputFileName',
        type: 'string',
        required: false,
        default: '',
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['downloadReturn'],
            },
        },
        placeholder: 'retorno.ret',
        description: 'Nome opcional para o arquivo baixado',
    },
    {
        displayName: 'Additional Fields',
        name: 'cnabDownloadReturnAdditionalFields',
        type: 'collection',
        placeholder: 'Add Field',
        default: {},
        displayOptions: {
            show: {
                resource: ['cnab'],
                operation: ['downloadReturn'],
            },
        },
        options: [
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
