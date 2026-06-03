import { INodeProperties } from 'n8n-workflow';

import { descriptions as listDescription } from './list/description';
import { descriptions as settleDescription } from './settle/description';
import { execute as listExecute } from './list/execute';
import { execute as settleExecute } from './settle/execute';

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        options: [
            {
                name: 'Listar',
                value: 'list',
            },
            {
                name: 'Baixar',
                value: 'settle',
            },
        ],
        default: 'list',
        description: 'Operação a ser executada em Contas a Pagar',
    },
    ...listDescription,
    ...settleDescription,
];

export { listExecute, settleExecute };
