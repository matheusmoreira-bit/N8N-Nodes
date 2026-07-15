"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = upload;
const crypto_1 = require("crypto");
const helpers_1 = require("../helpers");
async function upload(api, itemIndex) {
    var _a, _b, _c, _d, _e, _f;
    const binaryPropertyName = this.getNodeParameter('binaryPropertyName', itemIndex);
    const endpointPath = this.getNodeParameter('cnabUploadEndpointPath', itemIndex);
    const requestFormat = this.getNodeParameter('cnabUploadRequestFormat', itemIndex);
    const formFileFieldName = this.getNodeParameter('cnabUploadFormFileFieldName', itemIndex, 'file');
    const additionalFields = this.getNodeParameter('cnabUploadAdditionalFields', itemIndex, {});
    const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
    const fileBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryData);
    const fileName = `${(_b = (_a = additionalFields.fileName) !== null && _a !== void 0 ? _a : binaryData.fileName) !== null && _b !== void 0 ? _b : 'arquivo.rem'}`.trim();
    const mimeType = `${(_d = (_c = additionalFields.contentType) !== null && _c !== void 0 ? _c : binaryData.mimeType) !== null && _d !== void 0 ? _d : 'application/octet-stream'}`.trim();
    const queryParameters = (0, helpers_1.parseJsonObject)(additionalFields.queryParametersJson, 'Query Parameters JSON');
    const formFields = (0, helpers_1.parseJsonObject)(additionalFields.formFieldsJson, 'Extra Form Fields JSON');
    const sha256 = (0, crypto_1.createHash)('sha256').update(fileBuffer).digest('hex');
    const hashFieldName = `${(_e = additionalFields.hashFieldName) !== null && _e !== void 0 ? _e : ''}`.trim();
    const fileNameFieldName = `${(_f = additionalFields.fileNameFieldName) !== null && _f !== void 0 ? _f : ''}`.trim();
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
                response: (0, helpers_1.normalizeResponse)(response),
            },
            pairedItem: { item: itemIndex },
        },
    ];
}
