import { INodeProperties } from 'n8n-workflow';

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Código do Lançamento Omie',
        name: 'codigoLancamento',
        type: 'number',
        default: 0,
        required: true,
        description: 'Código do lançamento da conta a pagar no Omie',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Código de Integração do Lançamento',
        name: 'codigoLancamentoIntegracao',
        type: 'string',
        default: '',
        description: 'Código de integração do lançamento Omie (opcional)',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Valor do Pagamento',
        name: 'paymentAmount',
        type: 'number',
        default: 0,
        required: true,
        description: 'Valor a ser baixado no contas a pagar',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Data de Baixa',
        name: 'paymentDate',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'Data da baixa do pagamento',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Desconto',
        name: 'discount',
        type: 'number',
        default: 0,
        description: 'Valor de desconto aplicado no pagamento',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Juros',
        name: 'interest',
        type: 'number',
        default: 0,
        description: 'Valor de juros aplicado no pagamento',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Multa',
        name: 'fine',
        type: 'number',
        default: 0,
        description: 'Valor de multa aplicado no pagamento',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Observação',
        name: 'observation',
        type: 'string',
        default: '',
        description: 'Observação da baixa do contas a pagar',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Conciliar Documento',
        name: 'conciliateDocument',
        type: 'boolean',
        default: false,
        description: 'Efetua a conciliação do documento automaticamente',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
];
