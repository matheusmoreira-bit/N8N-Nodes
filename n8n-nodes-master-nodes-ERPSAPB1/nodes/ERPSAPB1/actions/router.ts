import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import * as attachments from './attachments';
import * as general from './general';
import * as debug from './debug';
import * as inclusion from './inclusion';
import * as item from './item';
import * as supplier from './supplier';
import { ERPSAPB1 } from './Interfaces';

import { ERPSAPB1Api } from '../transport/ERPSAPB1Api';

export async function router(this: IExecuteFunctions, api: ERPSAPB1Api): Promise<INodeExecutionData[]> {
    const items = this.getInputData();
    const operationResult: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
        const resource = this.getNodeParameter<ERPSAPB1>('resource', i);
        const operation = this.getNodeParameter('operation', i);

        const erpsapb1 = {
            resource,
            operation,
        } as ERPSAPB1;

        try {
            if (erpsapb1.resource === 'attachments') {
                operationResult.push(...await attachments[erpsapb1.operation].execute.call(this, api, i));
            } else if (erpsapb1.resource === 'general') {
                operationResult.push(...await general[erpsapb1.operation].execute.call(this, api, i));
            } else if (erpsapb1.resource === 'debug') {
                operationResult.push(...await debug[erpsapb1.operation].execute.call(this, api, i));
            } else if (erpsapb1.resource === 'inclusion') {
                operationResult.push(...await inclusion[erpsapb1.operation].execute.call(this, api, i));
            } else if (erpsapb1.resource === 'item') {
                operationResult.push(...await item[erpsapb1.operation].execute.call(this, api, i));
            } else if (erpsapb1.resource === 'supplier') {
                if (erpsapb1.operation === 'getByDocument') {
                    operationResult.push(...await supplier[erpsapb1.operation].execute.call(this, api, i));
                    continue;
                }
                operationResult.push(...await supplier[erpsapb1.operation].execute.call(this, api, i));
                if (erpsapb1.operation === 'list') {
                    break;
                }
            }
        } catch (err: any) {
            if (this.continueOnFail()) {
                operationResult.push({ json: items[i].json, error: err });
            } else {
                throw err;
            }
        }
    }

    return operationResult;
}
