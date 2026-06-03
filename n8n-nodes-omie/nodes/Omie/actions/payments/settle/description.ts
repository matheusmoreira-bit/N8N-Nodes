import { INodeProperties } from 'n8n-workflow';

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Código do Lançamento Omie',
        name: 'codigoLancamento',
        type: 'number',
        default: 0,
        required: true,
        description: 'Código do lançamento do contas a pagar no Omie',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Código de integração do lançamento',
        name: 'codigoLancamentoIntegracao',
        type: 'string',
        default: '',
        description: 'Código de integração do lançamento no sistema externo',
        displayOptions: {
            show: {
                operation: ['settle'],
            },
        },
    },
    {
        displayName: 'Valor do pagamento',
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
        displayName: 'Data de baixa',
        name: 'paymentDate',
        type: 'dateTime',
        default: '',
        required: true,
        description: 'Data de baixa do pagamento',
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
        displayName: 'Conciliar documento',
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
