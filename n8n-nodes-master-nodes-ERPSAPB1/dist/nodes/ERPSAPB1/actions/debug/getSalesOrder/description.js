"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugGetSalesOrderDescription = void 0;
exports.debugGetSalesOrderDescription = [
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
                    'getSalesOrder',
                ],
            },
        },
    },
];
