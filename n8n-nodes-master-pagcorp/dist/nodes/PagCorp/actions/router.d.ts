import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PagCorpApi } from '../transport/PagCorpApi';
export declare function router(this: IExecuteFunctions, api: PagCorpApi): Promise<INodeExecutionData[]>;
