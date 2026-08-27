import * as path from 'path';
import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { isGuestAuth, readFileBuffer, resolveBasePath } from '../helpers';

function isUncPath(value: string): boolean {
    const trimmed = value.trim();
    return trimmed.startsWith('\\\\') || trimmed.startsWith('//') || /^smb:[/\\]+/i.test(trimmed);
}

function isFullPath(value: string): boolean {
    return isUncPath(value) || path.isAbsolute(value);
}

function normalizeUncPath(value: string): string {
    const trimmed = value.trim();
    const smbPath = trimmed.match(/^smb:[/\\]+(.+)$/i);
    const rawPath = smbPath ? `\\\\${smbPath[1]}` : trimmed;
    const normalized = rawPath.replace(/\//g, '\\').replace(/\\+/g, '\\');

    return normalized.startsWith('\\\\') ? normalized : `\\${normalized}`;
}

function getBasePathFromFullPath(filePath: string): string {
    if (isUncPath(filePath)) {
        return path.win32.dirname(normalizeUncPath(filePath));
    }

    return path.dirname(path.resolve(filePath));
}

function getRelativePath(basePath: string, absolutePath: string): string {
    if (isUncPath(basePath) || isUncPath(absolutePath)) {
        const normalizedBase = normalizeUncPath(basePath).toLowerCase();
        const normalizedPath = normalizeUncPath(absolutePath);

        if (normalizedPath.toLowerCase().startsWith(normalizedBase)) {
            return normalizedPath.slice(normalizedBase.length).replace(/^\\+/, '') || path.win32.basename(normalizedPath);
        }

        return path.win32.basename(normalizedPath);
    }

    return path.relative(basePath, absolutePath);
}

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
    const credentials = await getOptionalCredentials.call(this);
    const filePath = this.getNodeParameter('serverFilePath', index) as string;
    const basePath = isFullPath(filePath)
        ? getBasePathFromFullPath(filePath)
        : resolveBasePath(
            this.getNodeParameter('serverBasePath', index, '') as string,
            credentials?.basePath as string | undefined,
        );
    const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data') as string;

    const { absolutePath, buffer } = await readFileBuffer(basePath, filePath, credentials);
    const fileName = path.basename(absolutePath);
    const binaryData = await this.helpers.prepareBinaryData(buffer, fileName, 'application/octet-stream');

    return [{
        json: {
            fileName,
            path: absolutePath,
            relativePath: getRelativePath(basePath, absolutePath),
            basePath,
            size: buffer.length,
            networkCredentialsConfigured: Boolean(isGuestAuth(credentials) || credentials?.username || credentials?.domain),
        },
        binary: {
            [binaryPropertyName]: binaryData,
        },
        pairedItem: { item: index },
    }];
}

async function getOptionalCredentials(this: IExecuteFunctions): Promise<IDataObject | undefined> {
    try {
        return await this.getCredentials('erpSAPB1ServerFiles') as IDataObject;
    } catch {
        return undefined;
    }
}
