"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSapDate = toSapDate;
function toSapDate(value) {
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            throw new Error('Data invalida informada para o SAP.');
        }
        return value.toISOString().slice(0, 10);
    }
    if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) {
        return value.slice(0, 10);
    }
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error('Data invalida informada para o SAP.');
    }
    return parsedDate.toISOString().slice(0, 10);
}
