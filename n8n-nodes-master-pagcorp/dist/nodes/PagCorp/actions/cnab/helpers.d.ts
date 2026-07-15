import { IDataObject } from 'n8n-workflow';
export declare function formatLocalDate(date: Date): string;
export declare function toApiDate(value: string | undefined, fallback: () => Date): string;
export declare function parseJsonObject(value: unknown, fieldName: string): IDataObject;
export declare function normalizeResponse(response: unknown): IDataObject;
export declare function normalizeRows(response: unknown): IDataObject[];
export declare function getHeader(headers: IDataObject, name: string): string | undefined;
export declare function fileNameFromContentDisposition(contentDisposition: string | undefined): string;
