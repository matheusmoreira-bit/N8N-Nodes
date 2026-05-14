import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';

export async function getPayment(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const docNum = this.getNodeParameter('docNum', index) as number;

    const purchaseDownPayment = await api.getPurchaseDownPaymentByDocNum(docNum);

    if (!purchaseDownPayment) {
        return this.helpers.returnJsonArray([]);
    }

    return this.helpers.returnJsonArray(purchaseDownPayment);
}
