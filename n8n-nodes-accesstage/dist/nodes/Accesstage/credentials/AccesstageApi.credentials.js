"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccesstageApi = void 0;
class AccesstageApi {
    constructor() {
        this.name = 'accesstageApi';
        this.displayName = 'Accesstage APUS API';
        this.documentationUrl = 'accesstage';
        this.properties = [
            {
                displayName: 'Base URL',
                name: 'baseUrl',
                type: 'string',
                default: 'https://apus.accesstage.com.br/api/apus/v1',
                required: true,
            },
            {
                displayName: 'Client ID',
                name: 'clientId',
                type: 'string',
                default: '',
                required: true,
            },
            {
                displayName: 'Client Secret',
                name: 'clientSecret',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
            },
        ];
    }
}
exports.AccesstageApi = AccesstageApi;
