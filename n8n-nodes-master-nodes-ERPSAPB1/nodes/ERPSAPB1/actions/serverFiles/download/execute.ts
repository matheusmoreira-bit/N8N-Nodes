import * as path from 'path';
import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { readFileBuffer, resolveBasePath } from '../helpers';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
    const credentials = await getOptionalCredentials.call(this);
    const basePath = resolveBasePath(
        this.getNodeParameter('serverBasePath', index, '') as string,
        credentials?.basePath as string | undefined,
    );
    const filePath = this.getNodeParameter('serverFilePath', index) as string;
    const binaryPropertyName = this.getNodeParameter('binaryPropertyName', index, 'data') as string;

    const { absolutePath, buffer } = await readFileBuffer(basePath, filePath, credentials);
    const fileName = path.basename(absolutePath);
    const binaryData = await this.helpers.prepareBinaryData(buffer, fileName, 'application/octet-stream');

    return [{
        json: {
            fileName,
            path: absolutePath,
            relativePath: path.relative(basePath, absolutePath),
            basePath,
            size: buffer.length,
            networkCredentialsConfigured: Boolean(credentials?.username || credentials?.domain),
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
