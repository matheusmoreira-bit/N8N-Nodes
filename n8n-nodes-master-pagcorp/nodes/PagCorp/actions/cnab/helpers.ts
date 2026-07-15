import { IDataObject } from 'n8n-workflow';

export function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');

    return `${year}-${month}-${day}`;
}

export function toApiDate(value: string | undefined, fallback: () => Date): string {
    if (!value) {
        return formatLocalDate(fallback());
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

export function parseJsonObject(value: unknown, fieldName: string): IDataObject {
    if (value === undefined || value === null || value === '') {
        return {};
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
        return value as IDataObject;
    }

    if (typeof value !== 'string') {
        throw new Error(`${fieldName} deve ser um objeto JSON.`);
    }

    try {
        const parsed = JSON.parse(value);

        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
            throw new Error(`${fieldName} deve ser um objeto JSON.`);
        }

        return parsed as IDataObject;
    } catch (error) {
        if (error instanceof Error && error.message.includes('deve ser um objeto JSON')) {
            throw error;
        }

        throw new Error(`${fieldName} contem JSON invalido.`);
    }
}

export function normalizeResponse(response: unknown): IDataObject {
    if (response && typeof response === 'object' && !Array.isArray(response)) {
        return response as IDataObject;
    }

    return { raw: response as string | number | boolean | null };
}

export function normalizeRows(response: unknown): IDataObject[] {
    if (Array.isArray(response)) {
        return response.map(normalizeResponse);
    }

    if (response && typeof response === 'object') {
        const data = response as IDataObject;

        for (const key of ['items', 'data', 'results', 'returns', 'retornos', 'files', 'arquivos']) {
            const rows = data[key];
            if (Array.isArray(rows)) {
                return rows.map(normalizeResponse);
            }
        }

        if (typeof data.raw === 'string') {
            try {
                return normalizeRows(JSON.parse(data.raw));
            } catch {
                return [data];
            }
        }

        return [data];
    }

    return [normalizeResponse(response)];
}

export function getHeader(headers: IDataObject, name: string): string | undefined {
    const lowerName = name.toLowerCase();
    const value = headers[name] ?? headers[lowerName];

    if (Array.isArray(value)) {
        return value.join(', ');
    }

    return typeof value === 'string' ? value : undefined;
}

export function fileNameFromContentDisposition(contentDisposition: string | undefined): string {
    if (!contentDisposition) {
        return '';
    }

    const utfFileName = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition);
    if (utfFileName?.[1]) {
        try {
            return decodeURIComponent(utfFileName[1].replace(/"/g, ''));
        } catch {
            return utfFileName[1].replace(/"/g, '');
        }
    }

    const regularFileName = /filename="?([^";]+)"?/i.exec(contentDisposition);
    return regularFileName?.[1] ?? '';
}
