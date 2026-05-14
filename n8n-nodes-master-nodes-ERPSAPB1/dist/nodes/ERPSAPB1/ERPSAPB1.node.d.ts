import { IExecuteFunctions, INodeCredentialDescription, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
export declare class ERPSAPB1 implements INodeType {
    protected static credentials: INodeCredentialDescription[];
    description: INodeTypeDescription;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
