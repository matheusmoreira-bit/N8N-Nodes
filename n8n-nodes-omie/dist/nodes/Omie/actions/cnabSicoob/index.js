"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePaymentRemittanceExecute = exports.descriptions = void 0;
const description_1 = require("./generatePaymentRemittance/description");
const execute_1 = require("./generatePaymentRemittance/execute");
Object.defineProperty(exports, "generatePaymentRemittanceExecute", { enumerable: true, get: function () { return execute_1.execute; } });
exports.descriptions = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        options: [
            {
                name: 'Gerar Remessa de Pagamento CNAB 240',
                value: 'generatePaymentRemittance',
            },
        ],
        default: 'generatePaymentRemittance',
        description: 'Operação CNAB 240 Sicoob a ser executada',
        displayOptions: {
            show: {
                resource: ['cnabSicoob'],
            },
        },
    },
    ...description_1.descriptions,
];
//# sourceMappingURL=index.js.map