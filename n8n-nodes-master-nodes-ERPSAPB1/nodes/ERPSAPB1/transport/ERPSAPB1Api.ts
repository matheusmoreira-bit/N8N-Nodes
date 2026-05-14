import axios, { AxiosInstance, Method } from 'axios';
import FormData from 'form-data';
import https from 'https';
import {
    IDataObject,
    IExecuteFunctions,
    NodeApiError,
} from 'n8n-workflow';

import {
    IAttachment,
    IBlanketAgreement,
    IBlanketAgreementFilters,
    IBlanketAgreementOptions,
    ICreatedJournalEntry,
    IBPFiscalTaxID,
    IBPFiscalTaxIDCollection,
    ICostCenterType,
    ICostCenterTypeFilters,
    ICostCenterTypeOptions,
    IDimension,
    IDimensionFilters,
    IDimensionOptions,
    IDistributionRule,
    IDistributionRuleFilters,
    IDistributionRuleOptions,
    IDocument,
    IItem,
    IItemFilters,
    IItemGroup,
    IItemGroupFilters,
    IItemGroupOptions,
    IItemOptions,
    IProfitCenter,
    IProfitCenterFilters,
    IProfitCenterOptions,
    IProject,
    IProjectFilters,
    IProjectOptions,
    IJournalEntry,
    IJournalEntryTemplate,
    IPurchaseDownPayment,
    IPurchaseInvoice,
    IPurchaseOrder,
    IQueryResponse,
    SAPB1DocumentObjectCode,
    ISalesOrder,
    ISAPB1RequestTemplate,
    IVendorPaymentRequest,
} from './Interfaces';
import { applyDigitMask, extractDigitsFromString } from '../utils/text';

interface ILoginResponse extends IDataObject {
    SessionId?: string;
    RouteId?: string;
}

interface IRequestOptions {
    body?: unknown;
    headers?: Record<string, string>;
    qs?: IDataObject;
}

interface IPaginationOptions {
    maxPages?: number;
}

export class ERPSAPB1Api {

    private readonly client: AxiosInstance;

    private sessionCookie?: string;

    public constructor(
        public baseUrl: string,
        private authUser: string,
        private authPass: string,
        private authCompanyDb: string,
        private functions: IExecuteFunctions,
    ) {
        this.client = axios.create({
            baseURL: this.baseUrl,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false,
            }),
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });
    }

    public static createInstance(credentials: IDataObject, functions: IExecuteFunctions): ERPSAPB1Api {
        return new ERPSAPB1Api(
            credentials.baseUrl as string,
            credentials.authUser as string,
            credentials.authPassword as string,
            credentials.authCompanyDb as string,
            functions,
        );
    }

    private async login(): Promise<void> {
        const loginPayload = {
            CompanyDB: this.authCompanyDb,
            UserName: this.authUser,
            Password: this.authPass,
        };
        const loginEndpoints = this.buildLoginEndpoints();

        let lastError: unknown;

        for (const endpoint of loginEndpoints) {
            // Alguns gateways retornam 502 intermitente no primeiro hit; tentamos curto retry.
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const response = await this.client.post<ILoginResponse>(
                        endpoint,
                        loginPayload,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    );

                    const sessionId = response.data?.SessionId;

                    if (!sessionId) {
                        throw new NodeApiError(this.functions.getNode(), {
                            message: 'Token de autenticacao indisponivel.',
                        });
                    }

                    this.sessionCookie = `B1SESSION=${sessionId}`;

                    if (response.data.RouteId) {
                        this.sessionCookie += `; ROUTEID=${response.data.RouteId}`;
                    }

                    return;
                } catch (error) {
                    lastError = error;

                    if (
                        axios.isAxiosError(error)
                        && error.response?.status === 502
                        && attempt < 2
                    ) {
                        await new Promise((resolve) => setTimeout(resolve, 300));
                        continue;
                    }

                    break;
                }
            }
        }

        const details = this.formatAxiosErrorDetail(
            lastError,
            `Login (${loginEndpoints.join(', ')})`,
            {
                CompanyDB: this.authCompanyDb,
                UserName: this.authUser,
                Password: '***',
            },
        );

        throw new NodeApiError(this.functions.getNode(), {
            message: 'Falha ao autenticar no SAP B1.',
            description: details,
        });
    }

    private async ensureAuthenticated(): Promise<void> {
        if (!this.sessionCookie) {
            await this.login();
        }
    }

    private toNodeApiError(error: unknown): NodeApiError {
        return new NodeApiError(this.functions.getNode(), error as any);
    }

    private isUnauthorized(error: unknown): boolean {
        return axios.isAxiosError(error) && error.response?.status === 401;
    }

    private isNotFound(error: unknown): boolean {
        return axios.isAxiosError(error) && error.response?.status === 404;
    }

    private formatAxiosErrorDetail(error: unknown, endpoint: string, payload: unknown): string {
        if (!axios.isAxiosError(error)) {
            return `Erro ao chamar ${endpoint}`;
        }

        const responseData = error.response?.data;
        const responseBody = (() => {
            try {
                return JSON.stringify(responseData);
            } catch {
                return String(responseData);
            }
        })();

        const requestBody = (() => {
            try {
                return JSON.stringify(payload);
            } catch {
                return '[payload nao serializavel]';
            }
        })();

        return `Erro ao chamar ${endpoint}. Status: ${error.response?.status}. Response: ${responseBody}. Payload: ${requestBody}`;
    }

    private normalizeEndpoint(endpoint: string): string {
        return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    }

    private buildPurchaseOrderEndpoints(): string[] {
        const normalizedBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
        const baseUrl = new URL(normalizedBaseUrl);
        const baseOrigin = baseUrl.origin;
        const basePath = baseUrl.pathname.toLowerCase();

        // Se a base já está em /b1s/v2 ou /b1s/v1, use o endpoint relativo primeiro.
        if (basePath.includes('/b1s/v2/')) {
            return [
                '/PurchaseOrders',
                `${baseOrigin}/b1s/v1/PurchaseOrders`,
            ];
        }

        if (basePath.includes('/b1s/v1/')) {
            return [
                '/PurchaseOrders',
                `${baseOrigin}/b1s/v2/PurchaseOrders`,
            ];
        }

        // Base sem versionamento explícito: tenta v2, v1 e relativo.
        return [
            `${baseOrigin}/b1s/v2/PurchaseOrders`,
            `${baseOrigin}/b1s/v1/PurchaseOrders`,
            '/PurchaseOrders',
        ];
    }

    private buildLoginEndpoints(): string[] {
        const normalizedBaseUrl = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
        const baseUrl = new URL(normalizedBaseUrl);
        const baseOrigin = baseUrl.origin;
        const basePath = baseUrl.pathname.toLowerCase();

        // Se a base já está em /b1s/v2 ou /b1s/v1, tentamos o relativo e a outra versão.
        if (basePath.includes('/b1s/v2/')) {
            return [
                '/Login',
                `${baseOrigin}/b1s/v1/Login`,
            ];
        }

        if (basePath.includes('/b1s/v1/')) {
            return [
                '/Login',
                `${baseOrigin}/b1s/v2/Login`,
            ];
        }

        // Base sem versionamento explícito: tenta v2, v1 e relativo.
        return [
            `${baseOrigin}/b1s/v2/Login`,
            `${baseOrigin}/b1s/v1/Login`,
            '/Login',
        ];
    }

    private async send<T>(method: Method, endpoint: string, options: IRequestOptions = {}): Promise<T> {
        await this.ensureAuthenticated();

        const request = async (): Promise<T> => {
            const response = await this.client.request<T>({
                url: this.normalizeEndpoint(endpoint),
                method,
                params: options.qs,
                data: options.body,
                headers: {
                    Cookie: this.sessionCookie,
                    ...options.headers,
                },
            });

            return response.data;
        };

        try {
            return await request();
        } catch (error) {
            if (this.isUnauthorized(error)) {
                this.sessionCookie = undefined;
                await this.ensureAuthenticated();
                return await request();
            }

            throw this.toNodeApiError(error);
        }
    }

    private async patch(endpoint: string, body: Partial<IDocument>): Promise<void> {
        await this.send('PATCH', endpoint, {
            body,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    private async patchRaw(endpoint: string, body: IDataObject): Promise<void> {
        await this.send('PATCH', endpoint, {
            body,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    private static parseODataFilters<T extends IDataObject>(filters: T): string {
        return Object.entries(filters)
            .filter(([, value]) => value !== undefined)
            .map(([key, value]) => {
                if (typeof value === 'string') {
                    return `${key} eq '${value}'`;
                }

                if (typeof value === 'boolean') {
                    return `${key} eq '${value ? 'tYES' : 'tNO'}'`;
                }

                return `${key} eq ${value}`;
            })
            .join(' and ');
    }

    private static buildFilterFromMap<T, F extends IDataObject>(
        mapper: T,
        mapperKeys: Array<keyof T>,
        filterKeys: Array<keyof F>,
    ): Partial<F> {
        if (mapperKeys.length !== filterKeys.length) {
            throw new Error('As listas de chaves de filtros e de mapeamento devem ter o mesmo tamanho.');
        }

        const mapperRecord = mapper as Record<string, unknown>;
        const filter: Partial<F> = {};

        for (let index = 0; index < mapperKeys.length; index++) {
            const mapperKey = String(mapperKeys[index]);
            const filterKey = filterKeys[index];
            const value = mapperRecord[mapperKey];

            if (value !== undefined) {
                filter[filterKey] = value as F[keyof F];
            }
        }

        return filter;
    }

    private static buildODataTemplate<F extends IDataObject>({
        select,
        expand,
        filters,
        orderBy,
    }: ISAPB1RequestTemplate<F>): IDataObject {
        const template: IDataObject = {};

        if (select?.length) {
            template.$select = select.join(',');
        }

        if (expand) {
            template.$expand = expand;
        }

        if (filters && Object.keys(filters).length > 0) {
            template.$filter = ERPSAPB1Api.parseODataFilters(filters);
        }

        if (orderBy) {
            template.$orderby = orderBy;
        }

        return template;
    }

    private static pickObjectFields<T extends IDataObject>(data: T, fields?: string[]): T {
        if (!fields?.length) {
            return data;
        }

        const pickedObject = Object.fromEntries(
            fields
                .filter((field) => field in data)
                .map((field) => [field, data[field]]),
        ) as T;

        return pickedObject;
    }

    private static pickSupplierFields(
        supplier: IDataObject,
        selectFields?: string[],
    ): IDataObject {
        if (!selectFields?.length) {
            return supplier;
        }

        return ERPSAPB1Api.pickObjectFields(supplier, selectFields);
    }

    private static normalizeODataNextLink(nextLinkValue?: string): string | undefined {
        if (!nextLinkValue) {
            return undefined;
        }

        let normalized = nextLinkValue.trim();

        // Service Layer pode retornar nextLink absoluto; converte para caminho relativo.
        if (/^https?:\/\//i.test(normalized)) {
            try {
                const parsedUrl = new URL(normalized);
                normalized = `${parsedUrl.pathname}${parsedUrl.search}`;
            } catch {
                // Se não for URL válida, segue com o valor original.
            }
        }

        if (!normalized.startsWith('/')) {
            normalized = `/${normalized}`;
        }

        const serviceLayerPrefixes = ['/b1s/v1', '/b1s/v2'];
        for (const prefix of serviceLayerPrefixes) {
            if (normalized.startsWith(`${prefix}/`)) {
                return normalized.slice(prefix.length);
            }
        }

        return normalized;
    }

    private async useFullPagination<T extends IDataObject>(
        endpoint: string,
        requestOptions?: IDataObject,
        paginatedItems: T[] = [],
        options: IPaginationOptions = {},
        currentPage = 1,
    ): Promise<T[]> {
        const response = await this.send<IQueryResponse<T>>('GET', endpoint, {
            qs: requestOptions,
        });

        const items = response.value ?? [];
        const nextLinkValue = (
            response['odata.nextLink']
            ?? response['@odata.nextLink']
            ?? response['odata.nextlink']
            ?? response['@odata.nextlink']
        ) as string | undefined;
        const nextLink = ERPSAPB1Api.normalizeODataNextLink(nextLinkValue);
        const mergedItems = [...paginatedItems, ...items];

        if (options.maxPages && currentPage >= options.maxPages) {
            return mergedItems;
        }

        if (!nextLink) {
            return mergedItems;
        }

        return this.useFullPagination(nextLink, undefined, mergedItems, options, currentPage + 1);
    }

    private async getByDocNum<T extends IDataObject & { DocNum: number }>(
        endpoint: string,
        docNum: number,
    ): Promise<T | undefined> {
        const response = await this.send<IQueryResponse<T>>('GET', endpoint, {
            qs: {
                $filter: `DocNum eq ${docNum}`,
                $orderby: 'DocEntry desc',
            },
        });

        return response.value?.find((item) => item.DocNum === docNum);
    }

    public async listBlanketAgreements(
        filters: IBlanketAgreementOptions,
        maxPages?: number,
        selectFields?: string[],
    ): Promise<IBlanketAgreement[]> {
        const blanketAgreementFilters = ERPSAPB1Api.buildFilterFromMap<IBlanketAgreementOptions, IBlanketAgreementFilters>(
            filters,
            ['code', 'status', 'bpCode', 'projectCode'],
            ['AgreementNo', 'Status', 'BPCode', 'Project'],
        );

        return this.useFullPagination<IBlanketAgreement>(
            '/BlanketAgreements',
            ERPSAPB1Api.buildODataTemplate({
                select: selectFields,
                filters: blanketAgreementFilters,
                orderBy: 'SigningDate desc',
            }),
            [],
            { maxPages },
        );
    }

    public async getPurchaseDownPaymentByDocNum(docNum: number): Promise<IPurchaseDownPayment | undefined> {
        return this.getByDocNum<IPurchaseDownPayment>('/PurchaseDownPayments', docNum);
    }

    public async getPurchaseInvoiceByDocNum(docNum: number): Promise<IPurchaseInvoice | undefined> {
        return this.getByDocNum<IPurchaseInvoice>('/PurchaseInvoices', docNum);
    }

    public async updateDraft(docEntry: number, document: Partial<IDocument>): Promise<void> {
        await this.patch(`/Drafts(${docEntry})`, document);
    }

    public async updatePurchaseInvoice(docEntry: number, document: Partial<IDocument>): Promise<void> {
        await this.patch(`/PurchaseInvoices(${docEntry})`, document);
    }

    public async createPurchaseOrder(document: Partial<IDocument>): Promise<IPurchaseOrder> {
        await this.ensureAuthenticated();

        const endpoints = this.buildPurchaseOrderEndpoints();
        let lastError: unknown;

        const executeRequest = async (url: string): Promise<IPurchaseOrder> => {
            const response = await this.client.request<IPurchaseOrder>({
                url,
                method: 'POST',
                data: document,
                headers: {
                    Cookie: this.sessionCookie,
                    'Content-Type': 'application/json',
                },
            });

            return response.data;
        };

        for (const endpoint of endpoints) {
            try {
                return await executeRequest(endpoint);
            } catch (error) {
                if (this.isUnauthorized(error)) {
                    this.sessionCookie = undefined;
                    await this.ensureAuthenticated();
                    try {
                        return await executeRequest(endpoint);
                    } catch (retryError) {
                        if (this.isNotFound(retryError)) {
                            lastError = retryError;
                            continue;
                        }

                        const detailedError = new Error(
                            this.formatAxiosErrorDetail(retryError, endpoint, document),
                        );
                        throw this.toNodeApiError(detailedError);
                    }
                }

                if (this.isNotFound(error)) {
                    lastError = error;
                    continue;
                }

                const detailedError = new Error(
                    this.formatAxiosErrorDetail(error, endpoint, document),
                );
                throw this.toNodeApiError(detailedError);
            }
        }

        throw this.toNodeApiError(lastError ?? new Error('Endpoint de PurchaseOrders nao encontrado no Service Layer.'));
    }

    public async createJournalEntry(template: Partial<IJournalEntryTemplate>): Promise<ICreatedJournalEntry> {
        const journalEntry = await this.send<IJournalEntry>('POST', '/JournalEntries', {
            body: template,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return {
            ExternalId: JSON.stringify({
                Number: journalEntry.Number,
                DocDate: journalEntry.ReferenceDate,
                DocObjectCode: SAPB1DocumentObjectCode.JournalEntry,
            }),
            ...journalEntry,
        };
    }

    public async createVendorPayment(payload: IVendorPaymentRequest): Promise<IDataObject> {
        return this.send<IDataObject>('POST', '/VendorPayments', {
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    public async listCurrencyCodes(): Promise<string[]> {
        const currencies = await this.useFullPagination<IDataObject>('/Currencies');

        const codes = currencies
            .map((currency) => (
                currency.Code
                ?? currency.CurrencyCode
                ?? currency.CurrCode
                ?? currency.ISOCurrencyCode
                ?? currency.Name
            ))
            .filter((code): code is string => typeof code === 'string' && code.trim().length > 0)
            .map((code) => code.trim());

        return Array.from(new Set(codes));
    }

    public async createAttachment(fileName: string, attachment: Buffer): Promise<IAttachment> {
        const formData = new FormData();
        formData.append('files', attachment, fileName);

        return this.send<IAttachment>('POST', '/Attachments2', {
            body: formData,
            headers: formData.getHeaders(),
        });
    }

    public async listAttachments(maxPages?: number, selectFields?: string[]): Promise<IAttachment[]> {
        return this.useFullPagination<IAttachment>(
            '/Attachments2',
            ERPSAPB1Api.buildODataTemplate({
                select: selectFields,
                orderBy: 'AbsoluteEntry desc',
            }),
            [],
            { maxPages },
        );
    }

    public async listSuppliers(filter = '', maxPages?: number, selectFields?: string[]): Promise<IBPFiscalTaxID[]> {
        const normalizedFilter = filter.length > 0 ? ` and (${filter})` : '';
        const supplierOptions: IDataObject = ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
        });
        supplierOptions.$filter = `CardType eq 'cSupplier'${normalizedFilter}`;

        const suppliers = await this.useFullPagination<IDataObject>(
            '/BusinessPartners',
            supplierOptions,
            [],
            { maxPages },
        );

        return suppliers.map((supplier) => ERPSAPB1Api.pickSupplierFields(supplier, selectFields) as IBPFiscalTaxID);
    }

    public async getSupplierByDocument(document: string): Promise<IBPFiscalTaxID | undefined> {
        const digits = extractDigitsFromString(document);
        const documents = [
            digits,
            applyDigitMask(digits, '000.000.000-00'),
            applyDigitMask(digits, '00.000.000/0000-00'),
        ]
            .filter((value): value is string => Boolean(value))
            .map((value) => `'${value}'`);

        const suppliers = await this.listSuppliers(
            documents.map((value) => `FederalTaxID eq ${value}`).join(' or '),
        );

        const firstSupplier = suppliers[0] as IDataObject | undefined;
        if (!firstSupplier) {
            return undefined;
        }

        return {
            BPCode: String(firstSupplier.BPCode ?? firstSupplier.CardCode ?? ''),
            TaxId0: (firstSupplier.TaxId0 as string | null) ?? (firstSupplier.FederalTaxID as string | null) ?? null,
            TaxId4: (firstSupplier.TaxId4 as string | null) ?? (firstSupplier.FederalTaxID as string | null) ?? null,
        };
    }

    public async createSupplier(payload: IDataObject): Promise<IDataObject> {
        return this.send<IDataObject>('POST', '/BusinessPartners', {
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    public async createItem(payload: IDataObject): Promise<IDataObject> {
        return this.send<IDataObject>('POST', '/Items', {
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    public async createItemGroup(payload: IDataObject): Promise<IDataObject> {
        return this.send<IDataObject>('POST', '/ItemGroups', {
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    public async updateSupplierField(cardCode: string, fieldName: string, fieldValue: unknown): Promise<void> {
        const normalizedCardCode = cardCode.replace(/'/g, "''");
        await this.patchRaw(
            `/BusinessPartners('${normalizedCardCode}')`,
            {
                [fieldName]: fieldValue as IDataObject[keyof IDataObject],
            },
        );
    }

    public async updateItemField(itemCode: string, fieldName: string, fieldValue: unknown): Promise<void> {
        await this.updateItemFields(itemCode, {
            [fieldName]: fieldValue as IDataObject[keyof IDataObject],
        });
    }

    public async updateItemFields(itemCode: string, payload: IDataObject): Promise<void> {
        const normalizedItemCode = itemCode.replace(/'/g, "''");
        await this.patchRaw(
            `/Items('${normalizedItemCode}')`,
            payload,
        );
    }

    public async generateNextSupplierCardCode(prefix = 'F', digits = 6): Promise<string> {
        const parseSequence = (value: string): number | undefined => {
            const matcher = new RegExp(`^${prefix}(\\d{${digits},})$`).exec(value);
            if (!matcher) {
                return undefined;
            }

            return Number(matcher[1]);
        };

        const formatCode = (sequence: number): string => `${prefix}${String(sequence).padStart(digits, '0')}`;

        try {
            const latestSupplier = await this.send<IQueryResponse<IDataObject>>('GET', '/BusinessPartners', {
                qs: {
                    $select: 'CardCode',
                    $filter: `CardType eq 'cSupplier' and startswith(CardCode,'${prefix}')`,
                    $orderby: 'CardCode desc',
                    $top: 1,
                },
            });

            const currentCardCode = `${latestSupplier.value?.[0]?.CardCode ?? ''}`;
            const sequence = parseSequence(currentCardCode);
            if (sequence === undefined) {
                return formatCode(1);
            }

            return formatCode(sequence + 1);
        } catch {
            const allSuppliers = await this.useFullPagination<IDataObject>('/BusinessPartners', {
                $select: 'CardCode',
                $filter: `CardType eq 'cSupplier'`,
            });

            const sequences = allSuppliers
                .map((supplier) => parseSequence(`${supplier.CardCode ?? ''}`))
                .filter((sequence): sequence is number => sequence !== undefined);

            const maxSequence = sequences.length ? Math.max(...sequences) : 0;
            return formatCode(maxSequence + 1);
        }
    }

    public async listItems(filters: IItemOptions, maxPages?: number, selectFields?: string[]): Promise<IItem[]> {
        const itemFilters = ERPSAPB1Api.buildFilterFromMap<IItemOptions, IItemFilters>(
            filters,
            ['code', 'groupCode', 'name', 'isValid'],
            ['ItemCode', 'ItemsGroupCode', 'ItemName', 'Valid'],
        );

        return this.useFullPagination<IItem>(
            '/Items',
            ERPSAPB1Api.buildODataTemplate({
                select: selectFields,
                filters: itemFilters,
            }),
            [],
            { maxPages },
        );
    }

    public async listItemGroups(filters: IItemGroupOptions, maxPages?: number, selectFields?: string[]): Promise<IItemGroup[]> {
        const itemGroupFilters = ERPSAPB1Api.buildFilterFromMap<IItemGroupOptions, IItemGroupFilters>(
            filters,
            ['code', 'name'],
            ['Number', 'GroupName'],
        );

        return this.useFullPagination<IItemGroup>(
            '/ItemGroups',
            ERPSAPB1Api.buildODataTemplate({
                select: selectFields,
                filters: itemGroupFilters,
            }),
            [],
            { maxPages },
        );
    }

    public async listDimensions(filters: IDimensionOptions, maxPages?: number, selectFields?: string[]): Promise<IDimension[]> {
        const dimensionFilters = ERPSAPB1Api.buildFilterFromMap<IDimensionOptions, IDimensionFilters>(
            filters,
            ['code', 'isActive', 'description', 'name'],
            ['DimensionCode', 'IsActive', 'DimensionDescription', 'DimensionName'],
        );

        return this.useFullPagination<IDimension>(
            '/Dimensions',
            ERPSAPB1Api.buildODataTemplate({
                select: selectFields,
                filters: dimensionFilters,
            }),
            [],
            { maxPages },
        );
    }

    public async listDistributionRules(
        filters: IDistributionRuleOptions,
        maxPages?: number,
        selectFields?: string[],
    ): Promise<IDistributionRule[]> {
        const distributionFilters = ERPSAPB1Api.buildFilterFromMap<IDistributionRuleOptions, IDistributionRuleFilters>(
            filters,
            ['code', 'isActive', 'description', 'inWhichDimension'],
            ['FactorCode', 'Active', 'FactorDescription', 'InWhichDimension'],
        );

        return this.useFullPagination<IDistributionRule>(
            '/DistributionRules',
            ERPSAPB1Api.buildODataTemplate({
                select: selectFields,
                filters: distributionFilters,
            }),
            [],
            { maxPages },
        );
    }

    public async listCostCenterTypes(
        filters: ICostCenterTypeOptions,
        maxPages?: number,
        selectFields?: string[],
    ): Promise<ICostCenterType[]> {
        const costCenterTypeFilters = ERPSAPB1Api.buildFilterFromMap<ICostCenterTypeOptions, ICostCenterTypeFilters>(
            filters,
            ['code', 'name'],
            ['CostCenterTypeCode', 'CostCenterTypeName'],
        );

        return this.useFullPagination<ICostCenterType>(
            '/CostCenterTypes',
            ERPSAPB1Api.buildODataTemplate({
                select: selectFields,
                filters: costCenterTypeFilters,
            }),
            [],
            { maxPages },
        );
    }

    public async listProfitCenters(filters: IProfitCenterOptions, maxPages?: number, selectFields?: string[]): Promise<IProfitCenter[]> {
        const profitCenterFilters = ERPSAPB1Api.buildFilterFromMap<IProfitCenterOptions, IProfitCenterFilters>(
            filters,
            ['code', 'name', 'inWhichDimension', 'isActive'],
            ['CenterCode', 'CenterName', 'InWhichDimension', 'Active'],
        );

        return this.useFullPagination<IProfitCenter>(
            '/ProfitCenters',
            ERPSAPB1Api.buildODataTemplate({
                select: selectFields,
                expand: 'CostCenterType',
                filters: profitCenterFilters,
            }),
            [],
            { maxPages },
        );
    }

    public async listProjects(filters: IProjectOptions, maxPages?: number, selectFields?: string[]): Promise<IProject[]> {
        const projectFilters = ERPSAPB1Api.buildFilterFromMap<IProjectOptions, IProjectFilters>(
            filters,
            ['code', 'name', 'isActive'],
            ['Code', 'Name', 'Active'],
        );

        return this.useFullPagination<IProject>(
            '/Projects',
            ERPSAPB1Api.buildODataTemplate({
                select: selectFields,
                filters: projectFilters,
            }),
            [],
            { maxPages },
        );
    }

    public async getSalesOrderByDocNum(docNum: number): Promise<ISalesOrder | undefined> {
        return this.getByDocNum<ISalesOrder>('/Orders', docNum);
    }

    public async genericPaginatedQuery(resource: string, maxPages?: number): Promise<IDataObject[]> {
        return this.useFullPagination<IDataObject>(resource, undefined, [], { maxPages });
    }
}
