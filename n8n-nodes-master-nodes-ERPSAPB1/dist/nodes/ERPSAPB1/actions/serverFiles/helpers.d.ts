import { IDataObject } from 'n8n-workflow';
export interface ServerFileInfo extends IDataObject {
    name: string;
    path: string;
    relativePath: string;
    type: 'file' | 'directory';
    extension: string;
    size: number;
    createdAt?: string;
    modifiedAt?: string;
    accessedAt?: string;
    birthtimeMs?: number;
    mtimeMs?: number;
}
export interface FileFilters {
    createdFrom?: Date;
    createdTo?: Date;
    fileNameContains?: string;
    fileNameRegex?: string;
    includeDirectories?: boolean;
}
export interface ServerFilesCredentialData extends IDataObject {
    username?: string;
    password?: string;
    domain?: string;
    basePath?: string;
}
export declare function resolveBasePath(nodeBasePath: string, credentialBasePath?: string): string;
export declare function resolveTargetPath(basePath: string, targetPath: string): string;
export declare function listFiles(basePath: string, targetPath: string, recursive: boolean, credentials?: ServerFilesCredentialData): Promise<ServerFileInfo[]>;
export declare function filterFiles(files: ServerFileInfo[], filters: FileFilters): ServerFileInfo[];
export declare function readFileBuffer(basePath: string, filePath: string, credentials?: ServerFilesCredentialData): Promise<{
    absolutePath: string;
    buffer: Buffer;
}>;
export declare function parseDateParameter(value: string, endOfDay?: boolean): Date | undefined;
