import { createHash } from 'crypto';
import {
    IDataObject,
    IExecuteFunctions,
    INodeExecutionData,
} from 'n8n-workflow';

import { PagCorpApi } from '../../../transport/PagCorpApi';
import {
    normalizeResponse,
    parseJsonObject,
} from '../helpers';

export async function upload(
    this: IExecuteFunctions,
    api: PagCorpApi,
    itemIndex: number,
): Promise<INodeExecutionData[]> {
    const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex) as string;
    const endpointPath = this.getNodeParameter('cnabUploadEndpointPath', itemIndex) as string;
    const requestFormat = this.getNodeParameter('cnabUploadRequestFormat', itemIndex) as 'multipart' | 'raw';
    const formFileFieldName = this.getNodeParameter('cnabUploadFormFileFieldName', itemIndex, 'file') as string;
    const additionalFields = this.getNodeParameter('cnabUploadAdditionalFields', itemIndex, {}) as IDataObject;

    const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
    const fileBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryData);
    const fileName = `${additionalFields.fileName ?? binaryData.fileName ?? 'arquivo.rem'}`.trim();
    const mimeType = `${additionalFields.contentType ?? binaryData.mimeType ?? 'application/octet-stream'}`.trim();
    const queryParameters = parseJsonObject(additionalFields.queryParametersJson, 'Query Parameters JSON');
    const formFields = parseJsonObject(additionalFields.formFieldsJson, 'Extra Form Fields JSON');
    const sha256 = createHash('sha256').update(fileBuffer).digest('hex');
    const hashFieldName = `${additionalFields.hashFieldName ?? ''}`.trim();
    const fileNameFieldName = `${additionalFields.fileNameFieldName ?? ''}`.trim();

    if (hashFieldName) {
        formFields[hashFieldName] = sha256;
    }

    if (fileNameFieldName) {
        formFields[fileNameFieldName] = fileName;
    }

    const response = await api.uploadCnab({
        endpointPath,
        requestFormat,
        fileContent: fileBuffer,
        fileName,
        mimeType,
        formFileFieldName,
        formFields,
        queryParameters,
    });

    return [
        {
            json: {
                resource: 'cnab',
                operation: 'upload',
                endpointPath,
                requestFormat,
                binaryPropertyName,
                fileName,
                size: fileBuffer.length,
                sha256,
                response: normalizeResponse(response),
            },
            pairedItem: { item: itemIndex },
        },
    ];
}
