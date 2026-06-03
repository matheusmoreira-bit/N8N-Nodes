import {
    IDataObject,
    IExecuteFunctions,
    INodeCredentialDescription,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
} from 'n8n-workflow';

import { router } from './actions/router';
import { OmieApi } from './transport/OmieApi';
import * as accountsPayable from './actions/accountsPayable';
import * as suppliers from './actions/suppliers';
import * as items from './actions/items';
import * as payments from './actions/payments';

export class Omie implements INodeType {

    protected static credentials: INodeCredentialDescription[] = [
        {
            name: 'omieApi',
            required: true,
        },
    ];

    public description: INodeTypeDescription = {
        displayName: 'Omie',
        name: 'omie',
        icon: 'file:omie.svg',
        group: ['output'],
        version: 1,
        description: 'Operações de compras, fornecedores, itens e contas a pagar no Omie',
        defaults: {
            name: 'Omie',
        },
        inputs: ['main'],
        outputs: ['main'],
        credentials: Omie.credentials,
        properties: [
            {
                displayName: 'Recurso',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Contas a Pagar',
                        value: 'accountsPayable',
                    },
                    {
                        name: 'Fornecedores',
                        value: 'supplier',
                    },
                    {
                        name: 'Itens',
                        value: 'item',
                    },
                    {
                        name: 'Pagamentos',
                        value: 'payment',
                    },
                ],
                default: 'accountsPayable',
                description: 'Recurso Omie a ser utilizado',
            },
            ...accountsPayable.descriptions,
            ...suppliers.descriptions,
            ...items.descriptions,
            ...payments.descriptions,
        ],
    };

    public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const credentials = await this.getCredentials('omieApi') as IDataObject;
        const api = OmieApi.createInstance(credentials, this);
        const results = await router.call(this, api);
        return [results];
    }
}
