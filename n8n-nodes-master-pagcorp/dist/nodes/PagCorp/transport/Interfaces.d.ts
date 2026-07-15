import { IDataObject } from 'n8n-workflow';
export interface IClientAuthResponse extends IDataObject {
    token?: string;
}
export interface ILoginResponse extends IDataObject {
    token?: string;
}
export interface IExpensesResponse extends IDataObject {
    items?: IDataObject[];
    currentPage?: number;
}
export interface IGetExpensesOptions {
    accountId: string;
    startDate: string;
    endDate: string;
}
export interface IGetExpensesResult {
    items: IDataObject[];
    pagesFetched: number;
}
export interface IUploadCnabOptions {
    endpointPath: string;
    requestFormat: 'multipart' | 'raw';
    fileContent: Buffer;
    fileName: string;
    mimeType: string;
    formFileFieldName: string;
    formFields: IDataObject;
    queryParameters: IDataObject;
}
export interface IListCnabReturnsOptions {
    endpointPath: string;
    queryParameters: IDataObject;
}
export interface IDownloadCnabReturnOptions {
    endpointPath: string;
    returnId: string;
    queryParameters: IDataObject;
}
