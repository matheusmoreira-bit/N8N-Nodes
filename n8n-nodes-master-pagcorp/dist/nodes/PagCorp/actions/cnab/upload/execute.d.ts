import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PagCorpApi } from '../../../transport/PagCorpApi';
export declare function upload(this: IExecuteFunctions, api: PagCorpApi, itemIndex: number): Promise<INodeExecutionData[]>;
