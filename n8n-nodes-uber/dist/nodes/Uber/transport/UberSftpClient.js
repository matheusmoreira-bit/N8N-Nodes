"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UberSftpClient = void 0;
exports.normalizePath = normalizePath;
const ssh2_sftp_client_1 = __importDefault(require("ssh2-sftp-client"));
class UberSftpClient {
    constructor(credentials) {
        this.credentials = credentials;
        this.client = new ssh2_sftp_client_1.default('UberSftp');
        this.connected = false;
    }
    async connect() {
        if (this.connected) {
            return;
        }
        const config = {
            host: this.credentials.host,
            port: Number(this.credentials.port || 22),
            username: this.credentials.username,
        };
        if (this.credentials.authentication === 'privateKey') {
            config.privateKey = this.credentials.privateKey;
            if (this.credentials.passphrase) {
                config.passphrase = this.credentials.passphrase;
            }
        }
        else {
            config.password = this.credentials.password;
        }
        try {
            await this.client.connect(config);
            this.connected = true;
        }
        catch (error) {
            throw new Error(`Falha ao conectar no SFTP Uber: ${formatError(error)}`);
        }
    }
    async end() {
        if (!this.connected) {
            return;
        }
        await this.client.end();
        this.connected = false;
    }
    resolvePath(path) {
        const basePath = normalizePath(String(this.credentials.basePath || '/'));
        const inputPath = String(path || '').trim();
        if (!inputPath || inputPath === '.') {
            return basePath;
        }
        if (inputPath.startsWith('/')) {
            return normalizePath(inputPath);
        }
        return normalizePath(`${basePath}/${inputPath}`);
    }
    async list(path, recursive) {
        const resolvedPath = this.resolvePath(path);
        return await this.listResolvedPath(resolvedPath, recursive);
    }
    async download(path) {
        const resolvedPath = this.resolvePath(path);
        try {
            const data = await this.client.get(resolvedPath);
            return Buffer.isBuffer(data) ? data : Buffer.from(data);
        }
        catch (error) {
            throw new Error(`Falha ao baixar arquivo '${resolvedPath}' do SFTP Uber: ${formatError(error)}`);
        }
    }
    async listResolvedPath(path, recursive) {
        var _a;
        let entries;
        try {
            entries = await this.client.list(path);
        }
        catch (error) {
            throw new Error(`Falha ao listar caminho '${path}' no SFTP Uber: ${formatError(error)}`);
        }
        const files = [];
        for (const entry of entries) {
            const entryPath = normalizePath(`${path}/${entry.name}`);
            const remoteFile = {
                name: entry.name,
                path: entryPath,
                type: entry.type,
                size: Number((_a = entry.size) !== null && _a !== void 0 ? _a : 0),
                modifyTime: entry.modifyTime,
                accessTime: entry.accessTime,
            };
            if (entry.type === 'd') {
                if (recursive) {
                    files.push(...await this.listResolvedPath(entryPath, true));
                }
                continue;
            }
            files.push(remoteFile);
        }
        return files;
    }
}
exports.UberSftpClient = UberSftpClient;
function normalizePath(path) {
    const normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/');
    if (!normalized.startsWith('/')) {
        return `/${normalized}`.replace(/\/+/g, '/');
    }
    return normalized.length > 1 ? normalized.replace(/\/$/, '') : normalized;
}
function formatError(error) {
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
