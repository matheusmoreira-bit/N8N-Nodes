import {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class OmieApi implements ICredentialType {
    public name = 'omieApi';
    public displayName = 'Omie API';
    public documentationUrl = 'https://developers.omie.com.br/api-v1/financas/contas-a-pagar/';
    public properties: INodeProperties[] = [
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
