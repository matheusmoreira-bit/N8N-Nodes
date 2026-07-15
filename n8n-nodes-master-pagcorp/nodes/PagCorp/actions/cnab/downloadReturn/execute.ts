import {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
} from 'n8n-workflow';

import { PagCorpApi } from '../../../transport/PagCorpApi';
import {
    fileNameFromContentDisposition,
    getHeader,
    parseJsonObject,
} from '../helpers';

export async function downloadReturn(
    this: IExecuteFunctions,
    api: PagCorpApi,
    itemIndex: number,
): Promise<INodeExecutionData[]> {
    const returnId = this.getNodeParameter('returnId', itemIndex) as string;
    const endpointPath = this.getNodeParameter('cnabDownloadReturnEndpointPath', itemIndex) as string;
    const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', itemIndex) as string;
    const configuredFileName = this.getNodeParameter('outputFileName', itemIndex, '') as string;
    const additionalFields = this.getNodeParameter('cnabDownloadReturnAdditionalFields', itemIndex, {}) as IDataObject;
    const queryParameters = parseJsonObject(additionalFields.queryParametersJson, 'Query Parameters JSON');

    const response = await api.downloadCnabReturn({
        endpointPath,
        returnId: returnId.trim(),
        queryParameters,
    });

    const contentType = getHeader(response.headers, 'content-type') ?? 'application/octet-stream';
    const contentDisposition = getHeader(response.headers, 'content-disposition');
    const inferredFileName = fileNameFromContentDisposition(contentDisposition);
    const fileName = configuredFileName.trim() || inferredFileName || `${returnId.trim()}.ret`;
    const binaryData = await this.helpers.prepareBinaryData(response.data, fileName, contentType);

    return [
        {
            json: {
                resource: 'cnab',
                operation: 'downloadReturn',
                endpointPath,
                returnId: returnId.trim(),
                fileName,
                size: response.data.length,
                contentType,
            },
            binary: {
                [outputBinaryPropertyName]: binaryData,
            },
            pairedItem: { item: itemIndex },
        },
    ];
}
