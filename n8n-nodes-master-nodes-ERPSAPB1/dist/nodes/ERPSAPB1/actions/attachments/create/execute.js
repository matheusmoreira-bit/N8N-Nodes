"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const n8n_workflow_1 = require("n8n-workflow");
async function create(api, index) {
    const docEntry = this.getNodeParameter('docEntry', index);
    const binaryKey = this.getNodeParameter('binaryKey', index);
    const useDraft = this.getNodeParameter('useDraft', index);
    const item = this.getInputData()[index];
    if (item.binary === undefined) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Arquivo binário não está presente.');
    }
    const file = item.binary[binaryKey];
    if (file === undefined || file.fileName === undefined) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Não há anexo com este nome.');
    }
    const fileContent = await this.helpers.getBinaryDataBuffer(index, binaryKey);
    const attachment = await api.createAttachment(file.fileName, fileContent);
    if (!attachment) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Não foi possível criar este anexo.');
    }
    if (useDraft) {
        await api.updateDraft(docEntry, { AttachmentEntry: attachment.AbsoluteEntry });
    }
    else {
        await api.updatePurchaseInvoice(docEntry, { AttachmentEntry: attachment.AbsoluteEntry });
    }
    return this.helpers.returnJsonArray(attachment);
}
