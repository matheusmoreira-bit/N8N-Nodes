"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagCorpApi = void 0;
const axios_1 = __importDefault(require("axios"));
const crypto_1 = __importDefault(require("crypto"));
const https_1 = __importDefault(require("https"));
const n8n_workflow_1 = require("n8n-workflow");
class PagCorpApi {
    constructor(baseUrl, clientAuthBaseUrl, clientKey, clientSecret, loginEmail, loginPassword, aesKeyBase64, hmacKeyBase64, functions, ignoreSslIssues) {
        this.baseUrl = baseUrl;
        this.clientAuthBaseUrl = clientAuthBaseUrl;
        this.clientKey = clientKey;
        this.clientSecret = clientSecret;
        this.loginEmail = loginEmail;
        this.loginPassword = loginPassword;
        this.aesKeyBase64 = aesKeyBase64;
        this.hmacKeyBase64 = hmacKeyBase64;
        this.functions = functions;
        const httpsAgent = new https_1.default.Agent({
            rejectUnauthorized: !ignoreSslIssues,
        });
        this.client = axios_1.default.create({
            baseURL: baseUrl,
            httpsAgent,
        });
        this.clientAuthClient = axios_1.default.create({
            baseURL: clientAuthBaseUrl,
            httpsAgent,
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
        var _a;
        const baseUrl = PagCorpApi.normalizeBaseUrl(credentials.apiBaseUrl);
        const rawClientAuthBaseUrl = `${(_a = credentials.clientAuthBaseUrl) !== null && _a !== void 0 ? _a : ''}`.trim();
        const clientAuthBaseUrl = rawClientAuthBaseUrl.length > 0
            ? PagCorpApi.normalizeBaseUrl(rawClientAuthBaseUrl)
            : baseUrl;
        return new PagCorpApi(baseUrl, clientAuthBaseUrl, `${credentials.clientKey}`.trim(), `${credentials.clientSecret}`.trim(), `${credentials.loginEmail}`.trim(), `${credentials.loginPassword}`, `${credentials.aesKeyBase64}`.trim(), `${credentials.hmacKeyBase64}`.trim(), functions, Boolean(credentials.ignoreSslIssues));
    }
    toNodeApiError(error) {
        return new n8n_workflow_1.NodeApiError(this.functions.getNode(), error);
    }
    decodeJwtPayload(token) {
        const parts = token.split('.');
        if (parts.length < 2) {
            throw new Error('Token JWT inválido retornado por Authentication/Client.');
        }
        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }
        const payload = Buffer.from(base64, 'base64').toString('utf8');
        return JSON.parse(payload);
    }
    encryptPassword(ivBase64) {
        const aesKey = Buffer.from(this.aesKeyBase64, 'base64');
        const hmacKey = Buffer.from(this.hmacKeyBase64, 'base64');
        const iv = Buffer.from(ivBase64, 'base64');
        const cipher = crypto_1.default.createCipheriv('aes-256-gcm', aesKey, iv, { authTagLength: 16 });
        let ciphertext = cipher.update(this.loginPassword, 'utf8');
        ciphertext = Buffer.concat([ciphertext, cipher.final()]);
        const tag = cipher.getAuthTag();
        const payload = Buffer.concat([iv, ciphertext, tag]);
        const hmac = crypto_1.default.createHmac('sha256', hmacKey);
        hmac.update(payload);
        const hmacValue = hmac.digest();
        return Buffer.concat([payload, hmacValue]).toString('base64');
    }
    async getClientToken() {
        var _a;
        try {
            const response = await this.clientAuthClient.post('Authentication/Client', {
                clientKey: this.clientKey,
                clientSecret: this.clientSecret,
            });
            if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.token)) {
                throw new Error('Token não retornado em Authentication/Client.');
            }
            return response.data.token;
        }
        catch (error) {
            throw this.toNodeApiError(error);
        }
    }
    async getApiToken(clientToken) {
        var _a;
        try {
            const jwtPayload = this.decodeJwtPayload(clientToken);
            if (!jwtPayload.iv) {
                throw new Error('Campo iv não encontrado no payload JWT.');
            }
            const encryptedPassword = this.encryptPassword(jwtPayload.iv);
            const response = await this.client.post('Authentication/Login', {
                login: this.loginEmail,
                password: encryptedPassword,
            }, {
                headers: {
                    Authorization: `Bearer ${clientToken}`,
                },
            });
            if (!((_a = response.data) === null || _a === void 0 ? void 0 : _a.token)) {
                throw new Error('Token não retornado em Authentication/Login.');
            }
            return response.data.token;
        }
        catch (error) {
            throw this.toNodeApiError(error);
        }
    }
    async getExpensesByAccount(options) {
        var _a, _b;
        const clientToken = await this.getClientToken();
        const apiToken = await this.getApiToken(clientToken);
        const allItems = [];
        let page = 1;
        let pagesFetched = 0;
        while (true) {
            try {
                const response = await this.client.get(`Expense/Account/${encodeURIComponent(options.accountId)}`, {
                    params: {
                        startDate: options.startDate,
                        endDate: options.endDate,
                        page,
                    },
                    headers: {
                        Authorization: `Bearer ${apiToken}`,
                    },
                });
                const items = Array.isArray((_a = response.data) === null || _a === void 0 ? void 0 : _a.items) ? response.data.items : [];
                pagesFetched += 1;
                if (items.length === 0) {
                    break;
                }
                allItems.push(...items);
                if (typeof ((_b = response.data) === null || _b === void 0 ? void 0 : _b.currentPage) === 'number') {
                    page = response.data.currentPage + 1;
                }
                else {
                    page += 1;
                }
                if (pagesFetched > 10000) {
                    throw new Error('Limite de paginação excedido (mais de 10000 páginas).');
                }
            }
            catch (error) {
                throw this.toNodeApiError(error);
            }
        }
        return {
            items: allItems,
            pagesFetched,
        };
    }
}
exports.PagCorpApi = PagCorpApi;
