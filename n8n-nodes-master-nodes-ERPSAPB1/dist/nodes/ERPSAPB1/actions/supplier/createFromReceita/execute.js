"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFromReceita = createFromReceita;
const axios_1 = __importDefault(require("axios"));
const n8n_workflow_1 = require("n8n-workflow");
const text_1 = require("../../../utils/text");
const execute_1 = require("../create/execute");
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
function getPath(value, path) {
    return path.split('.').reduce((currentValue, key) => {
        if (currentValue && typeof currentValue === 'object' && key in currentValue) {
            return currentValue[key];
        }
        return undefined;
    }, value);
}
function firstText(value, paths) {
    for (const path of paths) {
        const text = normalizeText(getPath(value, path));
        if (text) {
            return text;
        }
    }
    return '';
}
function parseReceitaWsPhone(value) {
    const digits = (0, text_1.extractDigitsFromString)(value);
    if (digits.length >= 10) {
        return {
            phoneDdd: digits.slice(0, 2),
            phone: digits.slice(2),
        };
    }
    return {
        phoneDdd: '',
        phone: digits,
    };
}
function normalizeStreetType(value) {
    const text = value.trim().toUpperCase();
    const map = {
        AL: 'Alameda',
        ALAMEDA: 'Alameda',
        AV: 'Avenida',
        AVENIDA: 'Avenida',
        EST: 'Estrada',
        ESTRADA: 'Estrada',
        PC: 'Praca',
        PRACA: 'Praca',
        PRAÇA: 'Praca',
        R: 'Rua',
        RUA: 'Rua',
        ROD: 'Rodovia',
        RODOVIA: 'Rodovia',
        TV: 'Travessa',
        TRAVESSA: 'Travessa',
    };
    return map[text] || value || 'Rua';
}
function detectStreetTypeFromStreet(street) {
    const firstToken = street.trim().split(/\s+/)[0] || '';
    return normalizeStreetType(firstToken);
}
function normalizeReceitaWs(raw, requestedCnpj) {
    const phone = parseReceitaWsPhone(raw.telefone);
    const street = normalizeText(raw.logradouro);
    return {
        cnpj: (0, text_1.extractDigitsFromString)(raw.cnpj) || requestedCnpj,
        cardName: normalizeText(raw.nome || raw.fantasia),
        email: normalizeText(raw.email),
        phoneDdd: phone.phoneDdd,
        phone: phone.phone,
        street,
        streetType: detectStreetTypeFromStreet(street),
        streetNo: normalizeText(raw.numero),
        block: normalizeText(raw.bairro),
        buildingFloorRoom: normalizeText(raw.complemento),
        city: normalizeText(raw.municipio),
        county: normalizeText(raw.municipio),
        zipCode: (0, text_1.extractDigitsFromString)(raw.cep),
        state: normalizeText(raw.uf),
        country: 'BR',
        source: 'receitaWs',
        raw,
    };
}
function normalizePublicaCnpjWs(raw, requestedCnpj) {
    const streetType = firstText(raw, ['estabelecimento.tipo_logradouro']);
    return {
        cnpj: (0, text_1.extractDigitsFromString)(firstText(raw, ['estabelecimento.cnpj'])) || requestedCnpj,
        cardName: firstText(raw, ['razao_social', 'estabelecimento.nome_fantasia']),
        email: firstText(raw, ['estabelecimento.email']),
        phoneDdd: (0, text_1.extractDigitsFromString)(firstText(raw, ['estabelecimento.ddd1', 'estabelecimento.ddd2'])),
        phone: (0, text_1.extractDigitsFromString)(firstText(raw, ['estabelecimento.telefone1', 'estabelecimento.telefone2'])),
        street: firstText(raw, ['estabelecimento.logradouro']),
        streetType: normalizeStreetType(streetType),
        streetNo: firstText(raw, ['estabelecimento.numero']),
        block: firstText(raw, ['estabelecimento.bairro']),
        buildingFloorRoom: firstText(raw, ['estabelecimento.complemento']),
        city: firstText(raw, ['estabelecimento.cidade.nome']),
        county: firstText(raw, ['estabelecimento.cidade.nome']),
        zipCode: (0, text_1.extractDigitsFromString)(firstText(raw, ['estabelecimento.cep'])),
        state: firstText(raw, ['estabelecimento.estado.sigla']),
        country: firstText(raw, ['estabelecimento.pais.iso2']) || 'BR',
        source: 'publicaCnpjWs',
        raw,
    };
}
async function fetchReceitaWs(cnpj) {
    const response = await axios_1.default.get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, { timeout: 30000 });
    const status = normalizeText(response.data.status).toUpperCase();
    if (status && status !== 'OK') {
        throw new Error(normalizeText(response.data.message) || `ReceitaWS retornou status ${status}.`);
    }
    return normalizeReceitaWs(response.data, cnpj);
}
async function fetchPublicaCnpjWs(cnpj) {
    const response = await axios_1.default.get(`https://publica.cnpj.ws/cnpj/${cnpj}`, { timeout: 30000 });
    return normalizePublicaCnpjWs(response.data, cnpj);
}
async function fetchReceitaSupplier(cnpj, provider) {
    if (provider === 'receitaWs') {
        return fetchReceitaWs(cnpj);
    }
    if (provider === 'publicaCnpjWs') {
        return fetchPublicaCnpjWs(cnpj);
    }
    try {
        return await fetchPublicaCnpjWs(cnpj);
    }
    catch (publicaError) {
        try {
            return await fetchReceitaWs(cnpj);
        }
        catch (receitaError) {
            const publicaMessage = publicaError instanceof Error ? publicaError.message : 'erro desconhecido';
            const receitaMessage = receitaError instanceof Error ? receitaError.message : 'erro desconhecido';
            throw new Error(`Nao foi possivel consultar CNPJ nas APIs publicas. publica.cnpj.ws: ${publicaMessage}. ReceitaWS: ${receitaMessage}.`);
        }
    }
}
async function createFromReceita(api, index) {
    const cnpj = (0, text_1.extractDigitsFromString)(this.getNodeParameter('receitaCnpj', index, ''));
    const provider = this.getNodeParameter('receitaProvider', index, 'auto');
    const { dynamicFields } = this.getNodeParameter('receitaDynamicFields', index, {});
    if (cnpj.length !== 14) {
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Informe um CNPJ válido com 14 dígitos.', { itemIndex: index });
    }
    const receitaSupplier = await fetchReceitaSupplier(cnpj, provider);
    const input = {
        cardCode: normalizeText(this.getNodeParameter('receitaCardCode', index, '')),
        cardName: normalizeText(this.getNodeParameter('receitaCardName', index, '')) || receitaSupplier.cardName,
        cnpj: receitaSupplier.cnpj || cnpj,
        email: normalizeText(this.getNodeParameter('receitaEmail', index, '')) || receitaSupplier.email,
        phoneDdd: (0, text_1.extractDigitsFromString)(this.getNodeParameter('receitaPhoneDdd', index, '')) || receitaSupplier.phoneDdd,
        phone: (0, text_1.extractDigitsFromString)(this.getNodeParameter('receitaPhone', index, '')) || receitaSupplier.phone,
        addressName: normalizeText(this.getNodeParameter('receitaAddressName', index, 'PRINCIPAL')) || 'PRINCIPAL',
        street: receitaSupplier.street,
        streetType: receitaSupplier.streetType,
        streetNo: receitaSupplier.streetNo,
        block: receitaSupplier.block,
        buildingFloorRoom: receitaSupplier.buildingFloorRoom,
        city: receitaSupplier.city,
        county: receitaSupplier.county,
        zipCode: receitaSupplier.zipCode,
        state: receitaSupplier.state,
        country: receitaSupplier.country || 'BR',
        dynamicFields,
    };
    const createdSupplier = await execute_1.createSupplierInSap.call(this, api, index, input);
    return createdSupplier.map((item) => ({
        json: {
            ...item.json,
            receitaSource: receitaSupplier.source,
            receitaData: receitaSupplier.raw,
        },
    }));
}
