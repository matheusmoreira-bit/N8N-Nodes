"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExecute = exports.listExecute = exports.descriptions = void 0;
const description_1 = require("./list/description");
const description_2 = require("./update/description");
const execute_1 = require("./list/execute");
Object.defineProperty(exports, "listExecute", { enumerable: true, get: function () { return execute_1.execute; } });
const execute_2 = require("./update/execute");
Object.defineProperty(exports, "updateExecute", { enumerable: true, get: function () { return execute_2.execute; } });
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
                name: 'Atualizar',
                value: 'update',
            },
        ],
        default: 'list',
        description: 'Operação a ser executada em Fornecedores',
        displayOptions: {
            show: {
                omieResource: ['supplier'],
            },
        },
    },
    ...(0, displayOptions_1.addResourceDisplayOptions)(description_1.descriptions, 'supplier'),
    ...(0, displayOptions_1.addResourceDisplayOptions)(description_2.descriptions, 'supplier'),
];
//# sourceMappingURL=index.js.map