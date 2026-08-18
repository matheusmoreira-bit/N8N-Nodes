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
                displayName: 'Authentication',
                name: 'authMode',
                type: 'options',
                options: [
                    {
                        name: 'Username and Password',
                        value: 'usernamePassword',
                    },
                    {
                        name: 'Guest',
                        value: 'guest',
                    },
                ],
                default: 'usernamePassword',
                description: 'Use Guest to access shares that explicitly allow guest access.',
            },
            {
                displayName: 'Network Username',
                name: 'username',
                type: 'string',
                default: '',
                description: 'Optional network/share username. Ignored when Authentication is Guest.',
            },
            {
                displayName: 'Network Password',
                name: 'password',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                description: 'Optional network/share password. Ignored when Authentication is Guest.',
            },
            {
                displayName: 'Domain',
                name: 'domain',
                type: 'string',
                default: '',
                description: 'Optional Windows/network domain. Ignored when Authentication is Guest.',
            },
            {
                displayName: 'Base Path',
                name: 'basePath',
                type: 'string',
                default: '',
                placeholder: '\\\\servidor\\share ou smb://servidor/share',
                description: 'Optional base folder or SMB share. A base path set directly in the node overrides this value.',
            },
            {
                displayName: 'SMB Timeout (Seconds)',
                name: 'timeoutSeconds',
                type: 'number',
                default: 30,
                typeOptions: {
                    minValue: 1,
                    numberPrecision: 0,
                },
                description: 'Maximum time to wait for SMB list/download operations before failing.',
            },
        ];
    }
}
exports.ERPSAPB1ServerFiles = ERPSAPB1ServerFiles;
