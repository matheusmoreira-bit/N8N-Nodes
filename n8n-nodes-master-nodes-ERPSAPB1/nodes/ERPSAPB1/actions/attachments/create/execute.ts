import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';

export async function create(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const docEntry = this.getNodeParameter('docEntry', index) as number;
    const binaryKey = this.getNodeParameter('binaryKey', index) as string;
    const useDraft = this.getNodeParameter('useDraft', index) as boolean;

    const item = this.getInputData()[index];

    if (item.binary === undefined) {
        throw new NodeOperationError(this.getNode(), 'Arquivo binário não está presente.');
    }

    const file = item.binary[binaryKey];

    if (file === undefined || file.fileName === undefined) {
        throw new NodeOperationError(this.getNode(), 'Não há anexo com este nome.');
    }

    const fileContent = await this.helpers.getBinaryDataBuffer(index, binaryKey);

    const attachment = await api.createAttachment(file.fileName, fileContent);

    if (!attachment) {
        throw new NodeOperationError(this.getNode(), 'Não foi possível criar este anexo.');
    }

    if (useDraft) {
        await api.updateDraft(docEntry, {AttachmentEntry: attachment.AbsoluteEntry});
    } else {
        await api.updatePurchaseInvoice(docEntry, {AttachmentEntry: attachment.AbsoluteEntry});
    }

    return this.helpers.returnJsonArray(attachment);
}
