"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const helpers_1 = require("../helpers");
async function execute(index) {
    const credentials = await getOptionalCredentials.call(this);
    const basePath = (0, helpers_1.resolveBasePath)(this.getNodeParameter('serverBasePath', index, ''), credentials === null || credentials === void 0 ? void 0 : credentials.basePath);
    const folderPath = this.getNodeParameter('serverFolderPath', index, '.');
    const recursive = this.getNodeParameter('recursive', index, false);
    const includeDirectories = this.getNodeParameter('includeDirectories', index, false);
    const createdFrom = (0, helpers_1.parseDateParameter)(this.getNodeParameter('createdFrom', index, ''));
    const createdTo = (0, helpers_1.parseDateParameter)(this.getNodeParameter('createdTo', index, ''), true);
    const fileNameContains = this.getNodeParameter('fileNameContains', index, '');
    const fileNameRegex = this.getNodeParameter('fileNameRegex', index, '');
    const maxItems = this.getNodeParameter('maxItems', index, 0);
    const files = (0, helpers_1.filterFiles)(await (0, helpers_1.listFiles)(basePath, folderPath, recursive, credentials), {
        createdFrom,
        createdTo,
        fileNameContains,
        fileNameRegex,
        includeDirectories,
    });
    const limitedFiles = maxItems > 0 ? files.slice(0, maxItems) : files;
    return this.helpers.returnJsonArray(limitedFiles.map((file) => ({
        ...file,
        basePath,
        networkCredentialsConfigured: Boolean((credentials === null || credentials === void 0 ? void 0 : credentials.username) || (credentials === null || credentials === void 0 ? void 0 : credentials.domain)),
    })));
}
async function getOptionalCredentials() {
    try {
        return await this.getCredentials('erpSAPB1ServerFiles');
    }
    catch {
        return undefined;
    }
}
