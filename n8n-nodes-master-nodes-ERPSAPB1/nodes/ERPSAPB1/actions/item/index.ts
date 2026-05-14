import * as create from './create';
import * as createGroup from './createGroup';
import * as updateField from './updateField';

import { INodeProperties } from 'n8n-workflow';

export {
    create,
    createGroup,
    updateField,
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
                    'item',
                ],
            },
        },
        options: [
            {
                name: 'Criar item',
                value: 'create',
                description: 'Cria um novo item no SAP.',
            },
            {
                name: 'Criar grupo de itens',
                value: 'createGroup',
                description: 'Cria um novo grupo de itens no SAP.',
            },
            {
                name: 'Editar campo do item',
                value: 'updateField',
                description: 'Atualiza um campo especifico do item.',
            },
        ],
        default: 'create',
        description: 'Operação a ser executada.',
    },
    ...create.description,
    ...createGroup.description,
    ...updateField.description,
];
