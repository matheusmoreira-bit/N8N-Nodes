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

const ACCESSTAGE_UPLOAD_HASH_ALGORITHM = 'sha256';

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
						name: 'Document Download',
						value: 'documentDownload',
						description: 'Download a document file from APUS',
						action: 'Download a document',
					},
					{
						name: 'Document Upload',
						value: 'documentUpload',
						description: 'Upload a JSON document to APUS',
						action: 'Upload a document',
					},
					{
						name: 'List Partnership',
						value: 'listPartnership',
						description: 'List APUS partnerships',
						action: 'List partnerships',
					},
					{
						name: 'List Return Files',
						value: 'list',
						description: 'List returned files available to download by date range',
						action: 'List return files',
					},
					{
						name: 'List Transactions',
						value: 'listTransactions',
						description: 'List remittance and return transactions by date range',
						action: 'List transactions',
					},
					{
						name: 'Resubmit File',
						value: 'resubmit',
						description: 'Request a file to be made available again',
						action: 'Resubmit a file',
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
						operation: ['upload', 'documentUpload'],
					},
				},
				default: '',
				placeholder: '2429631',
				description: 'Code used as pdsid in the upload endpoint path',
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
					{ name: 'SHA256', value: 'sha256' },
				],
				default: 'sha256',
				description: 'Hash sent in the multipart field named hash. Accesstage APUS validates uploads with SHA-256.',
			},
			{
				displayName: 'Tracking ID',
				name: 'fileId',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['download', 'documentDownload', 'resubmit'],
					},
				},
				default: '',
				placeholder: '00820260518105657455990618',
				description: 'Tracking returned by the list files endpoint',
				required: true,
			},
			{
				displayName: 'Output Binary Property',
				name: 'outputBinaryPropertyName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['download', 'documentDownload'],
					},
				},
				default: 'data',
				required: true,
			},
			{
				displayName: 'Download Endpoint',
				name: 'downloadEndpoint',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['download'],
					},
				},
				options: [
					{
						name: 'Auto',
						value: 'auto',
					},
					{
						name: 'File (/download)',
						value: 'file',
					},
					{
						name: 'Document (/document/download)',
						value: 'document',
					},
				],
				default: 'auto',
				description: 'Endpoint usado para baixar o arquivo. Auto tenta /download e, se o arquivo nao existir, tenta /document/download.',
			},
			{
				displayName: 'Output File Name',
				name: 'outputFileName',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['download', 'documentDownload'],
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
						operation: ['list', 'listTransactions'],
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
						operation: ['list', 'listTransactions'],
					},
				},
				default: '',
				description: 'End date. If empty, today is used.',
			},
			{
				displayName: 'Document Body Source',
				name: 'documentBodySource',
				type: 'options',
				displayOptions: {
					show: {
						operation: ['documentUpload'],
					},
				},
				options: [
					{
						name: 'Input Item JSON',
						value: 'inputJson',
					},
					{
						name: 'JSON Parameter',
						value: 'jsonParameter',
					},
				],
				default: 'inputJson',
				description: 'Origem do JSON enviado no corpo do document upload',
			},
			{
				displayName: 'Document Body JSON',
				name: 'documentBodyJson',
				type: 'json',
				displayOptions: {
					show: {
						operation: ['documentUpload'],
						documentBodySource: ['jsonParameter'],
					},
				},
				default: '{}',
				description: 'Objeto JSON enviado para /document/upload/{pdsid}',
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
				const configuredHashAlgorithm = this.getNodeParameter('hashAlgorithm', i, ACCESSTAGE_UPLOAD_HASH_ALGORITHM) as string;
				const hashAlgorithm = ACCESSTAGE_UPLOAD_HASH_ALGORITHM;
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
						configuredHashAlgorithm,
						hash,
						response,
					},
					pairedItem: { item: i },
				});
				continue;
			}

			if (operation === 'download') {
				const fileId = resolveTrackingId(this.getNodeParameter('fileId', i));
				const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
				const downloadEndpoint = this.getNodeParameter('downloadEndpoint', i, 'auto') as string;
				const configuredFileName = this.getNodeParameter('outputFileName', i) as string;
				const fileName = configuredFileName?.trim() || `${fileId}.txt`;
				const response = await downloadFile(client, fileId, downloadEndpoint);
				const contentType = getHeader(response.headers, 'content-type') ?? 'application/octet-stream';
				const binaryData = await this.helpers.prepareBinaryData(response.data, fileName, contentType);

				returnData.push({
					json: {
						operation,
						tracking: fileId,
						endpoint: response.endpoint,
						fileName,
						size: response.data.length,
						contentType,
					},
					binary: {
						[outputBinaryPropertyName]: binaryData,
					},
					pairedItem: { item: i },
				});
				continue;
			}

			if (operation === 'documentDownload') {
				const fileId = resolveTrackingId(this.getNodeParameter('fileId', i));
				const outputBinaryPropertyName = this.getNodeParameter('outputBinaryPropertyName', i) as string;
				const configuredFileName = this.getNodeParameter('outputFileName', i) as string;
				const fileName = configuredFileName?.trim() || `${fileId}.txt`;
				const response = await client.documentDownload(fileId);
				const contentType = getHeader(response.headers, 'content-type') ?? 'application/octet-stream';
				const binaryData = await this.helpers.prepareBinaryData(response.data, fileName, contentType);

				returnData.push({
					json: {
						operation,
						tracking: fileId,
						fileName,
						size: response.data.length,
						contentType,
					},
					binary: {
						[outputBinaryPropertyName]: binaryData,
					},
					pairedItem: { item: i },
				});
				continue;
			}

			if (operation === 'documentUpload') {
				const companyCode = this.getNodeParameter('companyCode', i) as string;
				const documentBodySource = this.getNodeParameter('documentBodySource', i) as string;
				const body = documentBodySource === 'jsonParameter'
					? parseJsonObject(this.getNodeParameter('documentBodyJson', i), 'Document Body JSON')
					: items[i].json;
				const response = await client.documentUpload(companyCode.trim(), body);

				returnData.push({
					json: {
						operation,
						companyCode: companyCode.trim(),
						response,
					},
					pairedItem: { item: i },
				});
				continue;
			}

			if (operation === 'list') {
				const from = toApiDate(this.getNodeParameter('from', i, '') as string);
				const to = toApiDate(this.getNodeParameter('to', i, '') as string);
				const response = await client.listFiles(from, to);
				const rows = normalizeRows(response);

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

			if (operation === 'listPartnership') {
				const response = await client.listPartnership();
				const rows = normalizeRows(response);

				for (const row of rows) {
					returnData.push({
						json: row,
						pairedItem: { item: i },
					});
				}
				continue;
			}

			if (operation === 'listTransactions') {
				const from = toApiDate(this.getNodeParameter('from', i, '') as string);
				const to = toApiDate(this.getNodeParameter('to', i, '') as string);
				const response = await client.listTransactions(from, to);
				const rows = normalizeRows(response);

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

			if (operation === 'resubmit') {
				const fileId = resolveTrackingId(this.getNodeParameter('fileId', i));
				const response = await client.resubmit(fileId);

				returnData.push({
					json: {
						operation,
						tracking: fileId,
						response,
					},
					pairedItem: { item: i },
				});
				continue;
			}

			throw new Error(`Operação Accesstage não suportada: ${operation}`);
		}

		return [returnData];
	}
}

function toApiDate(value: string): string {
	if (!value) {
		return formatLocalDate(new Date());
	}

	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return value;
	}

	const parsedDate = new Date(value);
	if (!Number.isNaN(parsedDate.getTime())) {
		return formatLocalDate(parsedDate);
	}

	return value.slice(0, 10);
}

function formatLocalDate(date: Date): string {
	const year = date.getFullYear();
	const month = `${date.getMonth() + 1}`.padStart(2, '0');
	const day = `${date.getDate()}`.padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function normalizeRows(response: IDataObject | IDataObject[]): IDataObject[] {
	if (Array.isArray(response)) {
		return response;
	}

	const raw = response.raw;
	if (typeof raw === 'string') {
		try {
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [parsed];
		} catch {
			return [response];
		}
	}

	return [response];
}

function getHeader(headers: IDataObject, name: string): string | undefined {
	const value = headers[name] ?? headers[name.toLowerCase()];

	if (Array.isArray(value)) {
		return value.join(', ');
	}

	return typeof value === 'string' ? value : undefined;
}

function resolveTrackingId(value: unknown): string {
	if (typeof value === 'number') {
		if (!Number.isSafeInteger(value)) {
			throw new Error('Tracking ID veio como numero inseguro. Use o tracking como texto/string, pois IDs longos do APUS perdem precisao como numero. Reexecute a listagem com esta versao do node e use o campo tracking retornado.');
		}

		return `${value}`;
	}

	const tracking = `${value ?? ''}`.trim();
	if (!tracking) {
		throw new Error('Tracking ID nao informado.');
	}

	if (/^-?\d+e\+\d+$/i.test(tracking)) {
		throw new Error('Tracking ID veio em notacao cientifica. Use o tracking como texto/string, pois IDs longos do APUS perdem precisao como numero.');
	}

	return tracking;
}

async function downloadFile(
	client: AccesstageApiClient,
	fileId: string,
	downloadEndpoint: string,
): Promise<{ data: Buffer; headers: IDataObject; endpoint: 'file' | 'document' }> {
	if (downloadEndpoint === 'document') {
		const response = await client.documentDownload(fileId);
		return {
			...response,
			endpoint: 'document',
		};
	}

	if (downloadEndpoint === 'file') {
		const response = await client.download(fileId);
		return {
			...response,
			endpoint: 'file',
		};
	}

	try {
		const response = await client.download(fileId);
		return {
			...response,
			endpoint: 'file',
		};
	} catch (error) {
		if (!isDownloadNotFoundError(error)) {
			throw error;
		}

		try {
			const response = await client.documentDownload(fileId);
			return {
				...response,
				endpoint: 'document',
			};
		} catch (documentError) {
			if (!isDownloadNotFoundError(documentError)) {
				throw documentError;
			}

			throw new Error(`Arquivo nao encontrado em /download nem em /document/download para o tracking "${fileId}". Confirme se o tracking veio da listagem no mesmo ambiente da credencial (homologacao/producao). Se o tracking veio de uma listagem antiga ou como numero, reexecute a listagem com esta versao do node para preservar o ID longo como texto.`);
		}
	}
}

function isDownloadNotFoundError(error: unknown): boolean {
	if (!(error instanceof Error)) {
		return false;
	}

	return error.message.includes('Arquivo não encontrado para download')
		|| error.message.includes('Arquivo nao encontrado para download');
}

function parseJsonObject(value: unknown, fieldName: string): IDataObject {
	if (value && typeof value === 'object' && !Array.isArray(value)) {
		return value as IDataObject;
	}

	if (typeof value !== 'string') {
		throw new Error(`${fieldName} must be a JSON object.`);
	}

	try {
		const parsed = JSON.parse(value);

		if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
			throw new Error(`${fieldName} must be a JSON object.`);
		}

		return parsed as IDataObject;
	} catch (error) {
		if (error instanceof Error && error.message.includes('must be a JSON object')) {
			throw error;
		}

		throw new Error(`${fieldName} contains invalid JSON.`);
	}
}
