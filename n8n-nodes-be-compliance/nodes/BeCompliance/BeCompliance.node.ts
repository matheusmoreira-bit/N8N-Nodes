import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import axios from 'axios';

export class BeCompliance implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Be Compliance',
		name: 'beCompliance',
		icon: 'fa:shield-alt',
		group: ['transform'],
		version: 1,
		description: 'Interact with BeCompliance API',
		defaults: {
			name: 'Be Compliance',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'beComplianceApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Third Party Analysis',
						value: 'thirdPartyAnalysis',
					},
				],
				default: 'thirdPartyAnalysis',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['thirdPartyAnalysis'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getAll',
						description: 'Get all third party analysis',
						action: 'Get all third party analysis',
					},
				],
				default: 'getAll',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		const credentials = await this.getCredentials('beComplianceApi') as IDataObject;
		const tenantId = credentials.tenantId as string;
		const email = credentials.email as string;
		const password = credentials.password as string;

		// 1. Auth Login para obter o Token
		let token = '';
		try {
			const loginResponse = await axios.post(`https://api.becompliance.com/ext/v1/${tenantId}/auth/login`, {
				email,
				password,
			});
			token = loginResponse.data.access_token;
		} catch (error) {
			throw new Error(`Falha na autenticação BeCompliance: ${error.message}`);
		}

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'thirdPartyAnalysis') {
					if (operation === 'getAll') {
						const response = await axios.get(`https://api.becompliance.com/ext/v1/${tenantId}/third-party-analysis`, {
							headers: {
								Authorization: `Bearer ${token}`,
							},
						});
						
						if (Array.isArray(response.data)) {
							returnData.push(...this.helpers.returnJsonArray(response.data));
						} else {
							returnData.push({ json: response.data });
						}
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
