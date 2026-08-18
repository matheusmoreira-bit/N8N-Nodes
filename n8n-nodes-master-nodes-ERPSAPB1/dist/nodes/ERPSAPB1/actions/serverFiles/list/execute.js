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
    const includeMetadata = this.getNodeParameter('includeMetadata', index, false);
    const createdFrom = (0, helpers_1.parseDateParameter)(this.getNodeParameter('createdFrom', index, ''));
    const createdTo = (0, helpers_1.parseDateParameter)(this.getNodeParameter('createdTo', index, ''), true);
    const fileNameContains = this.getNodeParameter('fileNameContains', index, '');
    const fileNameRegex = this.getNodeParameter('fileNameRegex', index, '');
    const maxItems = this.getNodeParameter('maxItems', index, 0);
    const includeStats = includeMetadata || Boolean(createdFrom || createdTo);
    const canLimitWhileListing = !includeStats && !(fileNameContains === null || fileNameContains === void 0 ? void 0 : fileNameContains.trim()) && !(fileNameRegex === null || fileNameRegex === void 0 ? void 0 : fileNameRegex.trim());
    const files = (0, helpers_1.filterFiles)(await (0, helpers_1.listFiles)(basePath, folderPath, recursive, credentials, {
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
        networkCredentialsConfigured: Boolean((0, helpers_1.isGuestAuth)(credentials) || (credentials === null || credentials === void 0 ? void 0 : credentials.username) || (credentials === null || credentials === void 0 ? void 0 : credentials.domain)),
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
