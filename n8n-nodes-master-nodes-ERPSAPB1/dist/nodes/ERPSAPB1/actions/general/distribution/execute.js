"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distribution = distribution;
const select_1 = require("../../../utils/select");
async function distribution(api, index) {
    const filters = this.getNodeParameter('filters', index, {}), originMetadata = this.getNodeParameter('originMetadata', index, ''), limitPagination = this.getNodeParameter('limitPagination', index, false), maxPages = this.getNodeParameter('maxPages', index, 1), selectMode = this.getNodeParameter('selectMode', index, 'all'), selectFieldsRaw = this.getNodeParameter('selectFields', index, '');
    const selectedFields = (0, select_1.parseSelectedFields)(selectMode, selectFieldsRaw);
    const distribution = await api.listDistributionRules(filters, limitPagination ? maxPages : undefined, selectedFields);
    if (originMetadata.length > 0) {
        return this.helpers.returnJsonArray({ originMetadata, distribution });
    }
    return this.helpers.returnJsonArray(distribution);
}
