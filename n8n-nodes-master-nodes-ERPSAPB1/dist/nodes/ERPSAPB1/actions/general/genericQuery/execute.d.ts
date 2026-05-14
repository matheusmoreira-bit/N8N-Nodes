import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
export declare function genericQuery(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]>;
