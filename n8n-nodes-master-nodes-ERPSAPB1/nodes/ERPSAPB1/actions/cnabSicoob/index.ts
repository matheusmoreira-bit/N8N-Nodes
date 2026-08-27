import { INodeProperties } from 'n8n-workflow';

import { descriptions as generatePaymentRemittanceDescription } from './generatePaymentRemittance/description';
import { execute as generatePaymentRemittanceExecute } from './generatePaymentRemittance/execute';

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
            {
                name: 'Gerar Remessa de Pagamento CNAB 240',
                value: 'generatePaymentRemittance',
                description: 'Busca contas/parcelas abertas no SAP B1 e gera remessa CNAB 240 para o Sicoob',
                action: 'Gerar remessa de pagamento CNAB 240',
            },
        ],
        default: 'generatePaymentRemittance',
        description: 'Operação CNAB 240 Sicoob a ser executada',
        displayOptions: {
            show: {
                resource: ['cnabSicoob'],
            },
        },
    },
    ...generatePaymentRemittanceDescription,
];

export { generatePaymentRemittanceExecute };
