"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSalesOrder = getSalesOrder;
async function getSalesOrder(api, index) {
    const docNum = this.getNodeParameter('docNum', index);
    const salesOrder = await api.getSalesOrderByDocNum(docNum);
    if (!salesOrder) {
        return this.helpers.returnJsonArray([]);
    }
    return this.helpers.returnJsonArray(salesOrder);
}
