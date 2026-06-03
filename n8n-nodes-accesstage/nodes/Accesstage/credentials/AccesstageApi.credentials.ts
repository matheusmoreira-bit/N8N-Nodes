import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AccesstageApi implements ICredentialType {
	public name = 'accesstageApi';
	public displayName = 'Accesstage APUS API';
	public documentationUrl = 'accesstage';
	public properties: INodeProperties[] = [
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
