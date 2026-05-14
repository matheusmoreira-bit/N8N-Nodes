import { IDataObject, IExecuteFunctions } from 'n8n-workflow';
import { IGetExpensesOptions, IGetExpensesResult } from './Interfaces';
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
    getExpensesByAccount(options: IGetExpensesOptions): Promise<IGetExpensesResult>;
}
