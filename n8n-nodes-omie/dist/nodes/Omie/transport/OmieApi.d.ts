import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
export declare class OmieApi {
    private readonly baseUrl;
    private readonly appKey;
    private readonly appSecret;
    private readonly functions;
    private readonly client;
    constructor(baseUrl: string, appKey: string, appSecret: string, functions: IExecuteFunctions, ignoreSslIssues: boolean);
    static normalizeBaseUrl(url: string): string;
    static createInstance(credentials: IDataObject, functions: IExecuteFunctions): OmieApi;
    private toNodeApiError;
    private callMethod;
    private getListResponse;
    private getNumberResponseField;
    private listPaginated;
    listAccountsPayable(params: IDataObject, returnAll?: boolean, maxItems?: number): Promise<IDataObject[]>;
    getAccountPayable(params: IDataObject): Promise<IDataObject>;
    settleAccountPayable(data: IDataObject): Promise<IDataObject>;
    listSuppliers(params: IDataObject, returnAll?: boolean, maxItems?: number): Promise<IDataObject[]>;
    updateSupplier(data: IDataObject): Promise<IDataObject>;
    listItems(params: IDataObject, returnAll?: boolean, maxItems?: number): Promise<IDataObject[]>;
    updateItem(data: IDataObject): Promise<IDataObject>;
    listPayments(params: IDataObject, returnAll?: boolean, maxItems?: number): Promise<IDataObject[]>;
    settlePayment(data: IDataObject): Promise<IDataObject>;
}
