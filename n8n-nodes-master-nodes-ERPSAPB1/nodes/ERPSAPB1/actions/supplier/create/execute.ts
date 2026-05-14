import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { IDynamicField } from '../../../transport/Interfaces';
import { applyDynamicFields } from '../../../transport/ERPSAPB1Builders';
import { extractDigitsFromString } from '../../../utils/text';

interface IDynamicFieldParameter {
    dynamicFields?: IDynamicField[];
}

function normalizeText(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function hasAnyAddressValue(address: IDataObject): boolean {
    return Object.values(address).some((value) => typeof value === 'string' && value.trim().length > 0);
}

function buildReplicatedAddresses(baseAddressName: string, address: IDataObject): IDataObject[] {
    if (!hasAnyAddressValue(address)) {
        return [];
    }

    return [
        {
            AddressName: `${baseAddressName}-ENTREGA`,
            AddressType: 'bo_ShipTo',
            ...address,
        },
        {
            AddressName: `${baseAddressName}-COBRANCA`,
            AddressType: 'bo_BillTo',
            ...address,
        },
    ];
}

export async function create(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const cardName = normalizeText(this.getNodeParameter('cardName', index, ''));
    const cnpj = extractDigitsFromString(this.getNodeParameter('cnpj', index, ''));
    const addressName = normalizeText(this.getNodeParameter('addressName', index, 'PRINCIPAL')) || 'PRINCIPAL';
    const street = normalizeText(this.getNodeParameter('street', index, ''));
    const streetNo = normalizeText(this.getNodeParameter('streetNo', index, ''));
    const block = normalizeText(this.getNodeParameter('block', index, ''));
    const buildingFloorRoom = normalizeText(this.getNodeParameter('buildingFloorRoom', index, ''));
    const city = normalizeText(this.getNodeParameter('city', index, ''));
    const zipCode = normalizeText(this.getNodeParameter('zipCode', index, ''));
    const state = normalizeText(this.getNodeParameter('state', index, ''));
    const country = normalizeText(this.getNodeParameter('country', index, 'BR'));
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {}) as IDynamicFieldParameter;

    const address: IDataObject = {
        Street: street || undefined,
        StreetNo: streetNo || undefined,
        Block: block || undefined,
        BuildingFloorRoom: buildingFloorRoom || undefined,
        City: city || undefined,
        ZipCode: zipCode || undefined,
        State: state || undefined,
        Country: country || undefined,
    };

    const resolvedCardCode = cardCode || await api.generateNextSupplierCardCode('F', 6);

    const supplier = applyDynamicFields({
        CardCode: resolvedCardCode,
        CardName: cardName,
        CardType: 'cSupplier',
        FederalTaxID: cnpj || undefined,
        U_FGR_TAXID0: cnpj || undefined,
        BPAddresses: buildReplicatedAddresses(addressName, address),
    } as IDataObject, dynamicFields);

    const createdSupplier = await api.createSupplier(supplier);
    return this.helpers.returnJsonArray([createdSupplier]);
}
