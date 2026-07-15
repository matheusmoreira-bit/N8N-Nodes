"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadReturn = downloadReturn;
const helpers_1 = require("../helpers");
async function downloadReturn(api, itemIndex) {
    var _a;
    const returnId = this.getNodeParameter('returnId', itemIndex);
    const endpointPath = this.getNodeParameter('cnabDownloadReturnEndpointPath', itemIndex);
    const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', itemIndex);
    const configuredFileName = this.getNodeParameter('outputFileName', itemIndex, '');
    const additionalFields = this.getNodeParameter('cnabDownloadReturnAdditionalFields', itemIndex, {});
    const queryParameters = (0, helpers_1.parseJsonObject)(additionalFields.queryParametersJson, 'Query Parameters JSON');
    const response = await api.downloadCnabReturn({
        endpointPath,
        returnId: returnId.trim(),
        queryParameters,
    });
    const contentType = (_a = (0, helpers_1.getHeader)(response.headers, 'content-type')) !== null && _a !== void 0 ? _a : 'application/octet-stream';
    const contentDisposition = (0, helpers_1.getHeader)(response.headers, 'content-disposition');
    const inferredFileName = (0, helpers_1.fileNameFromContentDisposition)(contentDisposition);
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
