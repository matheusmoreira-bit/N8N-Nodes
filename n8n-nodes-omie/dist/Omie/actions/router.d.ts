import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { OmieApi } from '../transport/OmieApi';
export declare function router(this: IExecuteFunctions, api: OmieApi): Promise<INodeExecutionData[]>;
