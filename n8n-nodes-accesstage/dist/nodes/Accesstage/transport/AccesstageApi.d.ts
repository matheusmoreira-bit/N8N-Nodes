import FormData from 'form-data';
import { IDataObject } from 'n8n-workflow';
export interface AccesstageApiCredentials extends IDataObject {
    baseUrl: string;
    clientId: string;
    clientSecret: string;
}
export declare class AccesstageApiClient {
    private readonly credentials;
    private accessToken?;
    constructor(credentials: AccesstageApiCredentials);
    upload(companyCode: string, form: FormData): Promise<IDataObject>;
    download(fileId: string): Promise<{
        data: Buffer;
        headers: IDataObject;
    }>;
    listFiles(from: string, to: string): Promise<IDataObject | IDataObject[]>;
    private request;
    private getAccessToken;
}
export declare function normalizeBaseUrl(baseUrl: string): string;
