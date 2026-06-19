"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
function getSupplierLookupParams(supplier) {
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
function getSupplierCacheKey(params) {
    return Object.entries(params)
        .map(([key, value]) => `${key}:${value}`)
        .join('|');
}
async function enrichSuppliersWithDetails(api, suppliers) {
    const cache = new Map();
    const enrichedSuppliers = [];
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
        }
        catch {
            enrichedSuppliers.push(supplier);
        }
    }
    return enrichedSuppliers;
}
async function execute(api, index) {
    const returnAll = this.getNodeParameter('returnAll', index, true);
    const maxItems = this.getNodeParameter('maxItems', index, 0);
    const page = this.getNodeParameter('page', index, 1);
    const pageSize = this.getNodeParameter('pageSize', index);
    const onlyApiImported = this.getNodeParameter('onlyApiImported', index);
    const cpfCnpj = this.getNodeParameter('cpfCnpj', index);
    const nomeFantasia = this.getNodeParameter('nomeFantasia', index);
    const fetchSupplierDetails = this.getNodeParameter('fetchSupplierDetails', index, false);
    const params = {
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
//# sourceMappingURL=execute.js.map