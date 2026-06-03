import * as download from './download';
import * as list from './list';
import { INodeProperties } from 'n8n-workflow';

export {
    download,
    list,
};

export const descriptions: INodeProperties[] = [
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
