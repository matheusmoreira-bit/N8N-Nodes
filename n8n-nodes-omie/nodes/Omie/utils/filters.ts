import { IDataObject } from 'n8n-workflow';

export interface AccountsPayableFilters {
    baixaBloqueada?: string;
    bloqueado?: string;
    statusTitulo?: string;
    dataVencimentoFrom?: string;
    dataVencimentoTo?: string;
    dataPrevisaoFrom?: string;
    dataPrevisaoTo?: string;
}

function normalizeText(value: unknown): string {
    return `${value ?? ''}`.trim().toUpperCase();
}

function matchesYesNoFilter(value: unknown, expected?: string): boolean {
    if (!expected) {
        return true;
    }

    return normalizeText(value) === expected;
}

function matchesStatusFilter(value: unknown, expected?: string): boolean {
    const statuses = `${expected ?? ''}`
        .split(',')
        .map((status) => normalizeText(status))
        .filter(Boolean);

    if (statuses.length === 0) {
        return true;
    }

    return statuses.includes(normalizeText(value));
}

function parseDateValue(value: unknown): number | undefined {
    if (!value) {
        return undefined;
    }

    const textValue = `${value}`.trim();
    const omieDateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(textValue);

    if (omieDateMatch) {
        const [, day, month, year] = omieDateMatch;
        return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
    }

    const parsedDate = new Date(textValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return undefined;
    }

    return parsedDate.getTime();
}

function matchesDateRange(value: unknown, from?: string, to?: string): boolean {
    if (!from && !to) {
        return true;
    }

    const dateValue = parseDateValue(value);
    const fromValue = parseDateValue(from);
    const toValue = parseDateValue(to);

    if (dateValue === undefined) {
        return false;
    }
    if (fromValue !== undefined && dateValue < fromValue) {
        return false;
    }
    if (toValue !== undefined && dateValue > toValue) {
        return false;
    }

    return true;
}

export function filterAccountsPayableResults(
    results: IDataObject[],
    filters: AccountsPayableFilters,
): IDataObject[] {
    return results.filter((result) => (
        matchesYesNoFilter(result.baixa_bloqueada, filters.baixaBloqueada)
        && matchesYesNoFilter(result.bloqueado, filters.bloqueado)
        && matchesStatusFilter(result.status_titulo, filters.statusTitulo)
        && matchesDateRange(result.data_vencimento, filters.dataVencimentoFrom, filters.dataVencimentoTo)
        && matchesDateRange(result.data_previsao, filters.dataPrevisaoFrom, filters.dataPrevisaoTo)
    ));
}
