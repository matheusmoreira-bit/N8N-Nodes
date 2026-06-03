"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.descriptions = void 0;
exports.descriptions = [
    {
        displayName: 'Buscar Todas as Páginas',
        name: 'returnAll',
        type: 'boolean',
        default: true,
        description: 'Busca automaticamente todas as páginas retornadas pelo Omie',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Máximo de Itens',
        name: 'maxItems',
        type: 'number',
        default: 0,
        typeOptions: {
            minValue: 0,
        },
        description: 'Quantidade máxima de itens a buscar. Use 0 para não limitar.',
        displayOptions: {
            show: {
                operation: ['list'],
                returnAll: [true],
            },
        },
    },
    {
        displayName: 'Página Inicial',
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
                returnAll: [false],
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
        displayName: 'Baixa Bloqueada',
        name: 'baixaBloqueada',
        type: 'options',
        options: [
            {
                name: 'Todos',
                value: '',
            },
            {
                name: 'Sim',
                value: 'S',
            },
            {
                name: 'Não',
                value: 'N',
            },
        ],
        default: '',
        description: 'Filtra pelo campo baixa_bloqueada retornado pelo Omie',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Bloqueado',
        name: 'bloqueado',
        type: 'options',
        options: [
            {
                name: 'Todos',
                value: '',
            },
            {
                name: 'Sim',
                value: 'S',
            },
            {
                name: 'Não',
                value: 'N',
            },
        ],
        default: '',
        description: 'Filtra pelo campo bloqueado retornado pelo Omie',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Status do Título',
        name: 'statusTitulo',
        type: 'string',
        default: '',
        description: 'Filtra por status_titulo. Para múltiplos status, separe por vírgula.',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Data de Vencimento Inicial',
        name: 'dateFrom',
        type: 'dateTime',
        default: '',
        description: 'Filtra registros com data_vencimento a partir desta data',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Data de Vencimento Final',
        name: 'dateTo',
        type: 'dateTime',
        default: '',
        description: 'Filtra registros com data_vencimento até esta data',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Data de Previsão Inicial',
        name: 'dataPrevisaoFrom',
        type: 'dateTime',
        default: '',
        description: 'Filtra registros com data_previsao a partir desta data',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
    {
        displayName: 'Data de Previsão Final',
        name: 'dataPrevisaoTo',
        type: 'dateTime',
        default: '',
        description: 'Filtra registros com data_previsao até esta data',
        displayOptions: {
            show: {
                operation: ['list'],
            },
        },
    },
];
//# sourceMappingURL=description.js.map