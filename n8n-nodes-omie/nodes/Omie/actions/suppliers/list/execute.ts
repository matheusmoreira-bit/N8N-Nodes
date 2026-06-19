import {
    IExecuteFunctions,
    INodeExecutionData,
    IDataObject,
} from 'n8n-workflow';

import { OmieApi } from '../../../transport/OmieApi';

function getSupplierLookupParams(supplier: IDataObject): IDataObject {
    const codigoClienteOmie = supplier.codigo_cliente_omie ?? supplier.codigo_cliente;
    const codigoClienteIntegracao = supplier.codigo_cliente_integracao;

    if (codigoClienteOmie !== undefined && codigoClienteOmie !== null && `${codigoClienteOmie}`.trim()) {
        const parsedCode = Number(codigoClienteOmie);
        return {
            codigo_cliente_omie: Number.isNaN(parsedCode) ? codigoClienteOmie : parsedCode,
        };
    }

    if (codigoClienteIntegracao !== undefined && codigoClienteIntegracao !== null && `${codigoClienteIntegracao}`.trim()) {
        return {
            codigo_cliente_integracao: codigoClienteIntegracao,
        };
    }

    return {};
}

function getSupplierCacheKey(params: IDataObject): string {
    return Object.entries(params)
        .map(([key, value]) => `${key}:${value}`)
        .join('|');
}

async function enrichSuppliersWithDetails(api: OmieApi, suppliers: IDataObject[]): Promise<IDataObject[]> {
    const cache = new Map<string, IDataObject>();
    const enrichedSuppliers: IDataObject[] = [];

    for (const supplier of suppliers) {
        const lookupParams = getSupplierLookupParams(supplier);
        const cacheKey = getSupplierCacheKey(lookupParams);

        if (!cacheKey) {
            enrichedSuppliers.push(supplier);
            continue;
        }

        try {
            let supplierDetails = cache.get(cacheKey);
            if (!supplierDetails) {
                supplierDetails = await api.getSupplier(lookupParams);
                cache.set(cacheKey, supplierDetails);
            }

            enrichedSuppliers.push({
                ...supplier,
                ...supplierDetails,
            });
        } catch {
            enrichedSuppliers.push(supplier);
        }
    }

    return enrichedSuppliers;
}

export async function execute(this: IExecuteFunctions, api: OmieApi, index: number): Promise<INodeExecutionData[]> {
    const returnAll = this.getNodeParameter('returnAll', index, true) as boolean;
    const maxItems = this.getNodeParameter('maxItems', index, 0) as number;
    const page = this.getNodeParameter('page', index, 1) as number;
    const pageSize = this.getNodeParameter('pageSize', index) as number;
    const onlyApiImported = this.getNodeParameter('onlyApiImported', index) as boolean;
    const cpfCnpj = this.getNodeParameter('cpfCnpj', index) as string;
    const nomeFantasia = this.getNodeParameter('nomeFantasia', index) as string;
    const fetchSupplierDetails = this.getNodeParameter('fetchSupplierDetails', index, false) as boolean;

    const params: IDataObject = {
        pagina: page,
        registros_por_pagina: pageSize,
    };

    if (onlyApiImported) {
        params.apenas_importado_api = 'S';
    }
    if (cpfCnpj) {
        params.cpf_cnpj = cpfCnpj;
    }
    if (nomeFantasia) {
        params.nome_fantasia = nomeFantasia;
    }

    const results = await api.listSuppliers(params, returnAll, maxItems);
    if (fetchSupplierDetails) {
        return this.helpers.returnJsonArray(await enrichSuppliersWithDetails(api, results));
    }

    return this.helpers.returnJsonArray(results);
}
