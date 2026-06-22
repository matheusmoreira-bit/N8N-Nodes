"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERPSAPB1Api = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const https_1 = __importDefault(require("https"));
const n8n_workflow_1 = require("n8n-workflow");
const Interfaces_1 = require("./Interfaces");
const text_1 = require("../utils/text");
function getFormDataLength(formData) {
    return new Promise((resolve) => {
        formData.getLength((error, length) => {
            resolve(error ? undefined : length);
        });
    });
}
class ERPSAPB1Api {
    constructor(baseUrl, authUser, authPass, authCompanyDb, functions) {
        this.baseUrl = baseUrl;
        this.authUser = authUser;
        this.authPass = authPass;
        this.authCompanyDb = authCompanyDb;
        this.functions = functions;
        this.client = axios_1.default.create({
            baseURL: this.baseUrl,
            httpsAgent: new https_1.default.Agent({
                rejectUnauthorized: false,
            }),
            maxBodyLength: Infinity,
            maxContentLength: Infinity,
        });
    }
    static createInstance(credentials, functions) {
        return new ERPSAPB1Api(credentials.baseUrl, credentials.authUser, credentials.authPassword, credentials.authCompanyDb, functions);
    }
    async login() {
        var _a, _b;
        const loginPayload = {
            CompanyDB: this.authCompanyDb,
            UserName: this.authUser,
            Password: this.authPass,
        };
        const loginEndpoints = this.buildLoginEndpoints();
        let lastError;
        for (const endpoint of loginEndpoints) {
            // Alguns gateways retornam 502 intermitente no primeiro hit; tentamos curto retry.
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const response = await this.client.post(endpoint, loginPayload, {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    });
                    const sessionId = (_a = response.data) === null || _a === void 0 ? void 0 : _a.SessionId;
                    if (!sessionId) {
                        throw new n8n_workflow_1.NodeApiError(this.functions.getNode(), {
                            message: 'Token de autenticacao indisponivel.',
                        });
                    }
                    this.sessionCookie = `B1SESSION=${sessionId}`;
                    if (response.data.RouteId) {
                        this.sessionCookie += `; ROUTEID=${response.data.RouteId}`;
                    }
                    return;
                }
                catch (error) {
                    lastError = error;
                    if (axios_1.default.isAxiosError(error)
                        && ((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) === 502
                        && attempt < 2) {
                        await new Promise((resolve) => setTimeout(resolve, 300));
                        continue;
                    }
                    break;
                }
            }
        }
        const details = this.formatAxiosErrorDetail(lastError, `Login (${loginEndpoints.join(', ')})`, {
            CompanyDB: this.authCompanyDb,
            UserName: this.authUser,
            Password: '***',
        });
        throw new n8n_workflow_1.NodeApiError(this.functions.getNode(), {
            message: 'Falha ao autenticar no SAP B1.',
            description: details,
        });
    }
    async ensureAuthenticated() {
        if (!this.sessionCookie) {
            await this.login();
        }
    }
    toNodeApiError(error) {
        return new n8n_workflow_1.NodeApiError(this.functions.getNode(), error);
    }
    isUnauthorized(error) {
        var _a;
        return axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 401;
    }
    isNotFound(error) {
        var _a;
        return axios_1.default.isAxiosError(error) && ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) === 404;
    }
    formatAxiosErrorDetail(error, endpoint, payload) {
        var _a, _b;
        if (!axios_1.default.isAxiosError(error)) {
            return `Erro ao chamar ${endpoint}`;
        }
        const responseData = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data;
        const responseBody = (() => {
            try {
                return JSON.stringify(responseData);
            }
            catch {
                return String(responseData);
            }
        })();
        const requestBody = (() => {
            try {
                return JSON.stringify(payload);
            }
            catch {
                return '[payload nao serializavel]';
            }
        })();
        return `Erro ao chamar ${endpoint}. Status: ${(_b = error.response) === null || _b === void 0 ? void 0 : _b.status}. Response: ${responseBody}. Payload: ${requestBody}`;
    }
    normalizeEndpoint(endpoint) {
        if (/^https?:\/\//i.test(endpoint)) {
            return endpoint;
        }
        return endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    }
    buildPurchaseOrderEndpoints() {
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
    buildLoginEndpoints() {
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
    async send(method, endpoint, options = {}) {
        await this.ensureAuthenticated();
        const request = async () => {
            const response = await this.client.request({
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
        }
        catch (error) {
            if (this.isUnauthorized(error)) {
                this.sessionCookie = undefined;
                await this.ensureAuthenticated();
                return await request();
            }
            throw this.toNodeApiError(error);
        }
    }
    async patch(endpoint, body) {
        await this.send('PATCH', endpoint, {
            body,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async patchRaw(endpoint, body) {
        await this.send('PATCH', endpoint, {
            body,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    static parseODataFilters(filters) {
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
    static buildFilterFromMap(mapper, mapperKeys, filterKeys) {
        if (mapperKeys.length !== filterKeys.length) {
            throw new Error('As listas de chaves de filtros e de mapeamento devem ter o mesmo tamanho.');
        }
        const mapperRecord = mapper;
        const filter = {};
        for (let index = 0; index < mapperKeys.length; index++) {
            const mapperKey = String(mapperKeys[index]);
            const filterKey = filterKeys[index];
            const value = mapperRecord[mapperKey];
            if (value !== undefined) {
                filter[filterKey] = value;
            }
        }
        return filter;
    }
    static buildODataTemplate({ select, expand, filters, orderBy, }) {
        const template = {};
        if (select === null || select === void 0 ? void 0 : select.length) {
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
    static pickObjectFields(data, fields) {
        if (!(fields === null || fields === void 0 ? void 0 : fields.length)) {
            return data;
        }
        const pickedObject = Object.fromEntries(fields
            .filter((field) => field in data)
            .map((field) => [field, data[field]]));
        return pickedObject;
    }
    static pickSupplierFields(supplier, selectFields) {
        if (!(selectFields === null || selectFields === void 0 ? void 0 : selectFields.length)) {
            return supplier;
        }
        return ERPSAPB1Api.pickObjectFields(supplier, selectFields);
    }
    static normalizeODataNextLink(nextLinkValue) {
        if (!nextLinkValue) {
            return undefined;
        }
        let normalized = nextLinkValue.trim();
        // Service Layer pode retornar nextLink absoluto; converte para caminho relativo.
        if (/^https?:\/\//i.test(normalized)) {
            try {
                const parsedUrl = new URL(normalized);
                normalized = `${parsedUrl.pathname}${parsedUrl.search}`;
            }
            catch {
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
    async useFullPagination(endpoint, requestOptions, paginatedItems = [], options = {}, currentPage = 1) {
        var _a, _b, _c, _d;
        const response = await this.send('GET', endpoint, {
            qs: requestOptions,
        });
        const items = (_a = response.value) !== null && _a !== void 0 ? _a : [];
        const nextLinkValue = ((_d = (_c = (_b = response['odata.nextLink']) !== null && _b !== void 0 ? _b : response['@odata.nextLink']) !== null && _c !== void 0 ? _c : response['odata.nextlink']) !== null && _d !== void 0 ? _d : response['@odata.nextlink']);
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
    async getByDocNum(endpoint, docNum) {
        var _a;
        const response = await this.send('GET', endpoint, {
            qs: {
                $filter: `DocNum eq ${docNum}`,
                $orderby: 'DocEntry desc',
            },
        });
        return (_a = response.value) === null || _a === void 0 ? void 0 : _a.find((item) => item.DocNum === docNum);
    }
    async listBlanketAgreements(filters, maxPages, selectFields) {
        const blanketAgreementFilters = ERPSAPB1Api.buildFilterFromMap(filters, ['code', 'status', 'bpCode', 'projectCode'], ['AgreementNo', 'Status', 'BPCode', 'Project']);
        return this.useFullPagination('/BlanketAgreements', ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
            filters: blanketAgreementFilters,
            orderBy: 'SigningDate desc',
        }), [], { maxPages });
    }
    async getPurchaseDownPaymentByDocNum(docNum) {
        return this.getByDocNum('/PurchaseDownPayments', docNum);
    }
    async getPurchaseInvoiceByDocNum(docNum) {
        return this.getByDocNum('/PurchaseInvoices', docNum);
    }
    async updateDraft(docEntry, document) {
        await this.patch(`/Drafts(${docEntry})`, document);
    }
    async updatePurchaseInvoice(docEntry, document) {
        await this.patch(`/PurchaseInvoices(${docEntry})`, document);
    }
    async createPurchaseOrder(document) {
        await this.ensureAuthenticated();
        const endpoints = this.buildPurchaseOrderEndpoints();
        const notFoundErrors = [];
        const executeRequest = async (url) => {
            const response = await this.client.request({
                url: this.normalizeEndpoint(url),
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
            }
            catch (error) {
                if (this.isUnauthorized(error)) {
                    this.sessionCookie = undefined;
                    await this.ensureAuthenticated();
                    try {
                        return await executeRequest(endpoint);
                    }
                    catch (retryError) {
                        if (this.isNotFound(retryError)) {
                            notFoundErrors.push({ endpoint, error: retryError });
                            continue;
                        }
                        const detailedError = new Error(this.formatAxiosErrorDetail(retryError, endpoint, document));
                        throw this.toNodeApiError(detailedError);
                    }
                }
                if (this.isNotFound(error)) {
                    notFoundErrors.push({ endpoint, error });
                    continue;
                }
                const detailedError = new Error(this.formatAxiosErrorDetail(error, endpoint, document));
                throw this.toNodeApiError(detailedError);
            }
        }
        if (notFoundErrors.length > 0) {
            const details = notFoundErrors
                .map((attempt) => this.formatAxiosErrorDetail(attempt.error, attempt.endpoint, document))
                .join(' | ');
            throw this.toNodeApiError(new Error(`Endpoint de PurchaseOrders nao encontrado no Service Layer. Tentativas: ${details}`));
        }
        throw this.toNodeApiError(new Error('Endpoint de PurchaseOrders nao encontrado no Service Layer.'));
    }
    async createJournalEntry(template) {
        const journalEntry = await this.send('POST', '/JournalEntries', {
            body: template,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        return {
            ExternalId: JSON.stringify({
                Number: journalEntry.Number,
                DocDate: journalEntry.ReferenceDate,
                DocObjectCode: Interfaces_1.SAPB1DocumentObjectCode.JournalEntry,
            }),
            ...journalEntry,
        };
    }
    async createVendorPayment(payload) {
        return this.send('POST', '/VendorPayments', {
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async listCurrencyCodes() {
        const currencies = await this.useFullPagination('/Currencies');
        const codes = currencies
            .map((currency) => {
            var _a, _b, _c, _d;
            return ((_d = (_c = (_b = (_a = currency.Code) !== null && _a !== void 0 ? _a : currency.CurrencyCode) !== null && _b !== void 0 ? _b : currency.CurrCode) !== null && _c !== void 0 ? _c : currency.ISOCurrencyCode) !== null && _d !== void 0 ? _d : currency.Name);
        })
            .filter((code) => typeof code === 'string' && code.trim().length > 0)
            .map((code) => code.trim());
        return Array.from(new Set(codes));
    }
    async createAttachmentFiles(files) {
        await this.ensureAuthenticated();
        const uploadSummary = files.map((file) => ({
            fileName: file.fileName,
            size: file.content.length,
        }));
        const executeRequest = async () => {
            const formData = new form_data_1.default();
            files.forEach((file) => {
                formData.append('files', file.content, {
                    filename: file.fileName,
                    contentType: 'application/octet-stream',
                });
            });
            const contentLength = await getFormDataLength(formData);
            const formHeaders = {
                ...formData.getHeaders(),
            };
            if (contentLength !== undefined) {
                formHeaders['Content-Length'] = contentLength;
            }
            const response = await this.client.request({
                url: '/Attachments2',
                method: 'POST',
                data: formData,
                headers: {
                    Cookie: this.sessionCookie,
                    Accept: 'application/json',
                    ...formHeaders,
                },
                maxBodyLength: Infinity,
                maxContentLength: Infinity,
            });
            return response.data;
        };
        try {
            return await executeRequest();
        }
        catch (error) {
            if (this.isUnauthorized(error)) {
                this.sessionCookie = undefined;
                await this.ensureAuthenticated();
                try {
                    return await executeRequest();
                }
                catch (retryError) {
                    throw this.toNodeApiError(new Error(this.formatAxiosErrorDetail(retryError, '/Attachments2', uploadSummary)));
                }
            }
            throw this.toNodeApiError(new Error(this.formatAxiosErrorDetail(error, '/Attachments2', uploadSummary)));
        }
    }
    async createAttachment(fileName, attachment) {
        return this.createAttachmentFiles([{ fileName, content: attachment }]);
    }
    async listAttachments(maxPages, selectFields) {
        return this.useFullPagination('/Attachments2', ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
            orderBy: 'AbsoluteEntry desc',
        }), [], { maxPages });
    }
    async listSuppliers(filter = '', maxPages, selectFields) {
        const normalizedFilter = filter.length > 0 ? ` and (${filter})` : '';
        const supplierOptions = ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
        });
        supplierOptions.$filter = `CardType eq 'cSupplier'${normalizedFilter}`;
        const suppliers = await this.useFullPagination('/BusinessPartners', supplierOptions, [], { maxPages });
        return suppliers.map((supplier) => ERPSAPB1Api.pickSupplierFields(supplier, selectFields));
    }
    async getSupplierByDocument(document) {
        var _a, _b, _c, _d, _e, _f;
        const digits = (0, text_1.extractDigitsFromString)(document);
        const documents = [
            digits,
            (0, text_1.applyDigitMask)(digits, '000.000.000-00'),
            (0, text_1.applyDigitMask)(digits, '00.000.000/0000-00'),
        ]
            .filter((value) => Boolean(value))
            .map((value) => `'${value}'`);
        const suppliers = await this.listSuppliers(documents.map((value) => `FederalTaxID eq ${value}`).join(' or '));
        const firstSupplier = suppliers[0];
        if (!firstSupplier) {
            return undefined;
        }
        return {
            BPCode: String((_b = (_a = firstSupplier.BPCode) !== null && _a !== void 0 ? _a : firstSupplier.CardCode) !== null && _b !== void 0 ? _b : ''),
            TaxId0: (_d = (_c = firstSupplier.TaxId0) !== null && _c !== void 0 ? _c : firstSupplier.FederalTaxID) !== null && _d !== void 0 ? _d : null,
            TaxId4: (_f = (_e = firstSupplier.TaxId4) !== null && _e !== void 0 ? _e : firstSupplier.FederalTaxID) !== null && _f !== void 0 ? _f : null,
        };
    }
    async createSupplier(payload) {
        return this.send('POST', '/BusinessPartners', {
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async createItem(payload) {
        return this.send('POST', '/Items', {
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async createItemGroup(payload) {
        return this.send('POST', '/ItemGroups', {
            body: payload,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
    async updateSupplierField(cardCode, fieldName, fieldValue) {
        const normalizedCardCode = cardCode.replace(/'/g, "''");
        await this.patchRaw(`/BusinessPartners('${normalizedCardCode}')`, {
            [fieldName]: fieldValue,
        });
    }
    async updateItemField(itemCode, fieldName, fieldValue) {
        await this.updateItemFields(itemCode, {
            [fieldName]: fieldValue,
        });
    }
    async updateItemFields(itemCode, payload) {
        const normalizedItemCode = itemCode.replace(/'/g, "''");
        await this.patchRaw(`/Items('${normalizedItemCode}')`, payload);
    }
    async generateNextSupplierCardCode(prefix = 'F', digits = 6) {
        var _a, _b, _c;
        const parseSequence = (value) => {
            const matcher = new RegExp(`^${prefix}(\\d{${digits},})$`).exec(value);
            if (!matcher) {
                return undefined;
            }
            return Number(matcher[1]);
        };
        const formatCode = (sequence) => `${prefix}${String(sequence).padStart(digits, '0')}`;
        try {
            const latestSupplier = await this.send('GET', '/BusinessPartners', {
                qs: {
                    $select: 'CardCode',
                    $filter: `CardType eq 'cSupplier' and startswith(CardCode,'${prefix}')`,
                    $orderby: 'CardCode desc',
                    $top: 1,
                },
            });
            const currentCardCode = `${(_c = (_b = (_a = latestSupplier.value) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.CardCode) !== null && _c !== void 0 ? _c : ''}`;
            const sequence = parseSequence(currentCardCode);
            if (sequence === undefined) {
                return formatCode(1);
            }
            return formatCode(sequence + 1);
        }
        catch {
            const allSuppliers = await this.useFullPagination('/BusinessPartners', {
                $select: 'CardCode',
                $filter: `CardType eq 'cSupplier'`,
            });
            const sequences = allSuppliers
                .map((supplier) => { var _a; return parseSequence(`${(_a = supplier.CardCode) !== null && _a !== void 0 ? _a : ''}`); })
                .filter((sequence) => sequence !== undefined);
            const maxSequence = sequences.length ? Math.max(...sequences) : 0;
            return formatCode(maxSequence + 1);
        }
    }
    async listItems(filters, maxPages, selectFields) {
        const itemFilters = ERPSAPB1Api.buildFilterFromMap(filters, ['code', 'groupCode', 'name', 'isValid'], ['ItemCode', 'ItemsGroupCode', 'ItemName', 'Valid']);
        return this.useFullPagination('/Items', ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
            filters: itemFilters,
        }), [], { maxPages });
    }
    async listItemGroups(filters, maxPages, selectFields) {
        const itemGroupFilters = ERPSAPB1Api.buildFilterFromMap(filters, ['code', 'name'], ['Number', 'GroupName']);
        return this.useFullPagination('/ItemGroups', ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
            filters: itemGroupFilters,
        }), [], { maxPages });
    }
    async listDimensions(filters, maxPages, selectFields) {
        const dimensionFilters = ERPSAPB1Api.buildFilterFromMap(filters, ['code', 'isActive', 'description', 'name'], ['DimensionCode', 'IsActive', 'DimensionDescription', 'DimensionName']);
        return this.useFullPagination('/Dimensions', ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
            filters: dimensionFilters,
        }), [], { maxPages });
    }
    async listDistributionRules(filters, maxPages, selectFields) {
        const distributionFilters = ERPSAPB1Api.buildFilterFromMap(filters, ['code', 'isActive', 'description', 'inWhichDimension'], ['FactorCode', 'Active', 'FactorDescription', 'InWhichDimension']);
        return this.useFullPagination('/DistributionRules', ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
            filters: distributionFilters,
        }), [], { maxPages });
    }
    async listCostCenterTypes(filters, maxPages, selectFields) {
        const costCenterTypeFilters = ERPSAPB1Api.buildFilterFromMap(filters, ['code', 'name'], ['CostCenterTypeCode', 'CostCenterTypeName']);
        return this.useFullPagination('/CostCenterTypes', ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
            filters: costCenterTypeFilters,
        }), [], { maxPages });
    }
    async listProfitCenters(filters, maxPages, selectFields) {
        const profitCenterFilters = ERPSAPB1Api.buildFilterFromMap(filters, ['code', 'name', 'inWhichDimension', 'isActive'], ['CenterCode', 'CenterName', 'InWhichDimension', 'Active']);
        return this.useFullPagination('/ProfitCenters', ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
            expand: 'CostCenterType',
            filters: profitCenterFilters,
        }), [], { maxPages });
    }
    async listProjects(filters, maxPages, selectFields) {
        const projectFilters = ERPSAPB1Api.buildFilterFromMap(filters, ['code', 'name', 'isActive'], ['Code', 'Name', 'Active']);
        return this.useFullPagination('/Projects', ERPSAPB1Api.buildODataTemplate({
            select: selectFields,
            filters: projectFilters,
        }), [], { maxPages });
    }
    async getSalesOrderByDocNum(docNum) {
        return this.getByDocNum('/Orders', docNum);
    }
    async genericPaginatedQuery(resource, maxPages) {
        return this.useFullPagination(resource, undefined, [], { maxPages });
    }
}
exports.ERPSAPB1Api = ERPSAPB1Api;
