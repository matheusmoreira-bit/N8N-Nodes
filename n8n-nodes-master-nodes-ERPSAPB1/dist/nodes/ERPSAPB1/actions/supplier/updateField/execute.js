"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateField = updateField;
const n8n_workflow_1 = require("n8n-workflow");
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
function parseFieldValue(valueType, rawValue) {
    switch (valueType) {
        case 'null':
            return null;
        case 'number': {
            const parsed = Number(rawValue);
            if (Number.isNaN(parsed)) {
                throw new Error('O novo valor informado nao e um numero valido.');
            }
            return parsed;
        }
        case 'boolean': {
            const normalized = rawValue.trim().toLowerCase();
            if (normalized === 'true') {
                return true;
            }
            if (normalized === 'false') {
                return false;
            }
            throw new Error('Para tipo booleano, informe "true" ou "false".');
        }
        case 'json':
            return JSON.parse(rawValue);
        case 'string':
        default:
            return rawValue;
    }
}
async function updateField(api, index) {
    var _a;
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const fieldName = normalizeText(this.getNodeParameter('fieldName', index, ''));
    const fieldValueType = this.getNodeParameter('fieldValueType', index, 'string');
    const fieldValueRaw = String((_a = this.getNodeParameter('fieldValue', index, '')) !== null && _a !== void 0 ? _a : '');
    try {
        const fieldValue = parseFieldValue(fieldValueType, fieldValueRaw);
        await api.updateSupplierField(cardCode, fieldName, fieldValue);
        return this.helpers.returnJsonArray([{
                updated: true,
                cardCode,
                fieldName,
                fieldValue,
            }]);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'Nao foi possivel editar o fornecedor.');
    }
}
