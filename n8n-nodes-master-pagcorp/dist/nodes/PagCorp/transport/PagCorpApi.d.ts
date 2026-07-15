import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { IDownloadCnabReturnOptions, IGetExpensesOptions, IGetExpensesResult, IListCnabReturnsOptions, IUploadCnabOptions } from './Interfaces';
export declare class PagCorpApi {
    private readonly baseUrl;
    private readonly clientAuthBaseUrl;
    private readonly clientKey;
    private readonly clientSecret;
    private readonly loginEmail;
    private readonly loginPassword;
    private readonly aesKeyBase64;
    private readonly hmacKeyBase64;
    private readonly functions;
    private readonly client;
    private readonly clientAuthClient;
    constructor(baseUrl: string, clientAuthBaseUrl: string, clientKey: string, clientSecret: string, loginEmail: string, loginPassword: string, aesKeyBase64: string, hmacKeyBase64: string, functions: IExecuteFunctions, ignoreSslIssues: boolean);
    private static normalizeBaseUrl;
    static createInstance(credentials: IDataObject, functions: IExecuteFunctions): PagCorpApi;
    private toNodeApiError;
    private decodeJwtPayload;
    private encryptPassword;
    private getClientToken;
    private getApiToken;
    private requestRaw;
    private request;
    private normalizeEndpointPath;
    private appendFormField;
    private endpointWithReturnId;
    uploadCnab(options: IUploadCnabOptions): Promise<IDataObject | string>;
    listCnabReturns(options: IListCnabReturnsOptions): Promise<IDataObject | IDataObject[] | string>;
    downloadCnabReturn(options: IDownloadCnabReturnOptions): Promise<{
        data: Buffer;
        headers: IDataObject;
    }>;
    getExpensesByAccount(options: IGetExpensesOptions): Promise<IGetExpensesResult>;
}
