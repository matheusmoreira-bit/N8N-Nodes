import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import FormData from 'form-data';
import { createHash } from 'crypto';
import { AccesstageApiClient, AccesstageApiCredentials } from './transport/AccesstageApi';

export class Accesstage implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Accesstage APUS',
		name: 'accesstage',
		icon: 'file:accesstage-logo.png',
		group: ['transform'],
		version: 1,
		description: 'Upload, download and list files in Accesstage APUS',
		defaults: {
			name: 'Accesstage APUS',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'accesstageApi',
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
						name: 'File',
						value: 'file',
					},
				],
				default: 'file',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Upload',
						value: 'upload',
						description: 'Upload a file to APUS',
						action: 'Upload a file',
					},
					{
						name: 'Download',
						value: 'download',
						description: 'Download a returned file from APUS',
						action: 'Download a file',
					},
					{
						name: 'List Files',
						value: 'list',
						description: 'List APUS files by date range',
						action: 'List files',
					},
				],
				default: 'upload',
			},
			{
				displayName: 'Company Code',
				name: 'companyCode',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['upload'],
					},
				},
				default: '',
				placeholder: '2429631',
				description: 'Code used in the upload endpoint path',
				required: true,
			},
			{
				displayName: 'Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['upload'],
					},
				},
				default: 'data',
				required: true,
				description: 'Name of the binary property that contains the file to upload',
			},
			{
				displayName: 'Hash Algorithm',
				name: 'hashAlgorithm',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['upload'],
					},
				},
				options: [
					{ name: 'MD5', value: 'md5' },
					{ name: 'SHA1', value: 'sha1' },
					{ name: 'SHA256', value: 'sha256' },
					{ name: 'SHA512', value: 'sha512' },
				],
				default: 'md5',
				description: 'Hash sent in the multipart field named hash',
			},
			{
				displayName: 'File ID',
				name: 'fileId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['download'],
					},
				},
				default: '',
				placeholder: '00820260518105657455990618',
				required: true,
			},
			{
				displayName: 'Output Binary Property',
				name: 'outputBinaryPropertyName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['download'],
					},
				},
				default: 'data',
				required: true,
			},
			{
				displayName: 'Output File Name',
				name: 'outputFileName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['download'],
					},
				},
				default: '',
				placeholder: 'retorno.txt',
				description: 'Optional file name for the downloaded binary data',
			},
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
				default: '',
				description: 'Start date. If empty, today is used.',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				displayOptions: {
					show: {
						operation: ['list'],
					},
				},
				default: '',
				description: 'End date. If empty, today is used.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const inputItems = this.getInputData();
		const items = inputItems.length > 0 ? inputItems : [{ json: {} } as INodeExecutionData];
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('accesstageApi') as AccesstageApiCredentials;
		const client = new AccesstageApiClient(credentials);
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			if (operation === 'upload') {
				const companyCode = this.getNodeParameter('companyCode', i) as string;
				const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i) as string;
				const hashAlgorithm = this.getNodeParameter('hashAlgorithm', i) as string;
				const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
				const fileBuffer = await this.helpers.getBinaryDataBuffer(i, binaryData);
				const hash = createHash(hashAlgorithm).update(fileBuffer).digest('hex');
				const fileName = binaryData.fileName ?? 'arquivo.rem';
				const mimeType = binaryData.mimeType ?? 'application/octet-stream';
				const form = new FormData();

				form.append('file', fileBuffer, {
					filename: fileName,
					contentType: mimeType,
				});
				form.append('hash', hash);

				const response = await client.upload(companyCode.trim(), form);
				returnData.push({
					json: {
						operation,
						companyCode: companyCode.trim(),
						fileName,
						size: fileBuffer.length,
						hashAlgorithm,
						hash,
						response,
					},
					pairedItem: { item: i },
				});
				continue;
			}

			if (operation === 'download') {
				const fileId = this.getNodeParameter('fileId', i) as string;
				const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
				const configuredFileName = this.getNodeParameter('outputFileName', i) as string;
				const fileName = configuredFileName?.trim() || `${fileId}.txt`;
				const response = await client.download(fileId.trim());
				const binaryData = await this.helpers.prepareBinaryData(response.data, fileName, 'application/octet-stream');

				returnData.push({
					json: {
						operation,
						fileId: fileId.trim(),
						fileName,
						size: response.data.length,
					},
					binary: {
						[outputBinaryPropertyName]: binaryData,
					},
					pairedItem: { item: i },
				});
				continue;
			}

			if (operation === 'list') {
				const from = toApiDate(this.getNodeParameter('from', i, '') as string);
				const to = toApiDate(this.getNodeParameter('to', i, '') as string);
				const response = await client.listFiles(from, to);
				const rows = Array.isArray(response) ? response : [response];

				for (const row of rows) {
					returnData.push({
						json: {
							from,
							to,
							...(row as IDataObject),
						},
						pairedItem: { item: i },
					});
				}
				continue;
			}

			throw new Error(`Operação Accesstage não suportada: ${operation}`);
		}

		return [returnData];
	}
}

function toApiDate(value: string): string {
	if (!value) {
		return new Date().toISOString().slice(0, 10);
	}

	return value.slice(0, 10);
}
