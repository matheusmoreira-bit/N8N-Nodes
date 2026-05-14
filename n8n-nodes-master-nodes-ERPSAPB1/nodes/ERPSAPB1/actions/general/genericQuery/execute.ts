import { IExecuteFunctions, INodeExecutionData} from 'n8n-workflow';
import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';

export async function genericQuery(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const queryString = this.getNodeParameter('querystring', index) as string,
        originMetadata = this.getNodeParameter('originMetadata', index, '') as string,
        limitPagination = this.getNodeParameter('limitPagination', index, false) as boolean,
        maxPages = this.getNodeParameter('maxPages', index, 1) as number;

    const result = await api.genericPaginatedQuery(queryString, limitPagination ? maxPages : undefined);

    if (originMetadata.length > 0)  {
        return this.helpers.returnJsonArray({originMetadata, result});
    }

    return this.helpers.returnJsonArray(result);
}
