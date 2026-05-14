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
            try {
                return JSON.parse(rawValue);
            }
            catch {
                throw new Error('O novo valor informado nao e um JSON valido.');
            }
        case 'string':
        default:
            return rawValue;
    }
}
async function updateField(api, index) {
    var _a;
    const itemCode = normalizeText(this.getNodeParameter('itemCode', index, ''));
    const updateMode = this.getNodeParameter('updateMode', index, 'single');
    try {
        if (updateMode === 'multiple') {
            const { fields } = this.getNodeParameter('fieldsToUpdate', index, {});
            const normalizedFields = (fields !== null && fields !== void 0 ? fields : [])
                .map((field, fieldIndex) => {
                var _a;
                const fieldName = normalizeText(field.fieldName);
                if (!fieldName) {
                    throw new Error(`Nome do campo nao informado na linha ${fieldIndex + 1}.`);
                }
                const fieldValueType = normalizeText(field.fieldValueType) || 'string';
                const fieldValueRaw = String((_a = field.fieldValue) !== null && _a !== void 0 ? _a : '');
                const fieldValue = parseFieldValue(fieldValueType, fieldValueRaw);
                return { fieldName, fieldValue };
            });
            if (!normalizedFields.length) {
                throw new Error('Informe ao menos um campo para atualizar.');
            }
            const payload = normalizedFields.reduce((result, currentField) => {
                result[currentField.fieldName] = currentField.fieldValue;
                return result;
            }, {});
            await api.updateItemFields(itemCode, payload);
            return this.helpers.returnJsonArray([{
                    updated: true,
                    itemCode,
                    fieldsUpdated: normalizedFields.length,
                    updatedFields: payload,
                }]);
        }
        const fieldName = normalizeText(this.getNodeParameter('fieldName', index, ''));
        const fieldValueType = this.getNodeParameter('fieldValueType', index, 'string');
        const fieldValueRaw = String((_a = this.getNodeParameter('fieldValue', index, '')) !== null && _a !== void 0 ? _a : '');
        const fieldValue = parseFieldValue(fieldValueType, fieldValueRaw);
        await api.updateItemField(itemCode, fieldName, fieldValue);
        return this.helpers.returnJsonArray([{
                updated: true,
                itemCode,
                fieldName,
                fieldValue,
            }]);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'Nao foi possivel editar o item.');
    }
}
