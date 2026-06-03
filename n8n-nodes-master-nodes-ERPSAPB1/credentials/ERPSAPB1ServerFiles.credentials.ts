import {
    ICredentialType,
    INodeProperties,
} from 'n8n-workflow';

export class ERPSAPB1ServerFiles implements ICredentialType {
    public name = 'erpSAPB1ServerFiles';
    public displayName = 'SAP B1 Server Files';
    public documentationUrl = 'erpsapb1ServerFiles';
    public properties: INodeProperties[] = [
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
