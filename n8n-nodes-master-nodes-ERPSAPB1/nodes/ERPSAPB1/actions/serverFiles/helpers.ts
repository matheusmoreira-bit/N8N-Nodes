import { promises as fs } from 'fs';
import * as path from 'path';
import { IDataObject } from 'n8n-workflow';

const SMB2 = require('smb2');
const SMB2Forge = require('smb2/lib/tools/smb2-forge');
const SMB2Request = SMB2Forge.request;

const SMB_DIRECTORY_ATTRIBUTE = 0x10;

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

interface ParsedUncPath {
    server: string;
    shareName: string;
    share: string;
    relativePath: string;
    fullPath: string;
}

interface SmbDirectoryEntry {
    Filename: string;
    FileAttributes: number;
    EndofFile?: Buffer;
    CreationTime?: Buffer;
    LastAccessTime?: Buffer;
    LastWriteTime?: Buffer;
}

export function resolveBasePath(nodeBasePath: string, credentialBasePath?: string): string {
    const basePath = nodeBasePath?.trim() || credentialBasePath?.trim();

    if (!basePath) {
        throw new Error('Informe o Caminho Base ou selecione uma credencial SAP B1 Server Files com Caminho Base.');
    }

    return isUncPath(basePath) ? normalizeUncPath(basePath) : path.resolve(basePath);
}

export function resolveTargetPath(basePath: string, targetPath: string): string {
    const rawTargetPath = targetPath?.trim();

    if (!rawTargetPath || rawTargetPath === '.') {
        return basePath;
    }

    if (isUncPath(rawTargetPath)) {
        return normalizeUncPath(rawTargetPath);
    }

    if (isUncPath(basePath)) {
        return normalizeUncPath(`${basePath}\\${rawTargetPath}`);
    }

    if (path.isAbsolute(rawTargetPath)) {
        return path.resolve(rawTargetPath);
    }

    return path.resolve(basePath, rawTargetPath);
}

export async function listFiles(
    basePath: string,
    targetPath: string,
    recursive: boolean,
    credentials?: ServerFilesCredentialData,
): Promise<ServerFileInfo[]> {
    const rootPath = resolveTargetPath(basePath, targetPath);

    if (isUncPath(rootPath)) {
        return await listSmbFiles(basePath, rootPath, recursive, credentials);
    }

    const rootStats = await safeStat(rootPath);

    if (!rootStats.isDirectory()) {
        return [toLocalFileInfo(rootPath, basePath, rootStats)];
    }

    return await listLocalDirectory(rootPath, basePath, recursive);
}

export function filterFiles(files: ServerFileInfo[], filters: FileFilters): ServerFileInfo[] {
    const contains = filters.fileNameContains?.trim().toLowerCase();
    const regex = filters.fileNameRegex?.trim() ? new RegExp(filters.fileNameRegex.trim()) : undefined;

    return files.filter((file) => {
        if (file.type === 'directory' && !filters.includeDirectories) {
            return false;
        }

        if (contains && !file.name.toLowerCase().includes(contains)) {
            return false;
        }

        if (regex && !regex.test(file.name)) {
            return false;
        }

        if ((filters.createdFrom || filters.createdTo) && !file.birthtimeMs) {
            return false;
        }

        if (file.birthtimeMs) {
            const createdAt = new Date(file.birthtimeMs);
            if (filters.createdFrom && createdAt < filters.createdFrom) {
                return false;
            }

            if (filters.createdTo && createdAt > filters.createdTo) {
                return false;
            }
        }

        return true;
    });
}

export async function readFileBuffer(
    basePath: string,
    filePath: string,
    credentials?: ServerFilesCredentialData,
): Promise<{ absolutePath: string; buffer: Buffer }> {
    const absolutePath = resolveTargetPath(basePath, filePath);

    if (isUncPath(absolutePath)) {
        return await readSmbFile(absolutePath, credentials);
    }

    const stats = await safeStat(absolutePath);

    if (!stats.isFile()) {
        throw new Error(`O caminho informado não é um arquivo: ${absolutePath}`);
    }

    return {
        absolutePath,
        buffer: await fs.readFile(absolutePath),
    };
}

export function parseDateParameter(value: string, endOfDay = false): Date | undefined {
    if (!value) {
        return undefined;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return undefined;
    }

    if (endOfDay && value.length <= 10) {
        date.setHours(23, 59, 59, 999);
    }

    return date;
}

async function listLocalDirectory(directoryPath: string, basePath: string, recursive: boolean): Promise<ServerFileInfo[]> {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const results: ServerFileInfo[] = [];

    for (const entry of entries) {
        const absolutePath = path.join(directoryPath, entry.name);
        const stats = await safeStat(absolutePath);
        const info = toLocalFileInfo(absolutePath, basePath, stats);

        results.push(info);

        if (recursive && entry.isDirectory()) {
            results.push(...await listLocalDirectory(absolutePath, basePath, true));
        }
    }

    return results;
}

async function listSmbFiles(
    basePath: string,
    rootPath: string,
    recursive: boolean,
    credentials?: ServerFilesCredentialData,
): Promise<ServerFileInfo[]> {
    const parsedRoot = parseUncPath(rootPath);
    const parsedBase = isUncPath(basePath) ? parseUncPath(basePath) : parsedRoot;
    const client = createSmbClient(parsedRoot, credentials);

    try {
        return await listSmbDirectory(client, parsedRoot, parsedBase.fullPath, parsedRoot.relativePath, recursive);
    } catch (error) {
        throw new Error(`Não foi possível acessar o caminho SMB '${rootPath}': ${formatError(error)}`);
    } finally {
        closeSmbClient(client);
    }
}

async function listSmbDirectory(
    client: any,
    parsedShare: ParsedUncPath,
    basePath: string,
    directoryPath: string,
    recursive: boolean,
): Promise<ServerFileInfo[]> {
    const entries = await smbReaddirDetailed(client, directoryPath);
    const results: ServerFileInfo[] = [];

    for (const entry of entries) {
        if (entry.Filename === '.' || entry.Filename === '..') {
            continue;
        }

        const childRelativePath = joinSmbRelativePath(directoryPath, entry.Filename);
        const absolutePath = buildUncPath(parsedShare.share, childRelativePath);
        const info = toSmbFileInfo(entry, absolutePath, basePath, childRelativePath);

        results.push(info);

        if (recursive && info.type === 'directory') {
            results.push(...await listSmbDirectory(client, parsedShare, basePath, childRelativePath, true));
        }
    }

    return results;
}

async function readSmbFile(absolutePath: string, credentials?: ServerFilesCredentialData): Promise<{ absolutePath: string; buffer: Buffer }> {
    const parsedPath = parseUncPath(absolutePath);
    const client = createSmbClient(parsedPath, credentials);

    try {
        const buffer = await new Promise<Buffer>((resolve, reject) => {
            client.readFile(parsedPath.relativePath, (error: Error | null, data: Buffer) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(Buffer.isBuffer(data) ? data : Buffer.from(data));
            });
        });

        return { absolutePath: parsedPath.fullPath, buffer };
    } catch (error) {
        throw new Error(`Não foi possível baixar o arquivo SMB '${absolutePath}': ${formatError(error)}`);
    } finally {
        closeSmbClient(client);
    }
}

function createSmbClient(parsedPath: ParsedUncPath, credentials?: ServerFilesCredentialData): any {
    return new SMB2({
        share: parsedPath.share,
        domain: credentials?.domain || '',
        username: credentials?.username || '',
        password: credentials?.password || '',
        autoCloseTimeout: 0,
    });
}

function closeSmbClient(client: any): void {
    try {
        client.close?.();
    } catch {
        // Best effort close; the SMB library also auto-closes sockets.
    }
}

function smbReaddirDetailed(client: any, directoryPath: string): Promise<SmbDirectoryEntry[]> {
    return new Promise((resolve, reject) => {
        SMB2Request('open_folder', { path: directoryPath }, client, (openError: Error | null, file: IDataObject) => {
            if (openError) {
                reject(openError);
                return;
            }

            querySmbDirectory(client, file, [], (queryError, files) => {
                SMB2Request('close', file, client, () => undefined);

                if (queryError) {
                    reject(queryError);
                    return;
                }

                resolve(files);
            });
        });
    });
}

function querySmbDirectory(
    client: any,
    file: IDataObject,
    completeListing: SmbDirectoryEntry[],
    callback: (error: Error | null, files: SmbDirectoryEntry[]) => void,
): void {
    SMB2Request('query_directory', file, client, (error: any, files?: SmbDirectoryEntry[]) => {
        const allFiles = completeListing.concat(files || []);

        if (error?.code === 'STATUS_NO_MORE_FILES') {
            callback(null, allFiles);
            return;
        }

        if (error) {
            callback(error, allFiles);
            return;
        }

        querySmbDirectory(client, file, allFiles, callback);
    });
}

async function safeStat(absolutePath: string) {
    try {
        return await fs.stat(absolutePath);
    } catch (error) {
        if (error instanceof Error) {
            const extra = isUncPath(absolutePath)
                ? ' Caminhos UNC devem usar o formato \\\\servidor\\share\\pasta e uma credencial SAP B1 Server Files, ou estar montados como volume dentro do container.'
                : '';
            throw new Error(`Não foi possível acessar o caminho '${absolutePath}': ${error.message}.${extra}`);
        }
        throw error;
    }
}

function toLocalFileInfo(absolutePath: string, basePath: string, stats: Awaited<ReturnType<typeof fs.stat>>): ServerFileInfo {
    const relativePath = path.relative(basePath, absolutePath) || path.basename(absolutePath);

    return {
        name: path.basename(absolutePath),
        path: absolutePath,
        relativePath,
        type: stats.isDirectory() ? 'directory' : 'file',
        extension: path.extname(absolutePath).replace(/^\./, ''),
        size: Number(stats.size),
        createdAt: stats.birthtime.toISOString(),
        modifiedAt: stats.mtime.toISOString(),
        accessedAt: stats.atime.toISOString(),
        birthtimeMs: Number(stats.birthtimeMs),
        mtimeMs: Number(stats.mtimeMs),
    };
}

function toSmbFileInfo(entry: SmbDirectoryEntry, absolutePath: string, basePath: string, relativePathFromShare: string): ServerFileInfo {
    const createdAtMs = fileTimeBufferToMs(entry.CreationTime);
    const modifiedAtMs = fileTimeBufferToMs(entry.LastWriteTime);
    const accessedAtMs = fileTimeBufferToMs(entry.LastAccessTime);
    const type = (entry.FileAttributes & SMB_DIRECTORY_ATTRIBUTE) === SMB_DIRECTORY_ATTRIBUTE ? 'directory' : 'file';
    const name = entry.Filename;

    return {
        name,
        path: absolutePath,
        relativePath: getUncRelativePath(basePath, absolutePath) || relativePathFromShare,
        type,
        extension: type === 'file' ? path.win32.extname(name).replace(/^\./, '') : '',
        size: bufferToNumber(entry.EndofFile),
        createdAt: createdAtMs ? new Date(createdAtMs).toISOString() : undefined,
        modifiedAt: modifiedAtMs ? new Date(modifiedAtMs).toISOString() : undefined,
        accessedAt: accessedAtMs ? new Date(accessedAtMs).toISOString() : undefined,
        birthtimeMs: createdAtMs,
        mtimeMs: modifiedAtMs,
    };
}

function isUncPath(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.startsWith('\\\\') || trimmed.startsWith('//');
}

function normalizeUncPath(value: string): string {
    const normalized = value.trim().replace(/\//g, '\\').replace(/\\+/g, '\\');
    return normalized.startsWith('\\\\') ? normalized : `\\${normalized}`;
}

function parseUncPath(value: string): ParsedUncPath {
    const normalized = normalizeUncPath(value);
    const parts = normalized.replace(/^\\+/, '').split('\\').filter(Boolean);

    if (parts.length < 2) {
        throw new Error(`Caminho UNC inválido: '${value}'. Use o formato \\\\servidor\\share\\pasta.`);
    }

    const [server, shareName, ...relativeParts] = parts;
    const share = `\\\\${server}\\${shareName}`;
    const relativePath = relativeParts.join('\\');

    return {
        server,
        shareName,
        share,
        relativePath,
        fullPath: buildUncPath(share, relativePath),
    };
}

function buildUncPath(share: string, relativePath: string): string {
    return relativePath ? `${share}\\${relativePath}` : share;
}

function joinSmbRelativePath(parent: string, child: string): string {
    return [parent, child].filter(Boolean).join('\\');
}

function getUncRelativePath(basePath: string, absolutePath: string): string {
    const normalizedBase = normalizeUncPath(basePath).toLowerCase();
    const normalizedPath = normalizeUncPath(absolutePath);

    if (!normalizedPath.toLowerCase().startsWith(normalizedBase)) {
        return normalizedPath;
    }

    return normalizedPath.slice(normalizedBase.length).replace(/^\\+/, '');
}

function fileTimeBufferToMs(buffer?: Buffer): number | undefined {
    const fileTime = bufferToBigInt(buffer);
    if (!fileTime || fileTime === BigInt(0)) {
        return undefined;
    }

    const unixEpochDifference = BigInt('116444736000000000');
    return Number((fileTime - unixEpochDifference) / BigInt(10000));
}

function bufferToNumber(buffer?: Buffer): number {
    const value = bufferToBigInt(buffer);
    return value ? Number(value) : 0;
}

function bufferToBigInt(buffer?: Buffer): bigint | undefined {
    if (!buffer) {
        return undefined;
    }

    let value = BigInt(0);
    for (let i = 0; i < buffer.length; i++) {
        value += BigInt(buffer[i]) << BigInt(8 * i);
    }

    return value;
}

function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String((error as { message?: unknown }).message);
    }

    return String(error);
}
