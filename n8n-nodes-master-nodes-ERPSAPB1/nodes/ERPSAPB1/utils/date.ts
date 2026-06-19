function formatInvalidDateError(value?: unknown): Error {
    const receivedValue = value === undefined ? '' : ` Valor recebido: ${JSON.stringify(value)}.`;
    return new Error(`Data invalida informada para o SAP.${receivedValue}`);
}

function assertValidDateParts(year: number, month: number, day: number, originalValue?: unknown): void {
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
        parsedDate.getUTCFullYear() !== year
        || parsedDate.getUTCMonth() !== month - 1
        || parsedDate.getUTCDate() !== day
    ) {
        throw formatInvalidDateError(originalValue);
    }
}

function normalizeYear(year: string): string {
    return year.length === 2 ? `20${year}` : year;
}

function padDatePart(value: string): string {
    return value.padStart(2, '0');
}

function stringifyDateValue(value: unknown): string {
    if (
        typeof value === 'object'
        && value !== null
        && 'toISODate' in value
        && typeof (value as { toISODate?: unknown }).toISODate === 'function'
    ) {
        return String((value as { toISODate: () => string | null }).toISODate() ?? '');
    }

    if (
        typeof value === 'object'
        && value !== null
        && 'toJSDate' in value
        && typeof (value as { toJSDate?: unknown }).toJSDate === 'function'
    ) {
        return toSapDate((value as { toJSDate: () => Date }).toJSDate());
    }

    return String(value).trim();
}

export function toSapDate(value: string | Date | unknown): string {
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            throw formatInvalidDateError(value);
        }

        return value.toISOString().slice(0, 10);
    }

    const normalizedValue = stringifyDateValue(value);

    if (!normalizedValue) {
        throw formatInvalidDateError(value);
    }

    if (normalizedValue.includes('{{') && normalizedValue.includes('}}')) {
        throw new Error(`Data invalida informada para o SAP. A expressao parece nao ter sido avaliada pelo n8n: ${normalizedValue}`);
    }

    const isoDate = /^(\d{4})-(\d{2})-(\d{2})(T.*)?$/.exec(normalizedValue);
    if (isoDate) {
        const [, year, month, day] = isoDate;
        assertValidDateParts(Number(year), Number(month), Number(day), value);
        return normalizedValue.slice(0, 10);
    }

    const brazilianDate = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})(?:[T\s,].*)?$/.exec(normalizedValue);
    if (brazilianDate) {
        const [, day, month, year] = brazilianDate;
        const fullYear = normalizeYear(year);
        const paddedMonth = padDatePart(month);
        const paddedDay = padDatePart(day);
        assertValidDateParts(Number(fullYear), Number(paddedMonth), Number(paddedDay), value);
        return `${fullYear}-${paddedMonth}-${paddedDay}`;
    }

    const compactIsoDate = /^(\d{4})(\d{2})(\d{2})$/.exec(normalizedValue);
    if (compactIsoDate) {
        const [, year, month, day] = compactIsoDate;
        assertValidDateParts(Number(year), Number(month), Number(day), value);
        return `${year}-${month}-${day}`;
    }

    const parsedDate = new Date(normalizedValue);

    if (Number.isNaN(parsedDate.getTime())) {
        throw formatInvalidDateError(value);
    }

    return parsedDate.toISOString().slice(0, 10);
}
