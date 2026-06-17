import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { IDynamicField } from '../../../transport/Interfaces';
export interface ISupplierCreateInput {
    cardCode?: string;
    cardName: string;
    cnpj?: string;
    email?: string;
    phoneDdd?: string;
    phone?: string;
    addressName?: string;
    street?: string;
    streetType?: string;
    streetNo?: string;
    block?: string;
    buildingFloorRoom?: string;
    city?: string;
    county?: string;
    zipCode?: string;
    state?: string;
    country?: string;
    dynamicFields?: IDynamicField[];
}
export declare function create(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]>;
export declare function createSupplierInSap(this: IExecuteFunctions, api: ERPSAPB1Api, index: number, input: ISupplierCreateInput): Promise<INodeExecutionData[]>;
