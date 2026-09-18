import { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import { IDocumentListOptions, SAPB1ManagedDocumentType } from '../../../transport/Interfaces';
import { toSapDate } from '../../../utils/date';
import { parseSelectedFields } from '../../../utils/select';

function normalizeText(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function normalizeNumber(value: unknown): number | undefined {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }

    const parsedValue = Number(value);
    return Number.isNaN(parsedValue) ? undefined : parsedValue;
}

function normalizeOptionalSapDate(value: unknown): string | undefined {
    const normalized = normalizeText(value);
    return normalized ? toSapDate(normalized) : undefined;
}

function getDocumentType(this: IExecuteFunctions, index: number): SAPB1ManagedDocumentType {
    const resource = this.getNodeParameter('resource', index) as string;
    if (resource === 'document') {
        return this.getNodeParameter('documentType', index) as SAPB1ManagedDocumentType;
    }

    return resource as SAPB1ManagedDocumentType;
}

export async function list(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const documentType = getDocumentType.call(this, index);
    const filters = this.getNodeParameter('filters', index, {}) as IDocumentListOptions;
    const limitPagination = this.getNodeParameter('limitPagination', index, false) as boolean;
    const maxPages = this.getNodeParameter('maxPages', index, 1) as number;
    const selectMode = this.getNodeParameter('selectMode', index, 'all') as string;
    const selectFieldsRaw = this.getNodeParameter('selectFields', index, '') as string;

    const selectedFields = parseSelectedFields(selectMode, selectFieldsRaw);
    const documents = await api.listDocuments(
        documentType,
        {
            docEntry: normalizeNumber(filters.docEntry),
            docNum: normalizeNumber(filters.docNum),
            cardCode: normalizeText(filters.cardCode) || undefined,
            documentStatus: normalizeText(filters.documentStatus) || undefined,
            docDateFrom: normalizeOptionalSapDate(filters.docDateFrom),
            docDateTo: normalizeOptionalSapDate(filters.docDateTo),
            rawFilter: normalizeText(filters.rawFilter) || undefined,
        },
        limitPagination ? maxPages : undefined,
        selectedFields,
    );

    return this.helpers.returnJsonArray(documents);
}
