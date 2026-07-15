import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { PagCorpApi } from '../../../transport/PagCorpApi';
export declare function downloadReturn(this: IExecuteFunctions, api: PagCorpApi, itemIndex: number): Promise<INodeExecutionData[]>;
