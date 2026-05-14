"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInvoice = getInvoice;
async function getInvoice(api, index) {
    const docNum = this.getNodeParameter('docNum', index);
    const purchaseInvoice = await api.getPurchaseInvoiceByDocNum(docNum);
    if (!purchaseInvoice) {
        return this.helpers.returnJsonArray([]);
    }
    return this.helpers.returnJsonArray(purchaseInvoice);
}
