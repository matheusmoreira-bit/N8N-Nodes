import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { IDistributionRuleOptions } from '../../../transport/Interfaces';
import { parseSelectedFields } from '../../../utils/select';

export async function distribution(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const filters = this.getNodeParameter('filters', index, {}) as IDistributionRuleOptions,
        originMetadata = this.getNodeParameter('originMetadata', index, '') as string,
        limitPagination = this.getNodeParameter('limitPagination', index, false) as boolean,
        maxPages = this.getNodeParameter('maxPages', index, 1) as number,
        selectMode = this.getNodeParameter('selectMode', index, 'all') as string,
        selectFieldsRaw = this.getNodeParameter('selectFields', index, '') as string;

    const selectedFields = parseSelectedFields(selectMode, selectFieldsRaw);
    const distribution = await api.listDistributionRules(filters, limitPagination ? maxPages : undefined, selectedFields);

    if (originMetadata.length > 0)  {
        return this.helpers.returnJsonArray({originMetadata, distribution});
    }

    return this.helpers.returnJsonArray(distribution);
}
