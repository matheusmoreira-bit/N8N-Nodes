"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const ERPSAPB1Builders_1 = require("../../../transport/ERPSAPB1Builders");
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
async function create(api, index) {
    const itemCode = normalizeText(this.getNodeParameter('itemCode', index, ''));
    const itemName = normalizeText(this.getNodeParameter('itemName', index, ''));
    const itemsGroupCode = this.getNodeParameter('itemsGroupCode', index, 0);
    const purchaseItem = this.getNodeParameter('purchaseItem', index, true);
    const salesItem = this.getNodeParameter('salesItem', index, true);
    const inventoryItem = this.getNodeParameter('inventoryItem', index, true);
    const uomCode = this.getNodeParameter('uomCode', index, 0);
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {});
    const item = (0, ERPSAPB1Builders_1.applyDynamicFields)({
        ItemCode: itemCode,
        ItemName: itemName,
        ItemsGroupCode: itemsGroupCode > 0 ? itemsGroupCode : undefined,
        PurchaseItem: purchaseItem,
        SalesItem: salesItem,
        InventoryItem: inventoryItem,
        UoMGroupEntry: uomCode > 0 ? uomCode : undefined,
    }, dynamicFields);
    const createdItem = await api.createItem(item);
    return this.helpers.returnJsonArray([createdItem]);
}
