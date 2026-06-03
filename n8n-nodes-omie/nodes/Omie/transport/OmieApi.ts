import axios, { AxiosInstance } from 'axios';
import https from 'https';
import {
    IDataObject,
    IExecuteFunctions,
    NodeApiError,
} from 'n8n-workflow';

export class OmieApi {
    private readonly client: AxiosInstance;

    public constructor(
        private readonly baseUrl: string,
        private readonly appKey: string,
        private readonly appSecret: string,
        private readonly functions: IExecuteFunctions,
        ignoreSslIssues: boolean,
    ) {
        const normalizedBaseUrl = OmieApi.normalizeBaseUrl(baseUrl);
        const httpsAgent = new https.Agent({
            rejectUnauthorized: !ignoreSslIssues,
        });

        this.client = axios.create({
            baseURL: normalizedBaseUrl,
            httpsAgent,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    public static normalizeBaseUrl(url: string): string {
        const trimmed = url.trim();
        if (!trimmed.endsWith('/')) {
            return `${trimmed}/`;
        }
        return trimmed;
    }

    public static createInstance(credentials: IDataObject, functions: IExecuteFunctions): OmieApi {
        const baseUrl = `${(credentials.apiBaseUrl as string) ?? 'https://app.omie.com.br/api/v1/'}`.trim();
        return new OmieApi(
            baseUrl,
            `${credentials.appKey as string}`.trim(),
            `${credentials.appSecret as string}`.trim(),
            functions,
            Boolean(credentials.ignoreSslIssues),
        );
    }

    private toNodeApiError(error: unknown): NodeApiError {
        return new NodeApiError(this.functions.getNode(), error as any);
    }

    private async callMethod<T>(endpoint: string, method: string, param: IDataObject[]): Promise<T> {
        try {
            const response = await this.client.post<T>(endpoint, {
                call: method,
                app_key: this.appKey,
                app_secret: this.appSecret,
                param,
            });
            return response.data;
        } catch (error) {
            throw this.toNodeApiError(error);
        }
    }

    private getListResponse<T extends IDataObject>(response: IDataObject, keys: string[]): T[] {
        for (const key of keys) {
            if (Array.isArray(response?.[key])) {
                return response[key] as T[];
            }
        }
        return [];
    }

    private getNumberResponseField(response: IDataObject, keys: string[]): number | undefined {
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

    private async listPaginated(
        endpoint: string,
        method: string,
        params: IDataObject,
        responseKeys: string[],
        maxItems = 0,
    ): Promise<IDataObject[]> {
        const allItems: IDataObject[] = [];
        const pageSize = Number(params.registros_por_pagina ?? 50);
        let currentPage = Number(params.pagina ?? 1);

        while (true) {
            const response = await this.callMethod<IDataObject>(endpoint, method, [{
                ...params,
                pagina: currentPage,
            }]);
            const pageItems = this.getListResponse<IDataObject>(response, responseKeys);
            const remainingItems = maxItems > 0 ? maxItems - allItems.length : undefined;

            if (remainingItems !== undefined && remainingItems <= 0) {
                break;
            }

            allItems.push(...(
                remainingItems !== undefined
                    ? pageItems.slice(0, remainingItems)
                    : pageItems
            ));

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

    public async listAccountsPayable(params: IDataObject, returnAll = false, maxItems = 0): Promise<IDataObject[]> {
        if (returnAll) {
            return this.listPaginated('financas/contapagar/', 'ListarContasPagar', params, ['conta_pagar_cadastro'], maxItems);
        }
        const response = await this.callMethod<IDataObject>('financas/contapagar/', 'ListarContasPagar', [params]);
        return this.getListResponse<IDataObject>(response, ['conta_pagar_cadastro']);
    }

    public async getAccountPayable(params: IDataObject): Promise<IDataObject> {
        return this.callMethod<IDataObject>('financas/contapagar/', 'ConsultarContaPagar', [params]);
    }

    public async settleAccountPayable(data: IDataObject): Promise<IDataObject> {
        return this.callMethod<IDataObject>('financas/contapagar/', 'LancarPagamento', [data]);
    }

    public async listSuppliers(params: IDataObject, returnAll = false, maxItems = 0): Promise<IDataObject[]> {
        if (returnAll) {
            return this.listPaginated('geral/clientes/', 'ListarClientes', params, ['clientes_cadastro'], maxItems);
        }
        const response = await this.callMethod<IDataObject>('geral/clientes/', 'ListarClientes', [params]);
        return this.getListResponse<IDataObject>(response, ['clientes_cadastro']);
    }

    public async updateSupplier(data: IDataObject): Promise<IDataObject> {
        return this.callMethod<IDataObject>('geral/clientes/', 'AlterarCliente', [data]);
    }

    public async listItems(params: IDataObject, returnAll = false, maxItems = 0): Promise<IDataObject[]> {
        if (returnAll) {
            return this.listPaginated(
                'produtos-servicos/',
                'ListarProdutosServicos',
                params,
                ['produtos_servicos_cadastro', 'produtos_servicos'],
                maxItems,
            );
        }
        const response = await this.callMethod<IDataObject>('produtos-servicos/', 'ListarProdutosServicos', [params]);
        return this.getListResponse<IDataObject>(response, ['produtos_servicos_cadastro', 'produtos_servicos']);
    }

    public async updateItem(data: IDataObject): Promise<IDataObject> {
        return this.callMethod<IDataObject>('produtos-servicos/', 'AlterarProdutoServico', [data]);
    }

    public async listPayments(params: IDataObject, returnAll = false, maxItems = 0): Promise<IDataObject[]> {
        if (returnAll) {
            return this.listPaginated('financas/contapagar/', 'ListarContasPagar', params, ['conta_pagar_cadastro'], maxItems);
        }
        const response = await this.callMethod<IDataObject>('financas/contapagar/', 'ListarContasPagar', [params]);
        return this.getListResponse<IDataObject>(response, ['conta_pagar_cadastro']);
    }

    public async settlePayment(data: IDataObject): Promise<IDataObject> {
        return this.callMethod<IDataObject>('financas/contapagar/', 'LancarPagamento', [data]);
    }
}
