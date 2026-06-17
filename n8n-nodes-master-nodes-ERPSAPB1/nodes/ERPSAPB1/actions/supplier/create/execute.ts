import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

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

function normalizeDigits(value: unknown): string {
    return extractDigitsFromString(normalizeText(value));
}

function hasValue(value: unknown): boolean {
    return normalizeText(value).length > 0;
}

function hasAnyAddressValue(address: IDataObject): boolean {
    return Object.entries(address).some(([key, value]) => key !== 'Country' && typeof value === 'string' && value.trim().length > 0);
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
    const email = normalizeText(this.getNodeParameter('email', index, ''));
    const phoneDdd = normalizeDigits(this.getNodeParameter('phoneDdd', index, ''));
    const phone = normalizeDigits(this.getNodeParameter('phone', index, ''));
    const phone1 = phoneDdd && phone ? `${phoneDdd}${phone}` : phone;
    const addressName = normalizeText(this.getNodeParameter('addressName', index, 'PRINCIPAL')) || 'PRINCIPAL';
    const street = normalizeText(this.getNodeParameter('street', index, ''));
    const streetType = normalizeText(this.getNodeParameter('streetType', index, 'Rua'));
    const streetNo = normalizeText(this.getNodeParameter('streetNo', index, ''));
    const block = normalizeText(this.getNodeParameter('block', index, ''));
    const buildingFloorRoom = normalizeText(this.getNodeParameter('buildingFloorRoom', index, ''));
    const city = normalizeText(this.getNodeParameter('city', index, ''));
    const county = normalizeText(this.getNodeParameter('county', index, '')) || city;
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
        County: county || undefined,
        ZipCode: zipCode || undefined,
        State: state || undefined,
        Country: country || undefined,
    };
    const hasAddress = hasAnyAddressValue(address);

    if (hasAddress) {
        address.TypeOfAddress = streetType || 'Rua';
    }

    if (hasAddress && !county) {
        throw new NodeOperationError(
            this.getNode(),
            'Município do endereço é obrigatório para criar PN no SAP B1. Preencha o campo Município ou Cidade.',
            { itemIndex: index },
        );
    }

    const resolvedCardCode = cardCode || await api.generateNextSupplierCardCode('F', 6);

    const supplier = applyDynamicFields({
        CardCode: resolvedCardCode,
        CardName: cardName,
        CardType: 'cSupplier',
        FederalTaxID: cnpj || undefined,
        U_FGR_TAXID0: cnpj || undefined,
        EmailAddress: email || undefined,
        Phone1: phone1 || undefined,
        BPAddresses: buildReplicatedAddresses(addressName, address),
    } as IDataObject, dynamicFields);

    if (!normalizeText(supplier.EmailAddress)) {
        throw new NodeOperationError(
            this.getNode(),
            'E-mail do PN é obrigatório para criar fornecedor no SAP B1. Preencha o campo E-mail ou informe EmailAddress em Campos Dinâmicos.',
            { itemIndex: index },
        );
    }

    const hasPhone = hasValue(supplier.Phone1) || hasValue(supplier.Phone2) || hasValue(supplier.Cellular);
    const hasDdd = Boolean(phoneDdd)
        || hasValue(supplier.DDD)
        || hasValue(supplier.U_DDD)
        || hasValue(supplier.U_FGR_DDD)
        || /^\d{10,11}$/.test(normalizeDigits(supplier.Phone1));

    if (!hasPhone || !hasDdd) {
        throw new NodeOperationError(
            this.getNode(),
            'Telefone e DDD do PN são obrigatórios para criar fornecedor no SAP B1. Preencha DDD e Telefone ou informe Phone1 e o campo de DDD em Campos Dinâmicos.',
            { itemIndex: index },
        );
    }

    const createdSupplier = await api.createSupplier(supplier);
    return this.helpers.returnJsonArray([createdSupplier]);
}
