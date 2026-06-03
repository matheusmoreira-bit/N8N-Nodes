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
    async listAccountsPayable(params) {
        const response = await this.callMethod('financas/contapagar/', 'ListarContasPagar', [params]);
        return this.getListResponse(response, ['conta_pagar_cadastro']);
    }
    async settleAccountPayable(data) {
        return this.callMethod('financas/contapagar/', 'LancarPagamento', [data]);
    }
    async listSuppliers(params) {
        const response = await this.callMethod('geral/clientes/', 'ListarClientes', [params]);
        return this.getListResponse(response, ['clientes_cadastro']);
    }
    async updateSupplier(data) {
        return this.callMethod('geral/clientes/', 'AlterarCliente', [data]);
    }
    async listItems(params) {
        const response = await this.callMethod('produtos-servicos/', 'ListarProdutosServicos', [params]);
        return this.getListResponse(response, ['produtos_servicos_cadastro', 'produtos_servicos']);
    }
    async updateItem(data) {
        return this.callMethod('produtos-servicos/', 'AlterarProdutoServico', [data]);
    }
    async listPayments(params) {
        const response = await this.callMethod('financas/contapagar/', 'ListarContasPagar', [params]);
        return this.getListResponse(response, ['conta_pagar_cadastro']);
    }
    async settlePayment(data) {
        return this.callMethod('financas/contapagar/', 'LancarPagamento', [data]);
    }
}
exports.OmieApi = OmieApi;
//# sourceMappingURL=OmieApi.js.map