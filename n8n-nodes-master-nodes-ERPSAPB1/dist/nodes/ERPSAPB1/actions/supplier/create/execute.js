"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = create;
exports.createSupplierInSap = createSupplierInSap;
const n8n_workflow_1 = require("n8n-workflow");
const ERPSAPB1Builders_1 = require("../../../transport/ERPSAPB1Builders");
const text_1 = require("../../../utils/text");
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
function normalizeDigits(value) {
    return (0, text_1.extractDigitsFromString)(normalizeText(value));
}
function hasValue(value) {
    return normalizeText(value).length > 0;
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
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {});
    return createSupplierInSap.call(this, api, index, {
        cardCode: normalizeText(this.getNodeParameter('cardCode', index, '')),
        cardName: normalizeText(this.getNodeParameter('cardName', index, '')),
        cnpj: (0, text_1.extractDigitsFromString)(this.getNodeParameter('cnpj', index, '')),
        email: normalizeText(this.getNodeParameter('email', index, '')),
        phoneDdd: normalizeDigits(this.getNodeParameter('phoneDdd', index, '')),
        phone: normalizeDigits(this.getNodeParameter('phone', index, '')),
        addressName: normalizeText(this.getNodeParameter('addressName', index, 'PRINCIPAL')) || 'PRINCIPAL',
        street: normalizeText(this.getNodeParameter('street', index, '')),
        streetType: normalizeText(this.getNodeParameter('streetType', index, 'Rua')),
        streetNo: normalizeText(this.getNodeParameter('streetNo', index, '')),
        block: normalizeText(this.getNodeParameter('block', index, '')),
        buildingFloorRoom: normalizeText(this.getNodeParameter('buildingFloorRoom', index, '')),
        city: normalizeText(this.getNodeParameter('city', index, '')),
        county: normalizeText(this.getNodeParameter('county', index, '')),
        zipCode: normalizeText(this.getNodeParameter('zipCode', index, '')),
        state: normalizeText(this.getNodeParameter('state', index, '')),
        country: normalizeText(this.getNodeParameter('country', index, 'BR')),
        dynamicFields,
    });
}
async function createSupplierInSap(api, index, input) {
    const cardCode = normalizeText(input.cardCode);
    const cardName = normalizeText(input.cardName);
    const cnpj = (0, text_1.extractDigitsFromString)(input.cnpj);
    const email = normalizeText(input.email);
    const phoneDdd = normalizeDigits(input.phoneDdd);
    const phone = normalizeDigits(input.phone);
    const addressName = normalizeText(input.addressName) || 'PRINCIPAL';
    const street = normalizeText(input.street);
    const streetType = normalizeText(input.streetType) || 'Rua';
    const streetNo = normalizeText(input.streetNo);
    const block = normalizeText(input.block);
    const buildingFloorRoom = normalizeText(input.buildingFloorRoom);
    const city = normalizeText(input.city);
    const county = normalizeText(input.county) || city;
    const zipCode = normalizeText(input.zipCode);
    const state = normalizeText(input.state);
    const country = normalizeText(input.country) || 'BR';
    if (!cardName) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Nome do fornecedor é obrigatório para criar PN no SAP B1. Preencha o nome manualmente ou verifique o retorno da API da Receita.', { itemIndex: index });
    }
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
    const hasAddress = hasAnyAddressValue(address);
    if (hasAddress) {
        address.TypeOfAddress = streetType || 'Rua';
    }
    if (hasAddress && !county) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Município do endereço é obrigatório para criar PN no SAP B1. Preencha o campo Município ou Cidade.', { itemIndex: index });
    }
    const resolvedCardCode = cardCode || await api.generateNextSupplierCardCode('F', 6);
    const supplier = (0, ERPSAPB1Builders_1.applyDynamicFields)({
        CardCode: resolvedCardCode,
        CardName: cardName,
        CardType: 'cSupplier',
        FederalTaxID: cnpj || undefined,
        U_FGR_TAXID0: cnpj || undefined,
        EmailAddress: email || undefined,
        Phone1: phone || undefined,
        Phone2: phoneDdd || undefined,
        BPAddresses: buildReplicatedAddresses(addressName, address),
    }, input.dynamicFields);
    if (!normalizeText(supplier.EmailAddress)) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'E-mail do PN é obrigatório para criar fornecedor no SAP B1. Preencha o campo E-mail ou informe EmailAddress em Campos Dinâmicos.', { itemIndex: index });
    }
    const hasPhone = hasValue(supplier.Phone1) || hasValue(supplier.Cellular);
    const hasDdd = hasValue(supplier.Phone2)
        || hasValue(supplier.DDD)
        || hasValue(supplier.U_DDD)
        || hasValue(supplier.U_FGR_DDD);
    if (!hasPhone || !hasDdd) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Telefone e DDD do PN são obrigatórios para criar fornecedor no SAP B1. Preencha Telefone (Phone1) e DDD (Phone2).', { itemIndex: index });
    }
    const createdSupplier = await api.createSupplier(supplier);
    return this.helpers.returnJsonArray([createdSupplier]);
}
