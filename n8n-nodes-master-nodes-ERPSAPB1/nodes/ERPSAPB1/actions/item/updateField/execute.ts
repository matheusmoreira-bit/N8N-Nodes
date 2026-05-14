import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';

interface IFieldUpdateInput {
    fieldName?: unknown;
    fieldValueType?: unknown;
    fieldValue?: unknown;
}

interface IFieldUpdateParameter {
    fields?: IFieldUpdateInput[];
}

function normalizeText(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function parseFieldValue(valueType: string, rawValue: string): IDataObject[keyof IDataObject] {
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
                return JSON.parse(rawValue) as IDataObject;
            } catch {
                throw new Error('O novo valor informado nao e um JSON valido.');
            }
        case 'string':
        default:
            return rawValue;
    }
}

export async function updateField(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const itemCode = normalizeText(this.getNodeParameter('itemCode', index, ''));
    const updateMode = this.getNodeParameter('updateMode', index, 'single') as string;

    try {
        if (updateMode === 'multiple') {
            const { fields } = this.getNodeParameter('fieldsToUpdate', index, {}) as IFieldUpdateParameter;
            const normalizedFields = (fields ?? [])
                .map((field, fieldIndex) => {
                    const fieldName = normalizeText(field.fieldName);
                    if (!fieldName) {
                        throw new Error(`Nome do campo nao informado na linha ${fieldIndex + 1}.`);
                    }

                    const fieldValueType = normalizeText(field.fieldValueType) || 'string';
                    const fieldValueRaw = String(field.fieldValue ?? '');
                    const fieldValue = parseFieldValue(fieldValueType, fieldValueRaw);
                    return { fieldName, fieldValue };
                });

            if (!normalizedFields.length) {
                throw new Error('Informe ao menos um campo para atualizar.');
            }

            const payload = normalizedFields.reduce((result, currentField) => {
                result[currentField.fieldName] = currentField.fieldValue;
                return result;
            }, {} as IDataObject);

            await api.updateItemFields(itemCode, payload);

            return this.helpers.returnJsonArray([{
                updated: true,
                itemCode,
                fieldsUpdated: normalizedFields.length,
                updatedFields: payload,
            }]);
        }

        const fieldName = normalizeText(this.getNodeParameter('fieldName', index, ''));
        const fieldValueType = this.getNodeParameter('fieldValueType', index, 'string') as string;
        const fieldValueRaw = String(this.getNodeParameter('fieldValue', index, '') ?? '');
        const fieldValue = parseFieldValue(fieldValueType, fieldValueRaw);
        await api.updateItemField(itemCode, fieldName, fieldValue);

        return this.helpers.returnJsonArray([{
            updated: true,
            itemCode,
            fieldName,
            fieldValue,
        }]);
    } catch (error: unknown) {
        throw new NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'Nao foi possivel editar o item.');
    }
}
