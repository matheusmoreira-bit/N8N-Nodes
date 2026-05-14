import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class BeComplianceApi implements ICredentialType {
	public name = 'beComplianceApi';
	public displayName = 'BeCompliance API';
	public documentationUrl = 'becompliance';
	public properties: INodeProperties[] = [
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
