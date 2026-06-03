"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.descriptions = exports.list = exports.download = void 0;
const download = __importStar(require("./download"));
exports.download = download;
const list = __importStar(require("./list"));
exports.list = list;
exports.descriptions = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: [
                    'serverFiles',
                ],
            },
        },
        options: [
            {
                name: 'Listar Arquivos',
                value: 'list',
                description: 'Lista arquivos em uma pasta local/montada do servidor SAP.',
            },
            {
                name: 'Baixar Arquivo',
                value: 'download',
                description: 'Baixa um arquivo de uma pasta local/montada do servidor SAP.',
            },
        ],
        default: 'list',
        description: 'Operação a ser executada.',
    },
    {
        displayName: 'Caminho Base',
        name: 'serverBasePath',
        type: 'string',
        default: '',
        placeholder: '/mnt/sap-files',
        displayOptions: {
            show: {
                resource: ['serverFiles'],
            },
        },
        description: 'Pasta base local/montada. Se vazio, usa o Caminho Base da credencial opcional SAP B1 Server Files.',
    },
    {
        displayName: 'Pasta',
        name: 'serverFolderPath',
        type: 'string',
        default: '.',
        placeholder: 'entrada/notas',
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['list'],
            },
        },
        description: 'Pasta a listar. Pode ser relativa ao Caminho Base ou absoluta.',
    },
    {
        displayName: 'Arquivo',
        name: 'serverFilePath',
        type: 'string',
        default: '',
        placeholder: 'entrada/notas/arquivo.xml',
        required: true,
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['download'],
            },
        },
        description: 'Arquivo a baixar. Pode ser relativo ao Caminho Base ou absoluto.',
    },
    {
        displayName: 'Recursivo',
        name: 'recursive',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['list'],
            },
        },
        description: 'Se ativo, lista arquivos em subpastas.',
    },
    {
        displayName: 'Incluir Pastas',
        name: 'includeDirectories',
        type: 'boolean',
        default: false,
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['list'],
            },
        },
        description: 'Se ativo, retorna diretórios junto com arquivos.',
    },
    {
        displayName: 'Criado A Partir De',
        name: 'createdFrom',
        type: 'dateTime',
        default: '',
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['list'],
            },
        },
        description: 'Retorna arquivos criados a partir desta data.',
    },
    {
        displayName: 'Criado Até',
        name: 'createdTo',
        type: 'dateTime',
        default: '',
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['list'],
            },
        },
        description: 'Retorna arquivos criados até esta data.',
    },
    {
        displayName: 'Nome Contém',
        name: 'fileNameContains',
        type: 'string',
        default: '',
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['list'],
            },
        },
        description: 'Filtro opcional por trecho do nome do arquivo.',
    },
    {
        displayName: 'Regex do Nome',
        name: 'fileNameRegex',
        type: 'string',
        default: '',
        placeholder: '.*\\.xml$',
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['list'],
            },
        },
        description: 'Expressão regular opcional para filtrar nomes de arquivos.',
    },
    {
        displayName: 'Máximo de Itens',
        name: 'maxItems',
        type: 'number',
        default: 0,
        typeOptions: {
            minValue: 0,
            numberPrecision: 0,
        },
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['list'],
            },
        },
        description: 'Limite máximo de arquivos retornados. Use 0 para não limitar.',
    },
    {
        displayName: 'Propriedade Binária',
        name: 'binaryPropertyName',
        type: 'string',
        default: 'data',
        required: true,
        displayOptions: {
            show: {
                resource: ['serverFiles'],
                operation: ['download'],
            },
        },
        description: 'Nome da propriedade binária de saída.',
    },
];
