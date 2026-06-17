"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
const n8n_workflow_1 = require("n8n-workflow");
const ERPSAPB1Builders_1 = require("../../../transport/ERPSAPB1Builders");
const text_1 = require("../../../utils/text");
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
function hasAnyAddressValue(address) {
    return Object.entries(address).some(([key, value]) => key !== 'Country' && typeof value === 'string' && value.trim().length > 0);
}
function buildReplicatedAddresses(baseAddressName, address) {
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
async function create(api, index) {
    const cardCode = normalizeText(this.getNodeParameter('cardCode', index, ''));
    const cardName = normalizeText(this.getNodeParameter('cardName', index, ''));
    const cnpj = (0, text_1.extractDigitsFromString)(this.getNodeParameter('cnpj', index, ''));
    const addressName = normalizeText(this.getNodeParameter('addressName', index, 'PRINCIPAL')) || 'PRINCIPAL';
    const street = normalizeText(this.getNodeParameter('street', index, ''));
    const streetNo = normalizeText(this.getNodeParameter('streetNo', index, ''));
    const block = normalizeText(this.getNodeParameter('block', index, ''));
    const buildingFloorRoom = normalizeText(this.getNodeParameter('buildingFloorRoom', index, ''));
    const city = normalizeText(this.getNodeParameter('city', index, ''));
    const county = normalizeText(this.getNodeParameter('county', index, '')) || city;
    const zipCode = normalizeText(this.getNodeParameter('zipCode', index, ''));
    const state = normalizeText(this.getNodeParameter('state', index, ''));
    const country = normalizeText(this.getNodeParameter('country', index, 'BR'));
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {});
    const address = {
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
    if (hasAnyAddressValue(address) && !county) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Município do endereço é obrigatório para criar PN no SAP B1. Preencha o campo Município ou Cidade.', { itemIndex: index });
    }
    const resolvedCardCode = cardCode || await api.generateNextSupplierCardCode('F', 6);
    const supplier = (0, ERPSAPB1Builders_1.applyDynamicFields)({
        CardCode: resolvedCardCode,
        CardName: cardName,
        CardType: 'cSupplier',
        FederalTaxID: cnpj || undefined,
        U_FGR_TAXID0: cnpj || undefined,
        BPAddresses: buildReplicatedAddresses(addressName, address),
    }, dynamicFields);
    const createdSupplier = await api.createSupplier(supplier);
    return this.helpers.returnJsonArray([createdSupplier]);
}
