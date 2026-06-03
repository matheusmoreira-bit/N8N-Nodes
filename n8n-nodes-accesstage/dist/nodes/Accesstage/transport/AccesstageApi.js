"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccesstageApiClient = void 0;
exports.normalizeBaseUrl = normalizeBaseUrl;
const axios_1 = __importDefault(require("axios"));
class AccesstageApiClient {
    constructor(credentials) {
        this.credentials = credentials;
    }
    async upload(companyCode, form) {
        const response = await this.request({
            method: 'POST',
            url: `/${encodeURIComponent(companyCode)}/upload`,
            data: form,
            headers: form.getHeaders(),
        });
        return response;
    }
    async download(fileId) {
        const response = await this.request({
            method: 'GET',
            url: `/download/${encodeURIComponent(fileId)}`,
            responseType: 'arraybuffer',
        });
        return {
            data: Buffer.from(response),
            headers: {},
        };
    }
    async listFiles(from, to) {
        return await this.request({
            method: 'GET',
            url: '/list/files',
            params: { from, to },
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async request(config) {
        var _a, _b;
        const token = await this.getAccessToken();
        const baseUrl = normalizeBaseUrl(this.credentials.baseUrl);
        try {
            const response = await axios_1.default.request({
                ...config,
                url: `${baseUrl}${(_a = config.url) !== null && _a !== void 0 ? _a : ''}`,
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    ...((_b = config.headers) !== null && _b !== void 0 ? _b : {}),
                },
            });
            return response.data;
        }
        catch (error) {
            throw formatAxiosError(error, 'Falha na chamada da API Accesstage');
        }
    }
    async getAccessToken() {
        var _a, _b, _c;
        if (this.accessToken) {
            return this.accessToken;
        }
        const baseUrl = normalizeBaseUrl(this.credentials.baseUrl);
        const basicToken = Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString('base64');
        const body = new URLSearchParams({ grant_type: 'client_credentials' });
        try {
            const response = await axios_1.default.post(`${baseUrl}/auth`, body.toString(), {
                headers: {
                    Authorization: `Basic ${basicToken}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                },
            });
            const token = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.access_token) !== null && _b !== void 0 ? _b : (_c = response.data) === null || _c === void 0 ? void 0 : _c.token;
            if (!token || typeof token !== 'string') {
                throw new Error('Resposta de autenticação sem access_token.');
            }
            this.accessToken = token;
            return token;
        }
        catch (error) {
            throw formatAxiosError(error, 'Falha na autenticação Accesstage APUS');
        }
    }
}
exports.AccesstageApiClient = AccesstageApiClient;
function normalizeBaseUrl(baseUrl) {
    return baseUrl.trim().replace(/\/+$/, '');
}
function formatAxiosError(error, fallbackMessage) {
    var _a, _b;
    if (axios_1.default.isAxiosError(error)) {
        const axiosError = error;
        const status = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.status;
        const data = (_b = axiosError.response) === null || _b === void 0 ? void 0 : _b.data;
        const responseText = typeof data === 'string' ? data : JSON.stringify(data !== null && data !== void 0 ? data : {});
        const statusText = status ? ` HTTP ${status}.` : '';
        return new Error(`${fallbackMessage}.${statusText} ${responseText}`.trim());
    }
    if (error instanceof Error) {
        return new Error(`${fallbackMessage}: ${error.message}`);
    }
    return new Error(fallbackMessage);
}
