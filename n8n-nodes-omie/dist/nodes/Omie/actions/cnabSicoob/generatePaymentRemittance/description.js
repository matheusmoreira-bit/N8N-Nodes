"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.descriptions = void 0;
const displayOptions = {
    show: {
        resource: ['cnabSicoob'],
        operation: ['generatePaymentRemittance'],
    },
};
exports.descriptions = [
    {
        displayName: 'Nome do Arquivo',
        name: 'fileName',
        type: 'string',
        default: '',
        placeholder: 'PG03062601.REM',
        description: 'Nome do arquivo de remessa. Se vazio, será gerado automaticamente.',
        displayOptions,
    },
    {
        displayName: 'Sequencial do Arquivo',
        name: 'fileSequence',
        type: 'number',
        default: 1,
        typeOptions: {
            minValue: 1,
            maxValue: 999999,
        },
        description: 'Número sequencial da remessa no dia/convênio',
        displayOptions,
    },
    {
        displayName: 'Gerar Mesmo Com Dados Incompletos',
        name: 'ignorePaymentErrors',
        type: 'boolean',
        default: true,
        description: 'Quando ativo, pula pagamentos inválidos e retorna avisos no JSON de saída',
        displayOptions,
    },
    {
        displayName: 'Buscar Dados Completos no Omie',
        name: 'fetchDetailsFromOmie',
        type: 'boolean',
        default: true,
        description: 'Consulta cada conta a pagar pelo código do lançamento antes de gerar o CNAB para tentar obter código de barras/linha digitável',
        displayOptions,
    },
    {
        displayName: 'Convênio Sicoob',
        name: 'companyConvenio',
        type: 'string',
        default: '',
        required: true,
        description: 'Código/convênio fornecido pelo Sicoob para troca de arquivos',
        displayOptions,
    },
    {
        displayName: 'Tipo de Inscrição da Empresa',
        name: 'companyTipoInscricao',
        type: 'options',
        options: [
            {
                name: 'CPF',
                value: '1',
            },
            {
                name: 'CNPJ',
                value: '2',
            },
        ],
        default: '2',
        displayOptions,
    },
    {
        displayName: 'CPF/CNPJ da Empresa',
        name: 'companyNumeroInscricao',
        type: 'string',
        default: '',
        required: true,
        displayOptions,
    },
    {
        displayName: 'Agência da Empresa',
        name: 'companyAgencia',
        type: 'string',
        default: '',
        required: true,
        displayOptions,
    },
    {
        displayName: 'Conta da Empresa',
        name: 'companyConta',
        type: 'string',
        default: '',
        required: true,
        displayOptions,
    },
    {
        displayName: 'DV da Conta da Empresa',
        name: 'companyContaDv',
        type: 'string',
        default: '',
        required: true,
        displayOptions,
    },
    {
        displayName: 'Nome da Empresa',
        name: 'companyNome',
        type: 'string',
        default: '',
        required: true,
        displayOptions,
    },
    {
        displayName: 'Endereço da Empresa',
        name: 'companyEndereco',
        type: 'string',
        default: '',
        displayOptions,
    },
    {
        displayName: 'Número do Endereço da Empresa',
        name: 'companyNumeroEndereco',
        type: 'string',
        default: '',
        displayOptions,
    },
    {
        displayName: 'Complemento da Empresa',
        name: 'companyComplemento',
        type: 'string',
        default: '',
        displayOptions,
    },
    {
        displayName: 'Cidade da Empresa',
        name: 'companyCidade',
        type: 'string',
        default: '',
        displayOptions,
    },
    {
        displayName: 'CEP da Empresa',
        name: 'companyCep',
        type: 'string',
        default: '',
        displayOptions,
    },
    {
        displayName: 'UF da Empresa',
        name: 'companyUf',
        type: 'string',
        default: '',
        displayOptions,
    },
    {
        displayName: 'Tipo de Inscrição do Favorecido',
        name: 'tipoInscricaoFavorecidoDefault',
        type: 'options',
        options: [
            {
                name: 'Detectar CPF/CNPJ Pelo Tamanho',
                value: 'auto',
            },
            {
                name: 'CPF',
                value: '1',
            },
            {
                name: 'CNPJ',
                value: '2',
            },
        ],
        default: 'auto',
        displayOptions,
    },
];
//# sourceMappingURL=description.js.map