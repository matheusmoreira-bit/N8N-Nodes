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

export async function create(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const itemCode = normalizeText(this.getNodeParameter('itemCode', index, ''));
    const itemName = normalizeText(this.getNodeParameter('itemName', index, ''));
    const itemsGroupCode = this.getNodeParameter('itemsGroupCode', index, 0) as number;
    const purchaseItem = this.getNodeParameter('purchaseItem', index, true) as boolean;
    const salesItem = this.getNodeParameter('salesItem', index, true) as boolean;
    const inventoryItem = this.getNodeParameter('inventoryItem', index, true) as boolean;
    const uomCode = this.getNodeParameter('uomCode', index, 0) as number;
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {}) as IDynamicFieldParameter;

    const item = applyDynamicFields({
        ItemCode: itemCode,
        ItemName: itemName,
        ItemsGroupCode: itemsGroupCode > 0 ? itemsGroupCode : undefined,
        PurchaseItem: purchaseItem,
        SalesItem: salesItem,
        InventoryItem: inventoryItem,
        UoMGroupEntry: uomCode > 0 ? uomCode : undefined,
    } as IDataObject, dynamicFields);

    const createdItem = await api.createItem(item);
    return this.helpers.returnJsonArray([createdItem]);
}
