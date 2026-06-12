import { INodeProperties } from 'n8n-workflow';

import { descriptions as listDescription } from './list/description';
import { descriptions as updateDescription } from './update/description';
import { execute as listExecute } from './list/execute';
import { execute as updateExecute } from './update/execute';
import { addResourceDisplayOptions } from '../displayOptions';

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
                name: 'Atualizar',
                value: 'update',
            },
        ],
        default: 'list',
        description: 'Operação a ser executada em Itens',
        displayOptions: {
            show: {
                omieResource: ['item'],
            },
        },
    },
    ...addResourceDisplayOptions(listDescription, 'item'),
    ...addResourceDisplayOptions(updateDescription, 'item'),
];

export { listExecute, updateExecute };
