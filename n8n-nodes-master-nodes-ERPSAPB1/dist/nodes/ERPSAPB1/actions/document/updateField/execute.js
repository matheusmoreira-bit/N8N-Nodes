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
function getDocumentType(index) {
    const resource = this.getNodeParameter('resource', index);
    if (resource === 'document') {
        return this.getNodeParameter('documentType', index);
    }
    return resource;
}
async function updateField(api, index) {
    var _a, _b;
    const documentType = getDocumentType.call(this, index);
    const docEntry = this.getNodeParameter('docEntry', index);
    const updateMode = this.getNodeParameter('updateMode', index, 'single');
    try {
        const payload = updateMode === 'multiple'
            ? ((_a = this.getNodeParameter('fieldsToUpdate', index, {}).fields) !== null && _a !== void 0 ? _a : [])
                .reduce((result, field, fieldIndex) => {
                var _a;
                const fieldName = normalizeText(field.fieldName);
                if (!fieldName) {
                    throw new Error(`Nome do campo nao informado na linha ${fieldIndex + 1}.`);
                }
                result[fieldName] = parseFieldValue(normalizeText(field.fieldValueType) || 'string', String((_a = field.fieldValue) !== null && _a !== void 0 ? _a : ''));
                return result;
            }, {})
            : {
                [normalizeText(this.getNodeParameter('fieldName', index, ''))]: parseFieldValue(this.getNodeParameter('fieldValueType', index, 'string'), String((_b = this.getNodeParameter('fieldValue', index, '')) !== null && _b !== void 0 ? _b : '')),
            };
        if (!Object.keys(payload).length || Object.keys(payload).some((fieldName) => !fieldName)) {
            throw new Error('Informe ao menos um campo válido para atualizar.');
        }
        await api.updateDocumentFields(documentType, docEntry, payload);
        return this.helpers.returnJsonArray([{
                updated: true,
                documentType,
                docEntry,
                updatedFields: payload,
            }]);
    }
    catch (error) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'Nao foi possivel editar o documento.', { itemIndex: index });
    }
}
