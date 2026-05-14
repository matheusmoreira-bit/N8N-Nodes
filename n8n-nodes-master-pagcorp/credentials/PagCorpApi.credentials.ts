import {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class PagCorpApi implements ICredentialType {
    public name = 'pagCorpApi';
    public displayName = 'PagCorp API';
    public documentationUrl = 'pagcorp';
    public properties: INodeProperties[] = [
        {
            displayName: 'API Base URL',
            name: 'apiBaseUrl',
            type: 'string',
            default: 'https://bifrost.acgsa.com.br/kraken/v1/',
            required: true,
        },
        {
            displayName: 'Client Auth Base URL',
            name: 'clientAuthBaseUrl',
            type: 'string',
            default: '',
            required: false,
            description: 'Opcional. Se preenchido, usa esta URL apenas para Authentication/Client',
        },
        {
            displayName: 'Client Key',
            name: 'clientKey',
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
        {
            displayName: 'Login E-mail',
            name: 'loginEmail',
            type: 'string',
            default: '',
            required: true,
        },
        {
            displayName: 'Login Password (Plain Text)',
            name: 'loginPassword',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            required: true,
        },
        {
            displayName: 'AES Key (Base64)',
            name: 'aesKeyBase64',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            required: true,
        },
        {
            displayName: 'HMAC Key (Base64)',
            name: 'hmacKeyBase64',
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
