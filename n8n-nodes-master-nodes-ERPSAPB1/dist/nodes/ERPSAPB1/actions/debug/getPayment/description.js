"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugGetPaymentDescription = void 0;
exports.debugGetPaymentDescription = [
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
                    'getPayment',
                ],
            },
        },
    },
];
