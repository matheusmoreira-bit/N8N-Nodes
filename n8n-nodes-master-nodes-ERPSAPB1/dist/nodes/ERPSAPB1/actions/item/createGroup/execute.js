"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGroup = createGroup;
const ERPSAPB1Builders_1 = require("../../../transport/ERPSAPB1Builders");
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
async function createGroup(api, index) {
    const groupName = normalizeText(this.getNodeParameter('groupName', index, ''));
    const baseUnit = normalizeText(this.getNodeParameter('baseUnit', index, ''));
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {});
    const itemGroup = (0, ERPSAPB1Builders_1.applyDynamicFields)({
        GroupName: groupName,
        BaseUnit: baseUnit || undefined,
    }, dynamicFields);
    const createdItemGroup = await api.createItemGroup(itemGroup);
    return this.helpers.returnJsonArray([createdItemGroup]);
}
