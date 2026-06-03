import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { OmieApi } from '../../../transport/OmieApi';
export declare function execute(this: IExecuteFunctions, api: OmieApi): Promise<INodeExecutionData[]>;
