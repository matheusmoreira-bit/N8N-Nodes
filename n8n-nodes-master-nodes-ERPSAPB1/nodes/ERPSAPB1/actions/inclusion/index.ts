import * as manualJournalEntry from './manualJournalEntry';
import * as purchaseOrder from './purchaseOrder';
import * as vendorPayment from './vendorPayment';

import { INodeProperties } from 'n8n-workflow';

export {
    manualJournalEntry,
    purchaseOrder,
    vendorPayment,
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
                    'inclusion',
                ],
            },
        },
        options: [
            {
                name: 'Pedido de compra',
                value: 'purchaseOrder',
                description: 'Inclui um novo pedido de compra no SAP B1.',
            },
            {
                name: 'Lançamento contábil manual',
                value: 'manualJournalEntry',
                description: 'Inclui um novo lançamento contábil manual no SAP B1.',
            },
            {
                name: 'Baixa de NF/PC',
                value: 'vendorPayment',
                description: 'Inclui uma baixa de documento de fornecedor no endpoint VendorPayments.',
            },
        ],
        default: 'purchaseOrder',
        description: 'Operação a ser executada.',
    },
    ...purchaseOrder.description,
    ...manualJournalEntry.description,
    ...vendorPayment.description,
];
