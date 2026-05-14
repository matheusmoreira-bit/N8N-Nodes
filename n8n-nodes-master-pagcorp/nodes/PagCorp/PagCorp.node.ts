import {
    IDataObject,
    IExecuteFunctions,
    INodeCredentialDescription,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import * as expense from './actions/expense';
import { router } from './actions/router';
import { PagCorpApi } from './transport/PagCorpApi';

export class PagCorp implements INodeType {

    protected static credentials: INodeCredentialDescription[] = [
        {
            name: 'pagCorpApi',
            required: true,
        },
    ];

    public description: INodeTypeDescription = {
        displayName: 'PagCorp',
        name: 'pagCorp',
        group: ['output'],
        description: 'Consulta despesas na API PagCorp com autenticação criptografada',
        icon: 'file:pagcorp.png',
        version: 1,
        defaults: {
            name: 'PagCorp',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: PagCorp.credentials,
        properties: [
            {
                displayName: 'Recurso',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Expense',
                        value: 'expense',
                    },
                ],
                default: 'expense',
                description: 'Recurso a ser utilizado',
            },
            ...expense.descriptions,
        ],
    };

    public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const credentials = await this.getCredentials('pagCorpApi') as IDataObject;
        const api = PagCorpApi.createInstance(credentials, this);
        return [await router.call(this, api)];
    }
}
