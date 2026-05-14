import { InclusionProperties } from '../../Interfaces';

export const inclusionVendorPaymentDescription: InclusionProperties = [
    {
        displayName: 'DocDate',
        name: 'docDate',
        type: 'dateTime',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
    {
        displayName: 'TaxDate',
        name: 'taxDate',
        type: 'dateTime',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
    {
        displayName: 'CardCode',
        name: 'cardCode',
        type: 'string',
        default: '',
        required: true,
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
    {
        displayName: 'DocCurrency',
        name: 'docCurrency',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
    {
        displayName: 'DocRate',
        name: 'docRate',
        type: 'number',
        default: '',
        required: false,
        typeOptions: {
            numberPrecision: 6,
        },
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
    {
        displayName: 'LocalCurrency',
        name: 'localCurrency',
        type: 'options',
        options: [
            { name: 'tYES', value: 'tYES' },
            { name: 'tNO', value: 'tNO' },
        ],
        default: 'tNO',
        required: false,
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
    {
        displayName: 'CashAccount',
        name: 'cashAccount',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
    {
        displayName: 'CashSum',
        name: 'cashSum',
        type: 'number',
        default: '',
        required: false,
        typeOptions: {
            numberPrecision: 2,
        },
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
    {
        displayName: 'Remarks',
        name: 'remarks',
        type: 'string',
        default: '',
        required: false,
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
    {
        displayName: 'PaymentInvoices',
        name: 'paymentInvoices',
        type: 'fixedCollection',
        placeholder: 'Adicionar invoice',
        default: {},
        required: true,
        typeOptions: {
            multipleValues: true,
        },
        options: [
            {
                name: 'invoiceValues',
                displayName: 'Invoice',
                values: [
                    {
                        displayName: 'DocEntry',
                        name: 'docEntry',
                        type: 'number',
                        default: 0,
                        required: true,
                    },
                    {
                        displayName: 'SumApplied',
                        name: 'sumApplied',
                        type: 'number',
                        default: 0,
                        required: true,
                        typeOptions: {
                            numberPrecision: 2,
                        },
                    },
                    {
                        displayName: 'InvoiceType',
                        name: 'invoiceType',
                        type: 'options',
                        options: [
                            { name: 'it_PurchaseInvoice', value: 'it_PurchaseInvoice' },
                            { name: 'it_PurchaseDownPayment', value: 'it_PurchaseDownPayment' },
                        ],
                        default: 'it_PurchaseInvoice',
                        required: true,
                    },
                ],
            },
        ],
        displayOptions: {
            show: {
                resource: ['inclusion'],
                operation: ['vendorPayment'],
            },
        },
    },
];
