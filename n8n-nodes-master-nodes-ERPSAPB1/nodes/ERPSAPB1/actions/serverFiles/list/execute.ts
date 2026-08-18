import { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { filterFiles, isGuestAuth, listFiles, parseDateParameter, resolveBasePath } from '../helpers';

export async function execute(this: IExecuteFunctions, index: number): Promise<INodeExecutionData[]> {
    const credentials = await getOptionalCredentials.call(this);
    const basePath = resolveBasePath(
        this.getNodeParameter('serverBasePath', index, '') as string,
        credentials?.basePath as string | undefined,
    );
    const folderPath = this.getNodeParameter('serverFolderPath', index, '.') as string;
    const recursive = this.getNodeParameter('recursive', index, false) as boolean;
    const includeDirectories = this.getNodeParameter('includeDirectories', index, false) as boolean;
    const includeMetadata = this.getNodeParameter('includeMetadata', index, false) as boolean;
    const createdFrom = parseDateParameter(this.getNodeParameter('createdFrom', index, '') as string);
    const createdTo = parseDateParameter(this.getNodeParameter('createdTo', index, '') as string, true);
    const fileNameContains = this.getNodeParameter('fileNameContains', index, '') as string;
    const fileNameRegex = this.getNodeParameter('fileNameRegex', index, '') as string;
    const maxItems = this.getNodeParameter('maxItems', index, 0) as number;

    const includeStats = includeMetadata || Boolean(createdFrom || createdTo);
    const canLimitWhileListing = !includeStats && !fileNameContains?.trim() && !fileNameRegex?.trim();
    const files = filterFiles(await listFiles(basePath, folderPath, recursive, credentials, {
        includeStats,
        maxItems: canLimitWhileListing ? maxItems : 0,
    }), {
        createdFrom,
        createdTo,
        fileNameContains,
        fileNameRegex,
        includeDirectories,
    });

    const limitedFiles = maxItems > 0 && files.length > maxItems ? files.slice(0, maxItems) : files;

    return this.helpers.returnJsonArray(limitedFiles.map((file) => ({
        ...file,
        basePath,
        networkCredentialsConfigured: Boolean(isGuestAuth(credentials) || credentials?.username || credentials?.domain),
    })));
}

async function getOptionalCredentials(this: IExecuteFunctions): Promise<IDataObject | undefined> {
    try {
        return await this.getCredentials('erpSAPB1ServerFiles') as IDataObject;
    } catch {
        return undefined;
    }
}
