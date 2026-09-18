"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
const date_1 = require("../../../utils/date");
const select_1 = require("../../../utils/select");
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
function normalizeNumber(value) {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
}
function normalizeOptionalSapDate(value) {
    const normalized = normalizeText(value);
    return normalized ? (0, date_1.toSapDate)(normalized) : undefined;
}
function getDocumentType(index) {
    const resource = this.getNodeParameter('resource', index);
    if (resource === 'document') {
        return this.getNodeParameter('documentType', index);
    }
    return resource;
}
async function list(api, index) {
    const documentType = getDocumentType.call(this, index);
    const filters = this.getNodeParameter('filters', index, {});
    const limitPagination = this.getNodeParameter('limitPagination', index, false);
    const maxPages = this.getNodeParameter('maxPages', index, 1);
    const selectMode = this.getNodeParameter('selectMode', index, 'all');
    const selectFieldsRaw = this.getNodeParameter('selectFields', index, '');
    const selectedFields = (0, select_1.parseSelectedFields)(selectMode, selectFieldsRaw);
    const documents = await api.listDocuments(documentType, {
        docEntry: normalizeNumber(filters.docEntry),
        docNum: normalizeNumber(filters.docNum),
        cardCode: normalizeText(filters.cardCode) || undefined,
        documentStatus: normalizeText(filters.documentStatus) || undefined,
        docDateFrom: normalizeOptionalSapDate(filters.docDateFrom),
        docDateTo: normalizeOptionalSapDate(filters.docDateTo),
        rawFilter: normalizeText(filters.rawFilter) || undefined,
    }, limitPagination ? maxPages : undefined, selectedFields);
    return this.helpers.returnJsonArray(documents);
}
