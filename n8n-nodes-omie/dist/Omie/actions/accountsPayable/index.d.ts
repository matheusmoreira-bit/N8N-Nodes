import { INodeProperties } from 'n8n-workflow';
import { execute as listExecute } from './list/execute';
import { execute as settleExecute } from './settle/execute';
export declare const descriptions: INodeProperties[];
export { listExecute, settleExecute };
