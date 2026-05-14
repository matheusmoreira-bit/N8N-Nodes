import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { IDynamicField } from '../../../transport/Interfaces';
import { applyDynamicFields } from '../../../transport/ERPSAPB1Builders';

interface IDynamicFieldParameter {
    dynamicFields?: IDynamicField[];
}

function normalizeText(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

export async function createGroup(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const groupName = normalizeText(this.getNodeParameter('groupName', index, ''));
    const baseUnit = normalizeText(this.getNodeParameter('baseUnit', index, ''));
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {}) as IDynamicFieldParameter;

    const itemGroup = applyDynamicFields({
        GroupName: groupName,
        BaseUnit: baseUnit || undefined,
    } as IDataObject, dynamicFields);

    const createdItemGroup = await api.createItemGroup(itemGroup);
    return this.helpers.returnJsonArray([createdItemGroup]);
}
