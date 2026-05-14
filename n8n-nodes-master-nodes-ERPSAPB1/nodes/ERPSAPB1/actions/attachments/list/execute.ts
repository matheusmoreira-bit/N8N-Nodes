import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { parseSelectedFields } from '../../../utils/select';

export async function list(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const limitPagination = this.getNodeParameter('limitPagination', index, false) as boolean;
    const maxPages = this.getNodeParameter('maxPages', index, 1) as number;
    const selectMode = this.getNodeParameter('selectMode', index, 'all') as string;
    const selectFieldsRaw = this.getNodeParameter('selectFields', index, '') as string;
    const selectedFields = parseSelectedFields(selectMode, selectFieldsRaw);
    const attachments = await api.listAttachments(limitPagination ? maxPages : undefined, selectedFields);
    return this.helpers.returnJsonArray(attachments);
}
