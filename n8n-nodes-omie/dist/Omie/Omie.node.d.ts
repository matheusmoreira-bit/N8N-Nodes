import { IExecuteFunctions, INodeCredentialDescription, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class Omie implements INodeType {
    protected static credentials: INodeCredentialDescription[];
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
