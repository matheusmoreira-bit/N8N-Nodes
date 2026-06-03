import {
    IDataObject,
    IExecuteFunctions,
    INodeCredentialDescription,
    INodeExecutionData,
    INodeType,
    INodeTypeDescription,
    NodeConnectionType,
} from 'n8n-workflow';

import * as attachments from './actions/attachments';
import * as general from './actions/general';
import * as debug from './actions/debug';
import * as inclusion from './actions/inclusion';
import * as item from './actions/item';
import * as serverFiles from './actions/serverFiles';
import * as supplier from './actions/supplier';

import {router} from './actions/router';

import {ERPSAPB1Api} from './transport/ERPSAPB1Api';

export class ERPSAPB1 implements INodeType {

    protected static credentials: INodeCredentialDescription[] = [
        {
            name: 'erpSAPB1Api',
            required: true,
            displayOptions: {
                hide: {
                    resource: [
                        'serverFiles',
                    ],
                },
            },
        },
        {
            name: 'erpSAPB1ServerFiles',
            required: false,
            displayOptions: {
                show: {
                    resource: [
                        'serverFiles',
                    ],
                },
            },
        },
    ];

    public description: INodeTypeDescription = {
        displayName: 'SAP Business One',
        name: 'erpSAPB1',
        group: ['output'],
        description: 'Comunicação com ERP SAP B1',
        icon: 'file:sap.png',
        version: 1,
        defaults: {
            name: 'SAP B1',
        },
        inputs: [NodeConnectionType.Main],
        outputs: [NodeConnectionType.Main],
        credentials: ERPSAPB1.credentials,
        properties: [
            {
                displayName: 'Recurso',
                name: 'resource',
                type: 'options',
                options: [
                    {
                        name: 'Anexos',
                        value: 'attachments',
                    },
                    {
                        name: 'Debug',
                        value: 'debug',
                    },
                    {
                        name: 'Inclusão',
                        value: 'inclusion',
                    },
                    {
                        name: 'Configurações',
                        value: 'general',
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
                        name: 'Arquivos do Servidor',
                        value: 'serverFiles',
                    },
                ],
                default: 'general',
                description: 'O recurso a ser utilizado pelo conector',
            },
            ...attachments.descriptions,
            ...debug.descriptions,
            ...inclusion.descriptions,
            ...general.descriptions,
            ...item.descriptions,
            ...serverFiles.descriptions,
            ...supplier.descriptions,
        ],
    };

    public async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
        const resource = this.getNodeParameter('resource', 0) as string;
        const api = resource === 'serverFiles'
            ? undefined as unknown as ERPSAPB1Api
            : ERPSAPB1Api.createInstance(await this.getCredentials('erpSAPB1Api') as IDataObject, this);
        // Router returns INodeExecutionData[]
        // We need to output INodeExecutionData[][]
        // So we wrap in []
        return [await router.call(this, api)];
    }
}
