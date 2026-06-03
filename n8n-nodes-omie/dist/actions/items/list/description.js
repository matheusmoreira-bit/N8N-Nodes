"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.descriptions = void 0;
exports.descriptions = [
    {
        displayName: 'Página',
        name: 'page',
        type: 'number',
        default: 1,
        typeOptions: {
            minValue: 1,
        },
        description: 'Página a ser retornada pela API',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Registros por página',
        name: 'pageSize',
        type: 'number',
        default: 50,
        typeOptions: {
            minValue: 1,
            maxValue: 200,
        },
        description: 'Quantidade de registros por página',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Somente importado pela API',
        name: 'onlyApiImported',
        type: 'boolean',
        default: false,
        description: 'Retorna apenas registros criados pela API Omie',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Código do item Omie',
        name: 'codigoItemOmie',
        type: 'string',
        default: '',
        description: 'Filtra pelo código do item no Omie',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Descrição',
        name: 'descricao',
        type: 'string',
        default: '',
        description: 'Filtra pela descrição do item',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
];
//# sourceMappingURL=description.js.map