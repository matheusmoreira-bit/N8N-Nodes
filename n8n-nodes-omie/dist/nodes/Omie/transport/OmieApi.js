"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmieApi = void 0;
const axios_1 = __importDefault(require("axios"));
const https_1 = __importDefault(require("https"));
const n8n_workflow_1 = require("n8n-workflow");
class OmieApi {
    constructor(baseUrl, appKey, appSecret, functions, ignoreSslIssues) {
        this.baseUrl = baseUrl;
        this.appKey = appKey;
        this.appSecret = appSecret;
        this.functions = functions;
        const normalizedBaseUrl = OmieApi.normalizeBaseUrl(baseUrl);
        const httpsAgent = new https_1.default.Agent({
            rejectUnauthorized: !ignoreSslIssues,
        });
        this.client = axios_1.default.create({
            baseURL: normalizedBaseUrl,
            httpsAgent,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    static normalizeBaseUrl(url) {
        const trimmed = url.trim();
        if (!trimmed.endsWith('/')) {
            return `${trimmed}/`;
        }
        return trimmed;
    }
    static createInstance(credentials, functions) {
        const baseUrl = `${credentials.apiBaseUrl ?? 'https://app.omie.com.br/api/v1/'}`.trim();
        return new OmieApi(baseUrl, `${credentials.appKey}`.trim(), `${credentials.appSecret}`.trim(), functions, Boolean(credentials.ignoreSslIssues));
    }
    toNodeApiError(error) {
        return new n8n_workflow_1.NodeApiError(this.functions.getNode(), error);
    }
    async callMethod(endpoint, method, param) {
        try {
            const response = await this.client.post(endpoint, {
                call: method,
                app_key: this.appKey,
                app_secret: this.appSecret,
                param,
            });
            return response.data;
        }
        catch (error) {
            throw this.toNodeApiError(error);
        }
    }
    getListResponse(response, keys) {
        for (const key of keys) {
            if (Array.isArray(response?.[key])) {
                return response[key];
            }
        }
        return [];
    }
    getNumberResponseField(response, keys) {
        for (const key of keys) {
            const value = response?.[key];
            if (typeof value === 'number') {
                return value;
            }
            if (typeof value === 'string' && value.trim() !== '') {
                const parsedValue = Number(value);
                if (!Number.isNaN(parsedValue)) {
                    return parsedValue;
                }
            }
        }
        return undefined;
    }
    async listPaginated(endpoint, method, params, responseKeys, maxItems = 0) {
        const allItems = [];
        const pageSize = Number(params.registros_por_pagina ?? 50);
        let currentPage = Number(params.pagina ?? 1);
        while (true) {
            const response = await this.callMethod(endpoint, method, [{
                    ...params,
                    pagina: currentPage,
                }]);
            const pageItems = this.getListResponse(response, responseKeys);
            const remainingItems = maxItems > 0 ? maxItems - allItems.length : undefined;
            if (remainingItems !== undefined && remainingItems <= 0) {
                break;
            }
            allItems.push(...(remainingItems !== undefined
                ? pageItems.slice(0, remainingItems)
                : pageItems));
            const totalPages = this.getNumberResponseField(response, ['total_de_paginas', 'total_pages']);
            const reachedMaxItems = maxItems > 0 && allItems.length >= maxItems;
            const reachedLastKnownPage = totalPages !== undefined && currentPage >= totalPages;
            const reachedLastInferredPage = totalPages === undefined && pageItems.length < pageSize;
            if (reachedMaxItems || reachedLastKnownPage || reachedLastInferredPage || pageItems.length === 0) {
                break;
            }
            currentPage++;
            if (currentPage > 10000) {
                throw new Error('Paginação interrompida por segurança após 10000 páginas retornadas pelo Omie.');
            }
        }
        return allItems;
    }
    async listAccountsPayable(params, returnAll = false, maxItems = 0) {
        if (returnAll) {
            return this.listPaginated('financas/contapagar/', 'ListarContasPagar', params, ['conta_pagar_cadastro'], maxItems);
        }
        const response = await this.callMethod('financas/contapagar/', 'ListarContasPagar', [params]);
        return this.getListResponse(response, ['conta_pagar_cadastro']);
    }
    async getAccountPayable(params) {
        return this.callMethod('financas/contapagar/', 'ConsultarContaPagar', [params]);
    }
    async settleAccountPayable(data) {
        return this.callMethod('financas/contapagar/', 'LancarPagamento', [data]);
    }
    async listSuppliers(params, returnAll = false, maxItems = 0) {
        if (returnAll) {
            return this.listPaginated('geral/clientes/', 'ListarClientes', params, ['clientes_cadastro'], maxItems);
        }
        const response = await this.callMethod('geral/clientes/', 'ListarClientes', [params]);
        return this.getListResponse(response, ['clientes_cadastro']);
    }
    async getSupplier(params) {
        return this.callMethod('geral/clientes/', 'ConsultarCliente', [params]);
    }
    async updateSupplier(data) {
        return this.callMethod('geral/clientes/', 'AlterarCliente', [data]);
    }
    async listItems(params, returnAll = false, maxItems = 0) {
        if (returnAll) {
            return this.listPaginated('produtos-servicos/', 'ListarProdutosServicos', params, ['produtos_servicos_cadastro', 'produtos_servicos'], maxItems);
        }
        const response = await this.callMethod('produtos-servicos/', 'ListarProdutosServicos', [params]);
        return this.getListResponse(response, ['produtos_servicos_cadastro', 'produtos_servicos']);
    }
    async updateItem(data) {
        return this.callMethod('produtos-servicos/', 'AlterarProdutoServico', [data]);
    }
    async listPayments(params, returnAll = false, maxItems = 0) {
        if (returnAll) {
            return this.listPaginated('financas/contapagar/', 'ListarContasPagar', params, ['conta_pagar_cadastro'], maxItems);
        }
        const response = await this.callMethod('financas/contapagar/', 'ListarContasPagar', [params]);
        return this.getListResponse(response, ['conta_pagar_cadastro']);
    }
    async settlePayment(data) {
        return this.callMethod('financas/contapagar/', 'LancarPagamento', [data]);
    }
}
exports.OmieApi = OmieApi;
//# sourceMappingURL=OmieApi.js.map