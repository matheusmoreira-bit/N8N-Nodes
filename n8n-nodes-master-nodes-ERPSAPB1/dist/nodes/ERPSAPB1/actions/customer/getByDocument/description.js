"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerGetByDocumentDescription = void 0;
exports.customerGetByDocumentDescription = [
    {
        displayName: 'Número do Documento',
        name: 'document',
        type: 'string',
        default: '',
        required: true,
        description: 'Documentos aceitos: CPF ou CNPJ (com ou sem máscara).',
        displayOptions: {
            show: {
                resource: [
                    'customer',
                ],
                operation: [
                    'getByDocument',
                ],
            },
        },
    },
];
