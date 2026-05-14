"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugGetInvoiceDescription = void 0;
exports.debugGetInvoiceDescription = [
    {
        displayName: 'Número do documento',
        name: 'docNum',
        type: 'number',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: [
                    'debug',
                ],
                operation: [
                    'getInvoice',
                ],
            },
        },
    },
];
