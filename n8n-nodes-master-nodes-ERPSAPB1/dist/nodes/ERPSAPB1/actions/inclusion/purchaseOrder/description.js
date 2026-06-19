"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inclusionPurchaseOrderDescription = void 0;
exports.inclusionPurchaseOrderDescription = [
    {
        displayName: 'CardCode',
        name: 'cardCode',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
        description: 'Parceiro de negócios do pedido de compra. Opcional quando informar CNPJ/CPF do fornecedor.',
    },
    {
        displayName: 'CNPJ/CPF do Fornecedor',
        name: 'supplierDocument',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
        description: 'Documento do fornecedor para buscar automaticamente o CardCode no SAP.',
    },
    {
        displayName: 'Data do documento',
        name: 'docDate',
        type: 'dateTime',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
    },
    {
        displayName: 'Data do vencimento',
        name: 'dueDate',
        type: 'dateTime',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
    },
    {
        displayName: 'Data fiscal',
        name: 'taxDate',
        type: 'dateTime',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
    },
    {
        displayName: 'BPL_ID',
        name: 'bplId',
        type: 'number',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
        description: 'Filial do documento no SAP.',
    },
    {
        displayName: 'Comentários',
        name: 'comments',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
    },
    {
        displayName: 'Observações Contábeis',
        name: 'journalMemo',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
    },
    {
        displayName: 'Moeda',
        name: 'docCurrency',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
        description: 'Código da moeda do documento (ex.: BRL, USD).',
    },
    {
        displayName: 'Cotação',
        name: 'docRate',
        type: 'number',
        default: '',
        required: false,
        typeOptions: {
            numberPrecision: 6,
        },
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
        description: 'Taxa de câmbio do documento.',
    },
    {
        displayName: 'Campos opcionais',
        name: 'optionalFields',
        type: 'collection',
        placeholder: 'Adicionar campo',
        default: {},
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
        options: [
            {
                displayName: 'AttachmentEntry',
                name: 'attachmentEntry',
                type: 'number',
                default: '',
            },
            {
                displayName: 'SequenceCode',
                name: 'sequenceCode',
                type: 'number',
                default: '',
            },
            {
                displayName: 'SequenceModel',
                name: 'sequenceModel',
                type: 'string',
                default: '',
            },
            {
                displayName: 'SequenceSerial',
                name: 'sequenceSerial',
                type: 'string',
                default: '',
            },
        ],
    },
    {
        displayName: 'Origem dos Anexos',
        name: 'attachmentSource',
        type: 'options',
        default: 'none',
        options: [
            {
                name: 'Nenhum',
                value: 'none',
            },
            {
                name: 'Binário',
                value: 'binary',
            },
            {
                name: 'URL',
                value: 'url',
            },
            {
                name: 'Binário e URL',
                value: 'binaryAndUrl',
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
        description: 'Cria um registro em Attachments2 antes do pedido e envia o AttachmentEntry no PurchaseOrder.',
    },
    {
        displayName: 'Chaves Binárias dos Anexos',
        name: 'attachmentBinaryKeys',
        type: 'string',
        default: 'data',
        required: false,
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
                attachmentSource: [
                    'binary',
                    'binaryAndUrl',
                ],
            },
        },
        description: 'Nomes das propriedades binárias do item de entrada, separados por vírgula. Ex.: data, notaFiscal.',
    },
    {
        displayName: 'URLs dos Anexos',
        name: 'attachmentUrls',
        type: 'fixedCollection',
        placeholder: 'Adicionar URL',
        default: {},
        required: false,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'attachmentUrls',
                displayName: 'URL',
                values: [
                    {
                        displayName: 'URL',
                        name: 'url',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Nome do Arquivo',
                        name: 'fileName',
                        type: 'string',
                        default: '',
                        required: false,
                        description: 'Opcional. Quando vazio, o nome será inferido pelo Content-Disposition ou pela URL.',
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
                attachmentSource: [
                    'url',
                    'binaryAndUrl',
                ],
            },
        },
    },
    {
        displayName: 'Campos dinâmicos',
        name: 'dynamicFields',
        type: 'fixedCollection',
        placeholder: 'Adicionar campo dinâmico',
        default: {},
        required: false,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'dynamicFields',
                displayName: 'Campo',
                values: [
                    {
                        displayName: 'Nome do Campo',
                        name: 'name',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Valor',
                        name: 'value',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
    },
    {
        displayName: 'Modo de Envio das Linhas',
        name: 'documentLinesMode',
        type: 'options',
        default: 'manual',
        options: [
            {
                name: 'Manual',
                value: 'manual',
            },
            {
                name: 'JSON',
                value: 'json',
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
            },
        },
        description: 'Escolhe se as linhas do pedido serão montadas manualmente ou enviadas como JSON.',
    },
    {
        displayName: 'Itens do Pedido',
        name: 'documentLines',
        type: 'fixedCollection',
        placeholder: 'Adicionar item',
        default: {},
        required: false,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'lineValues',
                displayName: 'Item',
                values: [
                    {
                        displayName: 'Código do Item',
                        name: 'itemCode',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Descrição do Item',
                        name: 'itemDescription',
                        type: 'string',
                        default: '',
                        required: true,
                    },
                    {
                        displayName: 'Quantidade',
                        name: 'quantity',
                        type: 'number',
                        default: 1,
                        required: true,
                        typeOptions: {
                            numberPrecision: 2,
                        },
                    },
                    {
                        displayName: 'Preço Unitário',
                        name: 'unitPrice',
                        type: 'number',
                        default: 0,
                        required: true,
                        typeOptions: {
                            numberPrecision: 2,
                        },
                    },
                    {
                        displayName: 'CostingCode',
                        name: 'costingCode',
                        type: 'string',
                        default: '',
                        required: false,
                    },
                    {
                        displayName: 'ProjectCode',
                        name: 'projectCode',
                        type: 'string',
                        default: '',
                        required: false,
                    },
                    {
                        displayName: 'WarehouseCode',
                        name: 'warehouseCode',
                        type: 'string',
                        default: '99',
                        required: false,
                    },
                    {
                        displayName: 'Tipo de Lançamento',
                        name: 'tipoLancamento',
                        type: 'string',
                        default: 'D',
                        required: false,
                        description: 'Enviado como U_FGR_TIPO_LANC na linha do pedido.',
                    },
                    {
                        displayName: 'CostingCodes Opcionais',
                        name: 'costingCodes',
                        type: 'collection',
                        placeholder: 'Adicionar costing code complementar',
                        default: {},
                        options: [
                            {
                                displayName: 'CostingCode2',
                                name: 'costingCode2',
                                type: 'string',
                                default: '',
                            },
                            {
                                displayName: 'CostingCode3',
                                name: 'costingCode3',
                                type: 'string',
                                default: '',
                            },
                            {
                                displayName: 'CostingCode4',
                                name: 'costingCode4',
                                type: 'string',
                                default: '',
                            },
                        ],
                    },
                    {
                        displayName: 'Campos dinâmicos do item',
                        name: 'dynamicFields',
                        type: 'fixedCollection',
                        placeholder: 'Adicionar campo dinâmico',
                        default: {},
                        required: false,
                        typeOptions: {
                            multipleValues: true,
                        },
                        options: [
                            {
                                name: 'dynamicFields',
                                displayName: 'Campo',
                                values: [
                                    {
                                        displayName: 'Nome do Campo',
                                        name: 'name',
                                        type: 'string',
                                        default: '',
                                        required: true,
                                    },
                                    {
                                        displayName: 'Valor',
                                        name: 'value',
                                        type: 'string',
                                        default: '',
                                        required: true,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
                documentLinesMode: [
                    'manual',
                ],
            },
        },
    },
    {
        displayName: 'JSON do DocumentLines',
        name: 'documentLinesJson',
        type: 'string',
        default: '[]',
        required: false,
        typeOptions: {
            rows: 10,
        },
        displayOptions: {
            show: {
                resource: [
                    'inclusion',
                ],
                operation: [
                    'purchaseOrder',
                ],
                documentLinesMode: [
                    'json',
                ],
            },
        },
        description: 'Aceita um array JSON no formato SAP (`ItemCode`, `ItemDescription`, `Quantity`, `UnitPrice`) ou no formato simplificado (`itemCode`, `itemDescription`, `quantity`, `unitPrice`). `CostingCode` e `ProjectCode` são opcionais. No formato simplificado, `warehouseCode` usa `99` e `tipoLancamento` usa `D` quando vazios.',
    },
];
