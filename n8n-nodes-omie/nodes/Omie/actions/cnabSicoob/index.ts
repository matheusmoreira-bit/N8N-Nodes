import { INodeProperties } from 'n8n-workflow';

import { descriptions as generatePaymentRemittanceDescription } from './generatePaymentRemittance/description';
import { execute as generatePaymentRemittanceExecute } from './generatePaymentRemittance/execute';

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        options: [
            {
                name: 'Gerar Remessa de Pagamento CNAB 240',
                value: 'generatePaymentRemittance',
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
