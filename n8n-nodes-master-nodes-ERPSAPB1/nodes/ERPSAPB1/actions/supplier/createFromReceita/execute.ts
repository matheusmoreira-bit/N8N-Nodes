import axios from 'axios';
import { IDataObject, IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { IDynamicField } from '../../../transport/Interfaces';
import { extractDigitsFromString } from '../../../utils/text';
import { createSupplierInSap, ISupplierCreateInput } from '../create/execute';

interface IDynamicFieldParameter {
    dynamicFields?: IDynamicField[];
}

type ReceitaProvider = 'auto' | 'publicaCnpjWs' | 'receitaWs';

interface INormalizedReceitaSupplier {
    cnpj: string;
    cardName: string;
    email: string;
    phoneDdd: string;
    phone: string;
    street: string;
    streetType: string;
    streetNo: string;
    block: string;
    buildingFloorRoom: string;
    city: string;
    county: string;
    zipCode: string;
    state: string;
    country: string;
    source: string;
    raw: IDataObject;
}

function normalizeText(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function getPath(value: unknown, path: string): unknown {
    return path.split('.').reduce<unknown>((currentValue, key) => {
        if (currentValue && typeof currentValue === 'object' && key in currentValue) {
            return (currentValue as IDataObject)[key];
        }

        return undefined;
    }, value);
}

function firstText(value: unknown, paths: string[]): string {
    for (const path of paths) {
        const text = normalizeText(getPath(value, path));
        if (text) {
            return text;
        }
    }

    return '';
}

function parseReceitaWsPhone(value: unknown): { phoneDdd: string; phone: string } {
    const digits = extractDigitsFromString(value);
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

function normalizeStreetType(value: string): string {
    const text = value.trim().toUpperCase();
    const map: Record<string, string> = {
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

function detectStreetTypeFromStreet(street: string): string {
    const firstToken = street.trim().split(/\s+/)[0] || '';
    return normalizeStreetType(firstToken);
}

function normalizeReceitaWs(raw: IDataObject, requestedCnpj: string): INormalizedReceitaSupplier {
    const phone = parseReceitaWsPhone(raw.telefone);
    const street = normalizeText(raw.logradouro);

    return {
        cnpj: extractDigitsFromString(raw.cnpj) || requestedCnpj,
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
        zipCode: extractDigitsFromString(raw.cep),
        state: normalizeText(raw.uf),
        country: 'BR',
        source: 'receitaWs',
        raw,
    };
}

function normalizePublicaCnpjWs(raw: IDataObject, requestedCnpj: string): INormalizedReceitaSupplier {
    const streetType = firstText(raw, ['estabelecimento.tipo_logradouro']);

    return {
        cnpj: extractDigitsFromString(firstText(raw, ['estabelecimento.cnpj'])) || requestedCnpj,
        cardName: firstText(raw, ['razao_social', 'estabelecimento.nome_fantasia']),
        email: firstText(raw, ['estabelecimento.email']),
        phoneDdd: extractDigitsFromString(firstText(raw, ['estabelecimento.ddd1', 'estabelecimento.ddd2'])),
        phone: extractDigitsFromString(firstText(raw, ['estabelecimento.telefone1', 'estabelecimento.telefone2'])),
        street: firstText(raw, ['estabelecimento.logradouro']),
        streetType: normalizeStreetType(streetType),
        streetNo: firstText(raw, ['estabelecimento.numero']),
        block: firstText(raw, ['estabelecimento.bairro']),
        buildingFloorRoom: firstText(raw, ['estabelecimento.complemento']),
        city: firstText(raw, ['estabelecimento.cidade.nome']),
        county: firstText(raw, ['estabelecimento.cidade.nome']),
        zipCode: extractDigitsFromString(firstText(raw, ['estabelecimento.cep'])),
        state: firstText(raw, ['estabelecimento.estado.sigla']),
        country: firstText(raw, ['estabelecimento.pais.iso2']) || 'BR',
        source: 'publicaCnpjWs',
        raw,
    };
}

async function fetchReceitaWs(cnpj: string): Promise<INormalizedReceitaSupplier> {
    const response = await axios.get<IDataObject>(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, { timeout: 30000 });
    const status = normalizeText(response.data.status).toUpperCase();

    if (status && status !== 'OK') {
        throw new Error(normalizeText(response.data.message) || `ReceitaWS retornou status ${status}.`);
    }

    return normalizeReceitaWs(response.data, cnpj);
}

async function fetchPublicaCnpjWs(cnpj: string): Promise<INormalizedReceitaSupplier> {
    const response = await axios.get<IDataObject>(`https://publica.cnpj.ws/cnpj/${cnpj}`, { timeout: 30000 });
    return normalizePublicaCnpjWs(response.data, cnpj);
}

async function fetchReceitaSupplier(cnpj: string, provider: ReceitaProvider): Promise<INormalizedReceitaSupplier> {
    if (provider === 'receitaWs') {
        return fetchReceitaWs(cnpj);
    }

    if (provider === 'publicaCnpjWs') {
        return fetchPublicaCnpjWs(cnpj);
    }

    try {
        return await fetchPublicaCnpjWs(cnpj);
    } catch (publicaError) {
        try {
            return await fetchReceitaWs(cnpj);
        } catch (receitaError) {
            const publicaMessage = publicaError instanceof Error ? publicaError.message : 'erro desconhecido';
            const receitaMessage = receitaError instanceof Error ? receitaError.message : 'erro desconhecido';
            throw new Error(`Nao foi possivel consultar CNPJ nas APIs publicas. publica.cnpj.ws: ${publicaMessage}. ReceitaWS: ${receitaMessage}.`);
        }
    }
}

export async function createFromReceita(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const cnpj = extractDigitsFromString(this.getNodeParameter('receitaCnpj', index, ''));
    const provider = this.getNodeParameter('receitaProvider', index, 'auto') as ReceitaProvider;
    const { dynamicFields } = this.getNodeParameter('receitaDynamicFields', index, {}) as IDynamicFieldParameter;

    if (cnpj.length !== 14) {
        throw new NodeOperationError(this.getNode(), 'Informe um CNPJ válido com 14 dígitos.', { itemIndex: index });
    }

    const receitaSupplier = await fetchReceitaSupplier(cnpj, provider);
    const input: ISupplierCreateInput = {
        cardCode: normalizeText(this.getNodeParameter('receitaCardCode', index, '')),
        cardName: normalizeText(this.getNodeParameter('receitaCardName', index, '')) || receitaSupplier.cardName,
        cnpj: receitaSupplier.cnpj || cnpj,
        email: normalizeText(this.getNodeParameter('receitaEmail', index, '')) || receitaSupplier.email,
        phoneDdd: extractDigitsFromString(this.getNodeParameter('receitaPhoneDdd', index, '')) || receitaSupplier.phoneDdd,
        phone: extractDigitsFromString(this.getNodeParameter('receitaPhone', index, '')) || receitaSupplier.phone,
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

    const createdSupplier = await createSupplierInSap.call(this, api, index, input);
    return createdSupplier.map((item) => ({
        json: {
            ...item.json,
            receitaSource: receitaSupplier.source,
            receitaData: receitaSupplier.raw,
        },
    }));
}
