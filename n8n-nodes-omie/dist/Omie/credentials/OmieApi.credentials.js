"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OmieApi = void 0;
class OmieApi {
    constructor() {
        this.name = 'omieApi';
        this.displayName = 'Omie API';
        this.documentationUrl = 'https://developers.omie.com.br/api-v1/financas/contas-a-pagar/';
        this.properties = [
            {
                displayName: 'API Base URL',
                name: 'apiBaseUrl',
                type: 'string',
                default: 'https://app.omie.com.br/api/v1/',
                required: true,
            },
            {
                displayName: 'App Key',
                name: 'appKey',
                type: 'string',
                default: '',
                required: true,
            },
            {
                displayName: 'App Secret',
                name: 'appSecret',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                required: true,
            },
            {
                displayName: 'Ignore SSL Issues',
                name: 'ignoreSslIssues',
                type: 'boolean',
                default: false,
                description: 'Ative apenas para ambientes com certificado inválido',
            },
        ];
    }
}
exports.OmieApi = OmieApi;
//# sourceMappingURL=OmieApi.credentials.js.map