import { IDataObject } from 'n8n-workflow';
export interface UberSftpCredentials extends IDataObject {
    host: string;
    port: number;
    username: string;
    authentication: 'password' | 'privateKey';
    password?: string;
    privateKey?: string;
    passphrase?: string;
    basePath?: string;
}
export interface RemoteFile {
    name: string;
    path: string;
    type: string;
    size: number;
    modifyTime?: number;
    accessTime?: number;
}
export declare class UberSftpClient {
    private readonly credentials;
    private readonly client;
    private connected;
    constructor(credentials: UberSftpCredentials);
    connect(): Promise<void>;
    end(): Promise<void>;
    resolvePath(path: string): string;
    list(path: string, recursive: boolean): Promise<RemoteFile[]>;
    download(path: string): Promise<Buffer>;
    private listResolvedPath;
}
export declare function normalizePath(path: string): string;
