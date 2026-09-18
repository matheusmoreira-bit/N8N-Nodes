"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
const select_1 = require("../../../utils/select");
const text_1 = require("../../../utils/text");
async function list(api, index) {
    const filters = this.getNodeParameter('filters', index, {});
    const limitPagination = this.getNodeParameter('limitPagination', index, false);
    const maxPages = this.getNodeParameter('maxPages', index, 1);
    const selectMode = this.getNodeParameter('selectMode', index, 'all');
    const selectFieldsRaw = this.getNodeParameter('selectFields', index, '');
    const selectedFields = (0, select_1.parseSelectedFields)(selectMode, selectFieldsRaw);
    const suppliers = await api.listSuppliers({
        ...filters,
        document: filters.document ? (0, text_1.extractDigitsFromString)(filters.document) : undefined,
    }, limitPagination ? maxPages : undefined, selectedFields);
    return this.helpers.returnJsonArray(suppliers);
}
