import { INodeProperties } from 'n8n-workflow';

import * as downloadReturn from './downloadReturn';
import * as listReturns from './listReturns';
import * as upload from './upload';

export {
    downloadReturn,
    listReturns,
    upload,
};

export const descriptions: INodeProperties[] = [
    {
        displayName: 'Operação',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
            show: {
                resource: ['cnab'],
            },
        },
        options: [
            {
                name: 'Upload CNAB',
                value: 'upload',
                description: 'Sobe um arquivo CNAB para a PagCorp',
                action: 'Upload CNAB',
            },
            {
                name: 'List Returns',
                value: 'listReturns',
                description: 'Busca retornos CNAB disponiveis',
                action: 'List CNAB returns',
            },
            {
                name: 'Download Return',
                value: 'downloadReturn',
                description: 'Baixa um arquivo de retorno CNAB',
                action: 'Download CNAB return',
            },
        ],
        default: 'upload',
        description: 'Operação a ser executada.',
    },
    ...upload.description,
    ...listReturns.description,
    ...downloadReturn.description,
];
