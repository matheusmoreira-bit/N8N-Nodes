import SftpClient, { ConnectOptions, FileInfo } from 'ssh2-sftp-client';
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

export class UberSftpClient {
	private readonly client = new SftpClient('UberSftp');
	private connected = false;

	constructor(private readonly credentials: UberSftpCredentials) {}

	public async connect(): Promise<void> {
		if (this.connected) {
			return;
		}

		const config: ConnectOptions = {
			host: this.credentials.host,
			port: Number(this.credentials.port || 22),
			username: this.credentials.username,
		};

		if (this.credentials.authentication === 'privateKey') {
			config.privateKey = this.credentials.privateKey;
			if (this.credentials.passphrase) {
				config.passphrase = this.credentials.passphrase;
			}
		} else {
			config.password = this.credentials.password;
		}

		try {
			await this.client.connect(config);
			this.connected = true;
		} catch (error) {
			throw new Error(`Falha ao conectar no SFTP Uber: ${formatError(error)}`);
		}
	}

	public async end(): Promise<void> {
		if (!this.connected) {
			return;
		}

		await this.client.end();
		this.connected = false;
	}

	public resolvePath(path: string): string {
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

	public async list(path: string, recursive: boolean): Promise<RemoteFile[]> {
		const resolvedPath = this.resolvePath(path);
		return await this.listResolvedPath(resolvedPath, recursive);
	}

	public async download(path: string): Promise<Buffer> {
		const resolvedPath = this.resolvePath(path);
		try {
			const data = await this.client.get(resolvedPath);
			return Buffer.isBuffer(data) ? data : Buffer.from(data as string);
		} catch (error) {
			throw new Error(`Falha ao baixar arquivo '${resolvedPath}' do SFTP Uber: ${formatError(error)}`);
		}
	}

	private async listResolvedPath(path: string, recursive: boolean): Promise<RemoteFile[]> {
		let entries: FileInfo[];

		try {
			entries = await this.client.list(path);
		} catch (error) {
			throw new Error(`Falha ao listar caminho '${path}' no SFTP Uber: ${formatError(error)}`);
		}

		const files: RemoteFile[] = [];
		for (const entry of entries) {
			const entryPath = normalizePath(`${path}/${entry.name}`);
			const remoteFile: RemoteFile = {
				name: entry.name,
				path: entryPath,
				type: entry.type,
				size: Number(entry.size ?? 0),
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

export function normalizePath(path: string): string {
	const normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/');
	if (!normalized.startsWith('/')) {
		return `/${normalized}`.replace(/\/+/g, '/');
	}
	return normalized.length > 1 ? normalized.replace(/\/$/, '') : normalized;
}

function formatError(error: unknown): string {
	if (error instanceof Error) {
		return error.message;
	}

	return String(error);
}
