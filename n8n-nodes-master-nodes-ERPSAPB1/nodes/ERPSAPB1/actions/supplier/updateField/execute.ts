import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';

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
            return JSON.parse(rawValue) as IDataObject;
        case 'string':
        default:
            return rawValue;
    }
}

export async function updateField(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const fieldName = normalizeText(this.getNodeParameter('fieldName', index, ''));
    const fieldValueType = this.getNodeParameter('fieldValueType', index, 'string') as string;
    const fieldValueRaw = String(this.getNodeParameter('fieldValue', index, '') ?? '');

    try {
        const fieldValue = parseFieldValue(fieldValueType, fieldValueRaw);
        await api.updateSupplierField(cardCode, fieldName, fieldValue);

        return this.helpers.returnJsonArray([{
            updated: true,
            cardCode,
            fieldName,
            fieldValue,
        }]);
    } catch (error: unknown) {
        throw new NodeOperationError(this.getNode(), error instanceof Error ? error.message : 'Nao foi possivel editar o fornecedor.');
    }
}
