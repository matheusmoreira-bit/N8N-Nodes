import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';

export async function getSalesOrder(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const docNum = this.getNodeParameter('docNum', index) as number;

    const salesOrder = await api.getSalesOrderByDocNum(docNum);

    if (!salesOrder) {
        return this.helpers.returnJsonArray([]);
    }

    return this.helpers.returnJsonArray(salesOrder);
}
