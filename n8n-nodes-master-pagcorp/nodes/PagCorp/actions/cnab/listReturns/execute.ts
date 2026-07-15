import {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
} from 'n8n-workflow';

import { PagCorpApi } from '../../../transport/PagCorpApi';
import {
    normalizeResponse,
    normalizeRows,
    parseJsonObject,
    toApiDate,
} from '../helpers';

export async function listReturns(
    this: IExecuteFunctions,
    api: PagCorpApi,
    itemIndex: number,
): Promise<INodeExecutionData[]> {
    const endpointPath = this.getNodeParameter('cnabListReturnsEndpointPath', itemIndex) as string;
    const startDateValue = this.getNodeParameter('startDate', itemIndex, '') as string;
    const endDateValue = this.getNodeParameter('endDate', itemIndex, '') as string;
    const splitItems = this.getNodeParameter('splitItems', itemIndex, true) as boolean;
    const additionalFields = this.getNodeParameter('cnabListReturnsAdditionalFields', itemIndex, {}) as IDataObject;

    const today = new Date();
    const startDate = toApiDate(startDateValue, () => today);
    const endDate = toApiDate(endDateValue, () => today);
    const queryParameters = parseJsonObject(additionalFields.queryParametersJson, 'Query Parameters JSON');
    const startDateQueryName = `${additionalFields.startDateQueryName ?? 'startDate'}`.trim();
    const endDateQueryName = `${additionalFields.endDateQueryName ?? 'endDate'}`.trim();

    if (startDateQueryName) {
        queryParameters[startDateQueryName] = startDate;
    }

    if (endDateQueryName) {
        queryParameters[endDateQueryName] = endDate;
    }

    const response = await api.listCnabReturns({
        endpointPath,
        queryParameters,
    });

    if (splitItems) {
        return normalizeRows(response).map((row) => ({
            json: {
                resource: 'cnab',
                operation: 'listReturns',
                endpointPath,
                startDate,
                endDate,
                ...row,
            },
            pairedItem: { item: itemIndex },
        }));
    }

    return [
        {
            json: {
                resource: 'cnab',
                operation: 'listReturns',
                endpointPath,
                startDate,
                endDate,
                response: normalizeResponse(response),
            },
            pairedItem: { item: itemIndex },
        },
    ];
}
