"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatLocalDate = formatLocalDate;
exports.toApiDate = toApiDate;
exports.parseJsonObject = parseJsonObject;
exports.normalizeResponse = normalizeResponse;
exports.normalizeRows = normalizeRows;
exports.getHeader = getHeader;
exports.fileNameFromContentDisposition = fileNameFromContentDisposition;
function formatLocalDate(date) {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
}
function toApiDate(value, fallback) {
    if (!value) {
        return formatLocalDate(fallback());
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const parsedDate = new Date(value);
    if (!Number.isNaN(parsedDate.getTime())) {
        return formatLocalDate(parsedDate);
    }
    return value.slice(0, 10);
}
function parseJsonObject(value, fieldName) {
    if (value === undefined || value === null || value === '') {
        return {};
    }
    if (typeof value === 'object' && !Array.isArray(value)) {
        return value;
    }
    if (typeof value !== 'string') {
        throw new Error(`${fieldName} deve ser um objeto JSON.`);
    }
    try {
        const parsed = JSON.parse(value);
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error(`${fieldName} deve ser um objeto JSON.`);
        }
        return parsed;
    }
    catch (error) {
        if (error instanceof Error && error.message.includes('deve ser um objeto JSON')) {
            throw error;
        }
        throw new Error(`${fieldName} contem JSON invalido.`);
    }
}
function normalizeResponse(response) {
    if (response && typeof response === 'object' && !Array.isArray(response)) {
        return response;
    }
    return { raw: response };
}
function normalizeRows(response) {
    if (Array.isArray(response)) {
        return response.map(normalizeResponse);
    }
    if (response && typeof response === 'object') {
        const data = response;
        for (const key of ['items', 'data', 'results', 'returns', 'retornos', 'files', 'arquivos']) {
            const rows = data[key];
            if (Array.isArray(rows)) {
                return rows.map(normalizeResponse);
            }
        }
        if (typeof data.raw === 'string') {
            try {
                return normalizeRows(JSON.parse(data.raw));
            }
            catch {
                return [data];
            }
        }
        return [data];
    }
    return [normalizeResponse(response)];
}
function getHeader(headers, name) {
    var _a;
    const lowerName = name.toLowerCase();
    const value = (_a = headers[name]) !== null && _a !== void 0 ? _a : headers[lowerName];
    if (Array.isArray(value)) {
        return value.join(', ');
    }
    return typeof value === 'string' ? value : undefined;
}
function fileNameFromContentDisposition(contentDisposition) {
    var _a;
    if (!contentDisposition) {
        return '';
    }
    const utfFileName = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
    if (utfFileName === null || utfFileName === void 0 ? void 0 : utfFileName[1]) {
        try {
            return decodeURIComponent(utfFileName[1].replace(/"/g, ''));
        }
        catch {
            return utfFileName[1].replace(/"/g, '');
        }
    }
    const regularFileName = /filename="?([^";]+)"?/i.exec(contentDisposition);
    return (_a = regularFileName === null || regularFileName === void 0 ? void 0 : regularFileName[1]) !== null && _a !== void 0 ? _a : '';
}
