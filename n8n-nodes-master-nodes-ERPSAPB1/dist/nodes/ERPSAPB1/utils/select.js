"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSelectedFields = parseSelectedFields;
function parseSelectedFields(selectMode, selectFieldsRaw) {
    if (selectMode !== 'custom') {
        return undefined;
    }
    const fields = selectFieldsRaw
        .split(',')
        .map((field) => field.trim())
        .filter((field) => field.length > 0);
    if (!fields.length) {
        throw new Error('Informe ao menos um campo em "Campos ($select)" quando o modo for lista customizada.');
    }
    return fields;
}
