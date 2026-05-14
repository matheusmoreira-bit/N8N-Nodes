import * as getInvoice from './getInvoice';
import * as getPayment from './getPayment';
import * as getSalesOrder from './getSalesOrder';
import { INodeProperties } from 'n8n-workflow';

export {
    getInvoice,
    getPayment,
    getSalesOrder,
};

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        displayOptions: {
            show: {
                resource: [
                    'debug',
                ],
            },
        },
        options: [
            {
                name: 'Obter Nota Fiscal de Entrada',
                value: 'getInvoice',
                description: 'Obtem invoice por DocNum.',
            },
            {
                name: 'Obter Fatura de Adiantamento',
                value: 'getPayment',
                description: 'Obtem pagamento por DocNum.',
            },
            {
                name: 'Obter Pedido de Venda',
                value: 'getSalesOrder',
                description: 'Obtem pedido de venda por DocNum.',
            },
        ],
        default: 'getPayment',
        description: 'A operação a ser realizada.',
    },
    ...getInvoice.description,
    ...getPayment.description,
    ...getSalesOrder.description,
];
