import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { SAPB1ManagedDocumentType } from '../../../transport/Interfaces';

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

function getDocumentType(this: IExecuteFunctions, index: number): SAPB1ManagedDocumentType {
    const resource = this.getNodeParameter('resource', index) as string;
    if (resource === 'document') {
        return this.getNodeParameter('documentType', index) as SAPB1ManagedDocumentType;
    }

    return resource as SAPB1ManagedDocumentType;
}

export async function updateField(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const documentType = getDocumentType.call(this, index);
    const docEntry = this.getNodeParameter('docEntry', index) as number;
    const updateMode = this.getNodeParameter('updateMode', index, 'single') as string;

    try {
        const payload = updateMode === 'multiple'
            ? ((this.getNodeParameter('fieldsToUpdate', index, {}) as IFieldUpdateParameter).fields ?? [])
                .reduce((result, field, fieldIndex) => {
                    const fieldName = normalizeText(field.fieldName);
                    if (!fieldName) {
                        throw new Error(`Nome do campo nao informado na linha ${fieldIndex + 1}.`);
                    }

                    result[fieldName] = parseFieldValue(
                        normalizeText(field.fieldValueType) || 'string',
                        String(field.fieldValue ?? ''),
                    );
                    return result;
                }, {} as IDataObject)
            : {
                [normalizeText(this.getNodeParameter('fieldName', index, ''))]: parseFieldValue(
                    this.getNodeParameter('fieldValueType', index, 'string') as string,
                    String(this.getNodeParameter('fieldValue', index, '') ?? ''),
                ),
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
    } catch (error: unknown) {
        throw new NodeOperationError(
            this.getNode(),
            error instanceof Error ? error.message : 'Nao foi possivel editar o documento.',
            { itemIndex: index },
        );
    }
}
