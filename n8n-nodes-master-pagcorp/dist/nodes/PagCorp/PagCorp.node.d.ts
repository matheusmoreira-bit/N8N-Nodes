import { IExecuteFunctions, INodeCredentialDescription, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class PagCorp implements INodeType {
    protected static credentials: INodeCredentialDescription[];
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
