"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genericQuery = genericQuery;
async function genericQuery(api, index) {
    const queryString = this.getNodeParameter('querystring', index), originMetadata = this.getNodeParameter('originMetadata', index, ''), limitPagination = this.getNodeParameter('limitPagination', index, false), maxPages = this.getNodeParameter('maxPages', index, 1);
    const result = await api.genericPaginatedQuery(queryString, limitPagination ? maxPages : undefined);
    if (originMetadata.length > 0) {
        return this.helpers.returnJsonArray({ originMetadata, result });
    }
    return this.helpers.returnJsonArray(result);
}
