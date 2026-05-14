import {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class ERPSAPB1Api implements ICredentialType {
    public name = 'erpSAPB1Api';
    public displayName = 'ERPSAPB1 API';
    public documentationUrl = 'erpsapb1';
    public properties: INodeProperties[] = [
        {
            displayName: 'URL base',
            name: 'baseUrl',
            type: 'string',
            placeholder: 'http://URL',
            description: 'O url da api SAP B1.',
            default: '',
            required: true,
        },
        {
            displayName: 'Usuário',
            name: 'authUser',
            type: 'string',
            description: 'O nome de usuário para gerar o token de endpoint.',
            default: '',
            required: true,
        },
        {
            displayName: 'Senha',
            name: 'authPassword',
            type: 'string',
            typeOptions: {
                password: true,
            },
            description: 'A senha para gerar o token de endpoint.',
            default: '',
            required: true,
        },
        {
            displayName: 'Company Database',
            name: 'authCompanyDb',
            type: 'string',
            description: 'A chave CompanyDB para gerar o token de endpoint.',
            default: '',
            required: true,
        },
    ];
}
