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
        description: 'Operação a ser executada em Fornecedores',
        displayOptions: {
            show: {
                resource: ['supplier'],
            },
        },
    },
    ...addResourceDisplayOptions(listDescription, 'supplier'),
    ...addResourceDisplayOptions(updateDescription, 'supplier'),
];

export { listExecute, updateExecute };
