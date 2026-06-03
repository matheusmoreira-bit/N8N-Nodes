import { IDataObject } from 'n8n-workflow';
export interface AccountsPayableFilters {
    baixaBloqueada?: string;
    bloqueado?: string;
    statusTitulo?: string;
    dataVencimentoFrom?: string;
    dataVencimentoTo?: string;
    dataPrevisaoFrom?: string;
    dataPrevisaoTo?: string;
}
export declare function filterAccountsPayableResults(results: IDataObject[], filters: AccountsPayableFilters): IDataObject[];
