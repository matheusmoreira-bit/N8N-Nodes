import { INodeProperties } from 'n8n-workflow';
import { execute as listExecute } from './list/execute';
import { execute as updateExecute } from './update/execute';
export declare const descriptions: INodeProperties[];
export { listExecute, updateExecute };
