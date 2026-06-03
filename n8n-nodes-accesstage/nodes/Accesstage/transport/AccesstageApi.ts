import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import FormData from 'form-data';
import { IDataObject } from 'n8n-workflow';

export interface AccesstageApiCredentials extends IDataObject {
	baseUrl: string;
	clientId: string;
	clientSecret: string;
}

export class AccesstageApiClient {
	private accessToken?: string;

	constructor(private readonly credentials: AccesstageApiCredentials) {}

	public async upload(companyCode: string, form: FormData): Promise<IDataObject> {
		const response = await this.request<IDataObject>({
			method: 'POST',
			url: `/${encodeURIComponent(companyCode)}/upload`,
			data: form,
			headers: form.getHeaders(),
		});

		return response;
	}

	public async download(fileId: string): Promise<{ data: Buffer; headers: IDataObject }> {
		const response = await this.request<Buffer>({
			method: 'GET',
			url: `/download/${encodeURIComponent(fileId)}`,
			responseType: 'arraybuffer',
		});

		return {
			data: Buffer.from(response),
			headers: {},
		};
	}

	public async listFiles(from: string, to: string): Promise<IDataObject | IDataObject[]> {
		return await this.request<IDataObject | IDataObject[]>({
			method: 'GET',
			url: '/list/files',
			params: { from, to },
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}

	private async request<T>(config: AxiosRequestConfig): Promise<T> {
		const token = await this.getAccessToken();
		const baseUrl = normalizeBaseUrl(this.credentials.baseUrl);

		try {
			const response = await axios.request<T>({
				...config,
				url: `${baseUrl}${config.url ?? ''}`,
				headers: {
					Authorization: `Bearer ${token}`,
					Accept: 'application/json',
					...(config.headers ?? {}),
				},
			});

			return response.data;
		} catch (error) {
			throw formatAxiosError(error, 'Falha na chamada da API Accesstage');
		}
	}

	private async getAccessToken(): Promise<string> {
		if (this.accessToken) {
			return this.accessToken;
		}

		const baseUrl = normalizeBaseUrl(this.credentials.baseUrl);
		const basicToken = Buffer.from(`${this.credentials.clientId}:${this.credentials.clientSecret}`).toString('base64');
		const body = new URLSearchParams({ grant_type: 'client_credentials' });

		try {
			const response = await axios.post(`${baseUrl}/auth`, body.toString(), {
				headers: {
					Authorization: `Basic ${basicToken}`,
					'Content-Type': 'application/x-www-form-urlencoded',
					Accept: 'application/json',
				},
			});

			const token = response.data?.access_token ?? response.data?.token;
			if (!token || typeof token !== 'string') {
				throw new Error('Resposta de autenticação sem access_token.');
			}

			this.accessToken = token;
			return token;
		} catch (error) {
			throw formatAxiosError(error, 'Falha na autenticação Accesstage APUS');
		}
	}
}

export function normalizeBaseUrl(baseUrl: string): string {
	return baseUrl.trim().replace(/\/+$/, '');
}

function formatAxiosError(error: unknown, fallbackMessage: string): Error {
	if (axios.isAxiosError(error)) {
		const axiosError = error as AxiosError;
		const status = axiosError.response?.status;
		const data = axiosError.response?.data;
		const responseText = typeof data === 'string' ? data : JSON.stringify(data ?? {});
		const statusText = status ? ` HTTP ${status}.` : '';
		return new Error(`${fallbackMessage}.${statusText} ${responseText}`.trim());
	}

	if (error instanceof Error) {
		return new Error(`${fallbackMessage}: ${error.message}`);
	}

	return new Error(fallbackMessage);
}
