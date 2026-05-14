"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPayment = getPayment;
async function getPayment(api, index) {
    const docNum = this.getNodeParameter('docNum', index);
    const purchaseDownPayment = await api.getPurchaseDownPaymentByDocNum(docNum);
    if (!purchaseDownPayment) {
        return this.helpers.returnJsonArray([]);
    }
    return this.helpers.returnJsonArray(purchaseDownPayment);
}
