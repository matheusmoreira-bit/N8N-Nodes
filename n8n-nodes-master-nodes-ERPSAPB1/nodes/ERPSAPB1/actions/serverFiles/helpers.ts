import { Dirent, promises as fs } from 'fs';
import * as path from 'path';
import { IDataObject } from 'n8n-workflow';

const SMB2 = require('smb2');
const SMB2Connection = require('smb2/lib/tools/smb2-connection');
const SMB2Forge = require('smb2/lib/tools/smb2-forge');
const SMB2Request = SMB2Forge.request;

const SMB_DIRECTORY_ATTRIBUTE = 0x10;
const SMB_REPARSE_POINT_ATTRIBUTE = 0x400;
const DEFAULT_SMB_TIMEOUT_MS = 30_000;

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

export interface ListFilesOptions {
    includeStats?: boolean;
    maxItems?: number;
}

export interface ServerFilesCredentialData extends IDataObject {
    authMode?: string;
    username?: string;
    password?: string;
    domain?: string;
    basePath?: string;
    timeoutSeconds?: number | string;
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
    options: ListFilesOptions = {},
): Promise<ServerFileInfo[]> {
    const rootPath = resolveTargetPath(basePath, targetPath);

    if (isUncPath(rootPath)) {
        return await listSmbFiles(basePath, rootPath, recursive, credentials);
    }

    const rootStats = await safeStat(rootPath);

    if (!rootStats.isDirectory()) {
        return [toLocalFileInfo(rootPath, basePath, rootStats)];
    }

    return await listLocalDirectory(rootPath, basePath, recursive, options);
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

export function isGuestAuth(credentials?: ServerFilesCredentialData | IDataObject): boolean {
    return String(credentials?.authMode || '').toLowerCase() === 'guest';
}

async function listLocalDirectory(
    directoryPath: string,
    basePath: string,
    recursive: boolean,
    options: ListFilesOptions,
    results: ServerFileInfo[] = [],
): Promise<ServerFileInfo[]> {
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });
    const maxItems = Number(options.maxItems || 0);

    for (const entry of entries) {
        if (maxItems > 0 && results.length >= maxItems) {
            break;
        }

        const absolutePath = path.join(directoryPath, entry.name);
        const info = options.includeStats
            ? toLocalFileInfo(absolutePath, basePath, await safeStat(absolutePath))
            : toLocalFileInfoFromDirent(absolutePath, basePath, entry);

        results.push(info);

        if (recursive && entry.isDirectory() && !(maxItems > 0 && results.length >= maxItems)) {
            await listLocalDirectory(absolutePath, basePath, true, options, results);
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
    const timeoutMs = resolveSmbTimeoutMs(credentials);
    const client = createSmbClient(parsedRoot, credentials, timeoutMs);

    try {
        return await withTimeout(
            listSmbDirectory(client, parsedRoot, parsedBase.fullPath, parsedRoot.relativePath, recursive),
            timeoutMs,
            `Tempo limite de ${formatDuration(timeoutMs)} excedido ao listar '${rootPath}'. Verifique autenticação SMB, permissão na pasta e evite "Recursivo" em árvores grandes.`,
        );
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

        if (recursive && info.type === 'directory' && !isSmbReparsePoint(entry)) {
            results.push(...await listSmbDirectory(client, parsedShare, basePath, childRelativePath, true));
        }
    }

    return results;
}

async function readSmbFile(absolutePath: string, credentials?: ServerFilesCredentialData): Promise<{ absolutePath: string; buffer: Buffer }> {
    const parsedPath = parseUncPath(absolutePath);
    const timeoutMs = resolveSmbTimeoutMs(credentials);
    const client = createSmbClient(parsedPath, credentials, timeoutMs);

    try {
        const buffer = await withTimeout(
            new Promise<Buffer>((resolve, reject) => {
                client.readFile(parsedPath.relativePath, (error: Error | null, data: Buffer) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve(Buffer.isBuffer(data) ? data : Buffer.from(data));
                });
            }),
            timeoutMs,
            `Tempo limite de ${formatDuration(timeoutMs)} excedido ao baixar '${absolutePath}'. Verifique autenticação SMB e permissão no arquivo.`,
        );

        return { absolutePath: parsedPath.fullPath, buffer };
    } catch (error) {
        throw new Error(`Não foi possível baixar o arquivo SMB '${absolutePath}': ${formatError(error)}`);
    } finally {
        closeSmbClient(client);
    }
}

function createSmbClient(parsedPath: ParsedUncPath, credentials?: ServerFilesCredentialData, timeoutMs = DEFAULT_SMB_TIMEOUT_MS): any {
    const auth = resolveSmbAuth(credentials);
    const client = new SMB2({
        share: parsedPath.share,
        domain: auth.domain,
        username: auth.username,
        password: auth.password,
        autoCloseTimeout: 0,
    });

    client.socket?.setTimeout?.(timeoutMs, () => {
        client.socket?.destroy?.(new Error(`Tempo limite SMB de ${formatDuration(timeoutMs)} excedido.`));
    });

    return client;
}

function resolveSmbAuth(credentials?: ServerFilesCredentialData): { domain: string; username: string; password: string } {
    if (isGuestAuth(credentials)) {
        return {
            domain: '',
            username: 'guest',
            password: '',
        };
    }

    return {
        domain: String(credentials?.domain || ''),
        username: String(credentials?.username || ''),
        password: String(credentials?.password || ''),
    };
}

function closeSmbClient(client: any): void {
    try {
        client.close?.();
    } catch {
        // Best effort close; the SMB library also auto-closes sockets.
    }

    try {
        client.socket?.destroy?.();
    } catch {
        // Best effort close; the socket may already be closed.
    }
}

function smbReaddirDetailed(client: any, directoryPath: string): Promise<SmbDirectoryEntry[]> {
    const readDirectory = SMB2Connection.requireConnect((
        targetPath: string,
        callback: (error: Error | null, files?: SmbDirectoryEntry[]) => void,
    ): void => {
        SMB2Request('open_folder', { path: targetPath }, client, (openError: Error | null, file: IDataObject) => {
            if (openError) {
                callback(openError);
                return;
            }

            querySmbDirectory(client, file, [], (queryError, files) => {
                SMB2Request('close', file, client, () => {
                    if (queryError) {
                        callback(queryError);
                        return;
                    }

                    callback(null, files);
                });
            });
        });
    });

    return new Promise((resolve, reject) => {
        readDirectory.call(client, directoryPath, (error: Error | null, files: SmbDirectoryEntry[] = []) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(files);
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

function toLocalFileInfoFromDirent(absolutePath: string, basePath: string, entry: Dirent): ServerFileInfo {
    const type = entry.isDirectory() ? 'directory' : 'file';

    return {
        name: entry.name,
        path: absolutePath,
        relativePath: path.relative(basePath, absolutePath) || entry.name,
        type,
        extension: type === 'file' ? path.extname(entry.name).replace(/^\./, '') : '',
        size: 0,
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

function isSmbReparsePoint(entry: SmbDirectoryEntry): boolean {
    return (entry.FileAttributes & SMB_REPARSE_POINT_ATTRIBUTE) === SMB_REPARSE_POINT_ATTRIBUTE;
}

function isUncPath(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.startsWith('\\\\') || trimmed.startsWith('//') || /^smb:[/\\]+/i.test(trimmed);
}

function normalizeUncPath(value: string): string {
    const trimmed = value.trim();
    const smbPath = trimmed.match(/^smb:[/\\]+(.+)$/i);
    const rawPath = smbPath ? `\\\\${smbPath[1]}` : trimmed;
    const normalized = rawPath.replace(/\//g, '\\').replace(/\\+/g, '\\');

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

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, message: string): Promise<T> {
    let timeout: NodeJS.Timeout | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
    });

    try {
        return await Promise.race([promise, timeoutPromise]);
    } finally {
        if (timeout) {
            clearTimeout(timeout);
        }
    }
}

function resolveSmbTimeoutMs(credentials?: ServerFilesCredentialData): number {
    const rawTimeoutSeconds = credentials?.timeoutSeconds;
    const timeoutSeconds = typeof rawTimeoutSeconds === 'number'
        ? rawTimeoutSeconds
        : Number(rawTimeoutSeconds);

    if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
        return DEFAULT_SMB_TIMEOUT_MS;
    }

    return Math.max(1_000, Math.round(timeoutSeconds * 1_000));
}

function formatDuration(timeoutMs: number): string {
    return `${Math.round(timeoutMs / 1_000)}s`;
}

function formatError(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'object' && error !== null) {
        const message = 'message' in error ? String((error as { message?: unknown }).message) : '';
        const code = 'code' in error ? String((error as { code?: unknown }).code) : '';

        if (message && code && !message.includes(code)) {
            return `${message} (${code})`;
        }

        if (message) {
            return message;
        }
    }

    return String(error);
}
