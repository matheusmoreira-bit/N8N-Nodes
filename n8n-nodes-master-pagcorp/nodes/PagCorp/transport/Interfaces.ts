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
