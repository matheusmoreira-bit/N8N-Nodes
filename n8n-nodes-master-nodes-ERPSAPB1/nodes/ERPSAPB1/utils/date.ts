function assertValidDateParts(year: number, month: number, day: number): void {
    const parsedDate = new Date(Date.UTC(year, month - 1, day));

    if (
        parsedDate.getUTCFullYear() !== year
        || parsedDate.getUTCMonth() !== month - 1
        || parsedDate.getUTCDate() !== day
    ) {
        throw new Error('Data invalida informada para o SAP.');
    }
}

export function toSapDate(value: string | Date): string {
    if (value instanceof Date) {
        if (Number.isNaN(value.getTime())) {
            throw new Error('Data invalida informada para o SAP.');
        }

        return value.toISOString().slice(0, 10);
    }

    const normalizedValue = String(value).trim();

    const isoDate = /^(\d{4})-(\d{2})-(\d{2})(T.*)?$/.exec(normalizedValue);
    if (isoDate) {
        const [, year, month, day] = isoDate;
        assertValidDateParts(Number(year), Number(month), Number(day));
        return normalizedValue.slice(0, 10);
    }

    const brazilianDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(normalizedValue);
    if (brazilianDate) {
        const [, day, month, year] = brazilianDate;
        assertValidDateParts(Number(year), Number(month), Number(day));
        return `${year}-${month}-${day}`;
    }

    const parsedDate = new Date(normalizedValue);

    if (Number.isNaN(parsedDate.getTime())) {
        throw new Error('Data invalida informada para o SAP.');
    }

    return parsedDate.toISOString().slice(0, 10);
}
