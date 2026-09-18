import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { extractDigitsFromString } from '../../../utils/text';

export async function getByDocument(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const document = this.getNodeParameter('document', index) as string;

    const customer = await api.getCustomerByDocument(extractDigitsFromString(document));

    return this.helpers.returnJsonArray(customer ?? []);
}
