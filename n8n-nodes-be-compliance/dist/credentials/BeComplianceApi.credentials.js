"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeComplianceApi = void 0;
class BeComplianceApi {
    constructor() {
        this.name = 'beComplianceApi';
        this.displayName = 'BeCompliance API';
        this.documentationUrl = 'becompliance';
        this.properties = [
            {
                displayName: 'Tenant ID',
                name: 'tenantId',
                type: 'string',
                default: '8a179552-8dbb-4200-9ed0-def7ae8a5ccb',
                required: true,
            },
            {
                displayName: 'Email',
                name: 'email',
                type: 'string',
                default: '',
                placeholder: 'email@example.com',
                required: true,
            },
            {
                displayName: 'Password',
                name: 'password',
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
exports.BeComplianceApi = BeComplianceApi;
