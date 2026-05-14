import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import * as expense from './expense';
import { PagCorpEntity } from './Interfaces';

import { PagCorpApi } from '../transport/PagCorpApi';

export async function router(this: IExecuteFunctions, api: PagCorpApi): Promise<INodeExecutionData[]> {
    const items = this.getInputData();
    const operationResult: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
        const resource = this.getNodeParameter<PagCorpEntity>('resource', i);
        const operation = this.getNodeParameter('operation', i);

        const pagcorp = {
            resource,
            operation,
        } as PagCorpEntity;

        try {
            if (pagcorp.resource === 'expense') {
                operationResult.push(...await expense[pagcorp.operation].execute.call(this, api, i));
            }
        } catch (err: any) {
            if (this.continueOnFail()) {
                operationResult.push({ json: this.getInputData(i)[0].json, error: err });
            } else {
                throw err;
            }
        }
    }

    return operationResult;
}
