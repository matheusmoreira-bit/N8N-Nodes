import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import crypto from 'crypto';
import FormData from 'form-data';
import https from 'https';
import {
    IDataObject,
    IExecuteFunctions,
    NodeApiError,
} from 'n8n-workflow';

import {
    IClientAuthResponse,
    IDownloadCnabReturnOptions,
    IExpensesResponse,
    IGetExpensesOptions,
    IGetExpensesResult,
    IListCnabReturnsOptions,
    ILoginResponse,
    IUploadCnabOptions,
} from './Interfaces';

interface IJwtPayload extends IDataObject {
    iv?: string;
}

export class PagCorpApi {

    private readonly client: AxiosInstance;
    private readonly clientAuthClient: AxiosInstance;

    public constructor(
        private readonly baseUrl: string,
        private readonly clientAuthBaseUrl: string,
        private readonly clientKey: string,
        private readonly clientSecret: string,
        private readonly loginEmail: string,
        private readonly loginPassword: string,
        private readonly aesKeyBase64: string,
        private readonly hmacKeyBase64: string,
        private readonly functions: IExecuteFunctions,
        ignoreSslIssues: boolean,
    ) {
        const httpsAgent = new https.Agent({
            rejectUnauthorized: !ignoreSslIssues,
        });

        this.client = axios.create({
            baseURL: baseUrl,
            httpsAgent,
        });

        this.clientAuthClient = axios.create({
            baseURL: clientAuthBaseUrl,
            httpsAgent,
        });
    }

    private static normalizeBaseUrl(url: string): string {
        const trimmed = url.trim();
        if (!trimmed.endsWith('/')) {
            return `${trimmed}/`;
        }
        return trimmed;
    }

    public static createInstance(credentials: IDataObject, functions: IExecuteFunctions): PagCorpApi {
        const baseUrl = PagCorpApi.normalizeBaseUrl(credentials.apiBaseUrl as string);
        const rawClientAuthBaseUrl = `${credentials.clientAuthBaseUrl ?? ''}`.trim();
        const clientAuthBaseUrl = rawClientAuthBaseUrl.length > 0
            ? PagCorpApi.normalizeBaseUrl(rawClientAuthBaseUrl)
            : baseUrl;

        return new PagCorpApi(
            baseUrl,
            clientAuthBaseUrl,
            `${credentials.clientKey as string}`.trim(),
            `${credentials.clientSecret as string}`.trim(),
            `${credentials.loginEmail as string}`.trim(),
            `${credentials.loginPassword as string}`,
            `${credentials.aesKeyBase64 as string}`.trim(),
            `${credentials.hmacKeyBase64 as string}`.trim(),
            functions,
            Boolean(credentials.ignoreSslIssues),
        );
    }

    private toNodeApiError(error: unknown): NodeApiError {
        return new NodeApiError(this.functions.getNode(), error as any);
    }

    private decodeJwtPayload(token: string): IJwtPayload {
        const parts = token.split('.');
        if (parts.length < 2) {
            throw new Error('Token JWT inválido retornado por Authentication/Client.');
        }

        let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4 !== 0) {
            base64 += '=';
        }

        const payload = Buffer.from(base64, 'base64').toString('utf8');
        return JSON.parse(payload) as IJwtPayload;
    }

    private encryptPassword(ivBase64: string): string {
        const aesKey = Buffer.from(this.aesKeyBase64, 'base64');
        const hmacKey = Buffer.from(this.hmacKeyBase64, 'base64');
        const iv = Buffer.from(ivBase64, 'base64');

        const cipher = crypto.createCipheriv('aes-256-gcm', aesKey, iv, { authTagLength: 16 });
        let ciphertext = cipher.update(this.loginPassword, 'utf8');
        ciphertext = Buffer.concat([ciphertext, cipher.final()]);
        const tag = cipher.getAuthTag();

        const payload = Buffer.concat([iv, ciphertext, tag]);

        const hmac = crypto.createHmac('sha256', hmacKey);
        hmac.update(payload);
        const hmacValue = hmac.digest();

        return Buffer.concat([payload, hmacValue]).toString('base64');
    }

    private async getClientToken(): Promise<string> {
        try {
            const response = await this.clientAuthClient.post<IClientAuthResponse>('Authentication/Client', {
                clientKey: this.clientKey,
                clientSecret: this.clientSecret,
            });

            if (!response.data?.token) {
                throw new Error('Token não retornado em Authentication/Client.');
            }

            return response.data.token;
        } catch (error) {
            throw this.toNodeApiError(error);
        }
    }

    private async getApiToken(clientToken: string): Promise<string> {
        try {
            const jwtPayload = this.decodeJwtPayload(clientToken);
            if (!jwtPayload.iv) {
                throw new Error('Campo iv não encontrado no payload JWT.');
            }

            const encryptedPassword = this.encryptPassword(jwtPayload.iv);

            const response = await this.client.post<ILoginResponse>(
                'Authentication/Login',
                {
                    login: this.loginEmail,
                    password: encryptedPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${clientToken}`,
                    },
                },
            );

            if (!response.data?.token) {
                throw new Error('Token não retornado em Authentication/Login.');
            }

            return response.data.token;
        } catch (error) {
            throw this.toNodeApiError(error);
        }
    }

    private async requestRaw<T>(config: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        const clientToken = await this.getClientToken();
        const apiToken = await this.getApiToken(clientToken);

        try {
            return await this.client.request<T>({
                ...config,
                url: this.normalizeEndpointPath(`${config.url ?? ''}`),
                headers: {
                    Authorization: `Bearer ${apiToken}`,
                    ...(config.headers ?? {}),
                },
            });
        } catch (error) {
            throw this.toNodeApiError(error);
        }
    }

    private async request<T>(config: AxiosRequestConfig): Promise<T> {
        const response = await this.requestRaw<T>(config);
        return response.data;
    }

    private normalizeEndpointPath(path: string): string {
        return path.trim().replace(/^\/+/, '');
    }

    private appendFormField(form: FormData, fieldName: string, value: unknown): void {
        if (value === undefined || value === null) {
            return;
        }

        if (Buffer.isBuffer(value)) {
            form.append(fieldName, value);
            return;
        }

        if (typeof value === 'object') {
            form.append(fieldName, JSON.stringify(value));
            return;
        }

        form.append(fieldName, `${value}`);
    }

    private endpointWithReturnId(endpointPath: string, returnId: string): string {
        if (endpointPath.includes('{returnId}')) {
            return endpointPath.replace(/\{returnId\}/g, encodeURIComponent(returnId));
        }

        return `${endpointPath.replace(/\/+$/, '')}/${encodeURIComponent(returnId)}`;
    }

    public async uploadCnab(options: IUploadCnabOptions): Promise<IDataObject | string> {
        if (options.requestFormat === 'raw') {
            return await this.request<IDataObject | string>({
                method: 'POST',
                url: options.endpointPath,
                params: options.queryParameters,
                data: options.fileContent,
                headers: {
                    'Content-Type': options.mimeType,
                    'Content-Disposition': `attachment; filename="${options.fileName.replace(/"/g, '\\"')}"`,
                },
            });
        }

        const form = new FormData();
        for (const [fieldName, value] of Object.entries(options.formFields)) {
            this.appendFormField(form, fieldName, value);
        }

        form.append(options.formFileFieldName, options.fileContent, {
            filename: options.fileName,
            contentType: options.mimeType,
        });

        return await this.request<IDataObject | string>({
            method: 'POST',
            url: options.endpointPath,
            params: options.queryParameters,
            data: form,
            headers: form.getHeaders(),
        });
    }

    public async listCnabReturns(options: IListCnabReturnsOptions): Promise<IDataObject | IDataObject[] | string> {
        return await this.request<IDataObject | IDataObject[] | string>({
            method: 'GET',
            url: options.endpointPath,
            params: options.queryParameters,
            headers: {
                Accept: 'application/json',
            },
        });
    }

    public async downloadCnabReturn(options: IDownloadCnabReturnOptions): Promise<{ data: Buffer; headers: IDataObject }> {
        const endpointPath = this.endpointWithReturnId(options.endpointPath, options.returnId);
        const response = await this.requestRaw<ArrayBuffer>({
            method: 'GET',
            url: endpointPath,
            params: options.queryParameters,
            responseType: 'arraybuffer',
            headers: {
                Accept: '*/*',
            },
        });

        return {
            data: Buffer.from(response.data),
            headers: response.headers as IDataObject,
        };
    }

    public async getExpensesByAccount(options: IGetExpensesOptions): Promise<IGetExpensesResult> {
        const clientToken = await this.getClientToken();
        const apiToken = await this.getApiToken(clientToken);

        const allItems: IDataObject[] = [];
        let page = 1;
        let pagesFetched = 0;

        while (true) {
            try {
                const response = await this.client.get<IExpensesResponse>(
                    `Expense/Account/${encodeURIComponent(options.accountId)}`,
                    {
                        params: {
                            startDate: options.startDate,
                            endDate: options.endDate,
                            page,
                        },
                        headers: {
                            Authorization: `Bearer ${apiToken}`,
                        },
                    },
                );

                const items = Array.isArray(response.data?.items) ? response.data.items : [];
                pagesFetched += 1;

                if (items.length === 0) {
                    break;
                }

                allItems.push(...items);

                if (typeof response.data?.currentPage === 'number') {
                    page = response.data.currentPage + 1;
                } else {
                    page += 1;
                }

                if (pagesFetched > 10000) {
                    throw new Error('Limite de paginação excedido (mais de 10000 páginas).');
                }
            } catch (error) {
                throw this.toNodeApiError(error);
            }
        }

        return {
            items: allItems,
            pagesFetched,
        };
    }
}
