import * as create from './create';
import * as list from './list';
import * as updateField from './updateField';

import { INodeProperties } from 'n8n-workflow';
import { managedDocumentResources } from './constants';

export {
    create,
    list,
    updateField,
};

const documentTypeOptions = [
    {
        name: 'Adiantamento a Cliente',
        value: 'customerDownPayment',
        description: 'Endpoint DownPayments.',
    },
    {
        name: 'Adiantamento a Fornecedor',
        value: 'supplierDownPayment',
        description: 'Endpoint PurchaseDownPayments.',
    },
    {
        name: 'Contas a Pagar',
        value: 'accountsPayable',
        description: 'Endpoint VendorPayments.',
    },
    {
        name: 'Contas a Receber',
        value: 'accountsReceivable',
        description: 'Endpoint IncomingPayments.',
    },
    {
        name: 'Nota Fiscal de Entrada',
        value: 'purchaseInvoice',
        description: 'Endpoint PurchaseInvoices.',
    },
    {
        name: 'Nota Fiscal de Saida',
        value: 'salesInvoice',
        description: 'Endpoint Invoices.',
    },
    {
        name: 'Pedido de Compra',
        value: 'purchaseOrder',
        description: 'Endpoint PurchaseOrders.',
    },
    {
        name: 'Pedido de Venda',
        value: 'salesOrder',
        description: 'Endpoint Orders.',
    },
];

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: managedDocumentResources,
            },
        },
        options: [
            {
                name: 'Listar',
                value: 'list',
                description: 'Lista documentos no SAP B1.',
            },
            {
                name: 'Criar',
                value: 'create',
                description: 'Cria um documento no SAP B1.',
            },
            {
                name: 'Editar campo',
                value: 'updateField',
                description: 'Atualiza um ou mais campos do documento no SAP B1.',
            },
        ],
        default: 'list',
        description: 'Operação a ser executada.',
    },
    {
        displayName: 'Tipo de Documento',
        name: 'documentType',
        type: 'options',
        noDataExpression: true,
        options: documentTypeOptions,
        default: 'purchaseOrder',
        displayOptions: {
            show: {
                resource: [
                    'document',
                ],
            },
        },
        description: 'Documento do SAP B1 a ser lido ou criado.',
    },
    ...create.description,
    ...list.description,
    ...updateField.description,
];
