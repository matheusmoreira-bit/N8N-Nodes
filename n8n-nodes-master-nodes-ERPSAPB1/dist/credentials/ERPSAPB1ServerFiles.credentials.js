"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERPSAPB1ServerFiles = void 0;
class ERPSAPB1ServerFiles {
    constructor() {
        this.name = 'erpSAPB1ServerFiles';
        this.displayName = 'SAP B1 Server Files';
        this.documentationUrl = 'erpsapb1ServerFiles';
        this.properties = [
            {
                displayName: 'Network Username',
                name: 'username',
                type: 'string',
                default: '',
                description: 'Optional network/share username. The path still needs to be accessible by the n8n process.',
            },
            {
                displayName: 'Network Password',
                name: 'password',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                description: 'Optional network/share password. The path still needs to be accessible by the n8n process.',
            },
            {
                displayName: 'Domain',
                name: 'domain',
                type: 'string',
                default: '',
                description: 'Optional Windows/network domain.',
            },
            {
                displayName: 'Base Path',
                name: 'basePath',
                type: 'string',
                default: '',
                placeholder: '/mnt/sap-files',
                description: 'Optional base folder. A base path set directly in the node overrides this value.',
            },
        ];
    }
}
exports.ERPSAPB1ServerFiles = ERPSAPB1ServerFiles;
