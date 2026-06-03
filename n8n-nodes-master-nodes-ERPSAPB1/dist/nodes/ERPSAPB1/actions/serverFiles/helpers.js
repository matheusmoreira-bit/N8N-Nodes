"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveBasePath = resolveBasePath;
exports.resolveTargetPath = resolveTargetPath;
exports.listFiles = listFiles;
exports.filterFiles = filterFiles;
exports.readFileBuffer = readFileBuffer;
exports.parseDateParameter = parseDateParameter;
const fs_1 = require("fs");
const path = __importStar(require("path"));
const SMB2 = require('smb2');
const SMB2Forge = require('smb2/lib/tools/smb2-forge');
const SMB2Request = SMB2Forge.request;
const SMB_DIRECTORY_ATTRIBUTE = 0x10;
function resolveBasePath(nodeBasePath, credentialBasePath) {
    const basePath = (nodeBasePath === null || nodeBasePath === void 0 ? void 0 : nodeBasePath.trim()) || (credentialBasePath === null || credentialBasePath === void 0 ? void 0 : credentialBasePath.trim());
    if (!basePath) {
        throw new Error('Informe o Caminho Base ou selecione uma credencial SAP B1 Server Files com Caminho Base.');
    }
    return isUncPath(basePath) ? normalizeUncPath(basePath) : path.resolve(basePath);
}
function resolveTargetPath(basePath, targetPath) {
    const rawTargetPath = targetPath === null || targetPath === void 0 ? void 0 : targetPath.trim();
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
async function listFiles(basePath, targetPath, recursive, credentials) {
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
function filterFiles(files, filters) {
    var _a, _b;
    const contains = (_a = filters.fileNameContains) === null || _a === void 0 ? void 0 : _a.trim().toLowerCase();
    const regex = ((_b = filters.fileNameRegex) === null || _b === void 0 ? void 0 : _b.trim()) ? new RegExp(filters.fileNameRegex.trim()) : undefined;
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
async function readFileBuffer(basePath, filePath, credentials) {
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
        buffer: await fs_1.promises.readFile(absolutePath),
    };
}
function parseDateParameter(value, endOfDay = false) {
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
async function listLocalDirectory(directoryPath, basePath, recursive) {
    const entries = await fs_1.promises.readdir(directoryPath, { withFileTypes: true });
    const results = [];
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
async function listSmbFiles(basePath, rootPath, recursive, credentials) {
    const parsedRoot = parseUncPath(rootPath);
    const parsedBase = isUncPath(basePath) ? parseUncPath(basePath) : parsedRoot;
    const client = createSmbClient(parsedRoot, credentials);
    try {
        return await listSmbDirectory(client, parsedRoot, parsedBase.fullPath, parsedRoot.relativePath, recursive);
    }
    catch (error) {
        throw new Error(`Não foi possível acessar o caminho SMB '${rootPath}': ${formatError(error)}`);
    }
    finally {
        closeSmbClient(client);
    }
}
async function listSmbDirectory(client, parsedShare, basePath, directoryPath, recursive) {
    const entries = await smbReaddirDetailed(client, directoryPath);
    const results = [];
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
async function readSmbFile(absolutePath, credentials) {
    const parsedPath = parseUncPath(absolutePath);
    const client = createSmbClient(parsedPath, credentials);
    try {
        const buffer = await new Promise((resolve, reject) => {
            client.readFile(parsedPath.relativePath, (error, data) => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve(Buffer.isBuffer(data) ? data : Buffer.from(data));
            });
        });
        return { absolutePath: parsedPath.fullPath, buffer };
    }
    catch (error) {
        throw new Error(`Não foi possível baixar o arquivo SMB '${absolutePath}': ${formatError(error)}`);
    }
    finally {
        closeSmbClient(client);
    }
}
function createSmbClient(parsedPath, credentials) {
    return new SMB2({
        share: parsedPath.share,
        domain: (credentials === null || credentials === void 0 ? void 0 : credentials.domain) || '',
        username: (credentials === null || credentials === void 0 ? void 0 : credentials.username) || '',
        password: (credentials === null || credentials === void 0 ? void 0 : credentials.password) || '',
        autoCloseTimeout: 0,
    });
}
function closeSmbClient(client) {
    var _a;
    try {
        (_a = client.close) === null || _a === void 0 ? void 0 : _a.call(client);
    }
    catch {
        // Best effort close; the SMB library also auto-closes sockets.
    }
}
function smbReaddirDetailed(client, directoryPath) {
    return new Promise((resolve, reject) => {
        SMB2Request('open_folder', { path: directoryPath }, client, (openError, file) => {
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
function querySmbDirectory(client, file, completeListing, callback) {
    SMB2Request('query_directory', file, client, (error, files) => {
        const allFiles = completeListing.concat(files || []);
        if ((error === null || error === void 0 ? void 0 : error.code) === 'STATUS_NO_MORE_FILES') {
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
async function safeStat(absolutePath) {
    try {
        return await fs_1.promises.stat(absolutePath);
    }
    catch (error) {
        if (error instanceof Error) {
            const extra = isUncPath(absolutePath)
                ? ' Caminhos UNC devem usar o formato \\\\servidor\\share\\pasta e uma credencial SAP B1 Server Files, ou estar montados como volume dentro do container.'
                : '';
            throw new Error(`Não foi possível acessar o caminho '${absolutePath}': ${error.message}.${extra}`);
        }
        throw error;
    }
}
function toLocalFileInfo(absolutePath, basePath, stats) {
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
function toSmbFileInfo(entry, absolutePath, basePath, relativePathFromShare) {
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
function isUncPath(value) {
    const trimmed = value.trim();
    return trimmed.startsWith('\\\\') || trimmed.startsWith('//');
}
function normalizeUncPath(value) {
    const normalized = value.trim().replace(/\//g, '\\').replace(/\\+/g, '\\');
    return normalized.startsWith('\\\\') ? normalized : `\\${normalized}`;
}
function parseUncPath(value) {
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
function buildUncPath(share, relativePath) {
    return relativePath ? `${share}\\${relativePath}` : share;
}
function joinSmbRelativePath(parent, child) {
    return [parent, child].filter(Boolean).join('\\');
}
function getUncRelativePath(basePath, absolutePath) {
    const normalizedBase = normalizeUncPath(basePath).toLowerCase();
    const normalizedPath = normalizeUncPath(absolutePath);
    if (!normalizedPath.toLowerCase().startsWith(normalizedBase)) {
        return normalizedPath;
    }
    return normalizedPath.slice(normalizedBase.length).replace(/^\\+/, '');
}
function fileTimeBufferToMs(buffer) {
    const fileTime = bufferToBigInt(buffer);
    if (!fileTime || fileTime === BigInt(0)) {
        return undefined;
    }
    const unixEpochDifference = BigInt('116444736000000000');
    return Number((fileTime - unixEpochDifference) / BigInt(10000));
}
function bufferToNumber(buffer) {
    const value = bufferToBigInt(buffer);
    return value ? Number(value) : 0;
}
function bufferToBigInt(buffer) {
    if (!buffer) {
        return undefined;
    }
    let value = BigInt(0);
    for (let i = 0; i < buffer.length; i++) {
        value += BigInt(buffer[i]) << BigInt(8 * i);
    }
    return value;
}
function formatError(error) {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'object' && error !== null && 'message' in error) {
        return String(error.message);
    }
    return String(error);
}
