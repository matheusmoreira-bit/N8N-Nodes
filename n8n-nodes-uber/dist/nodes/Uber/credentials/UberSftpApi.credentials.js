"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UberSftpApi = void 0;
class UberSftpApi {
    constructor() {
        this.name = 'uberSftpApi';
        this.displayName = 'Uber SFTP';
        this.documentationUrl = 'uberSftp';
        this.properties = [
            {
                displayName: 'Host',
                name: 'host',
                type: 'string',
                default: '',
                placeholder: 'sftp.example.com',
                required: true,
            },
            {
                displayName: 'Port',
                name: 'port',
                type: 'number',
                default: 22,
                required: true,
            },
            {
                displayName: 'Username',
                name: 'username',
                type: 'string',
                default: '',
                required: true,
            },
            {
                displayName: 'Authentication',
                name: 'authentication',
                type: 'options',
                options: [
                    { name: 'Password', value: 'password' },
                    { name: 'Private Key', value: 'privateKey' },
                ],
                default: 'password',
                required: true,
            },
            {
                displayName: 'Password',
                name: 'password',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                displayOptions: {
                    show: {
                        authentication: ['password'],
                    },
                },
                default: '',
                required: true,
            },
            {
                displayName: 'Private Key',
                name: 'privateKey',
                type: 'string',
                typeOptions: {
                    password: true,
                    rows: 8,
                },
                displayOptions: {
                    show: {
                        authentication: ['privateKey'],
                    },
                },
                default: '',
                required: true,
            },
            {
                displayName: 'Private Key Passphrase',
                name: 'passphrase',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                displayOptions: {
                    show: {
                        authentication: ['privateKey'],
                    },
                },
                default: '',
            },
            {
                displayName: 'Base Path',
                name: 'basePath',
                type: 'string',
                default: '/',
                placeholder: '/reports',
                description: 'Base folder used to resolve relative paths in this node',
            },
        ];
    }
}
exports.UberSftpApi = UberSftpApi;
