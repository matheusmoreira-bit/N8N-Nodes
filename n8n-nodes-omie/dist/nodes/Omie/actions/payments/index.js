"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settleExecute = exports.listExecute = exports.descriptions = void 0;
const description_1 = require("./list/description");
const description_2 = require("./settle/description");
const execute_1 = require("./list/execute");
Object.defineProperty(exports, "listExecute", { enumerable: true, get: function () { return execute_1.execute; } });
const execute_2 = require("./settle/execute");
Object.defineProperty(exports, "settleExecute", { enumerable: true, get: function () { return execute_2.execute; } });
const displayOptions_1 = require("../displayOptions");
exports.descriptions = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        options: [
            {
                name: 'Listar',
                value: 'list',
            },
            {
                name: 'Baixar',
                value: 'settle',
            },
        ],
        default: 'list',
        description: 'Operação a ser executada em Pagamentos',
        displayOptions: {
            show: {
                resource: ['payment'],
            },
        },
    },
    ...(0, displayOptions_1.addResourceDisplayOptions)(description_1.descriptions, 'payment'),
    ...(0, displayOptions_1.addResourceDisplayOptions)(description_2.descriptions, 'payment'),
];
//# sourceMappingURL=index.js.map