"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toSapDate = toSapDate;
function formatInvalidDateError(value) {
    const receivedValue = value === undefined ? '' : ` Valor recebido: ${JSON.stringify(value)}.`;
    return new Error(`Data invalida informada para o SAP.${receivedValue}`);
}
function assertValidDateParts(year, month, day, originalValue) {
    const parsedDate = new Date(Date.UTC(year, month - 1, day));
    if (parsedDate.getUTCFullYear() !== year
        || parsedDate.getUTCMonth() !== month - 1
        || parsedDate.getUTCDate() !== day) {
        throw formatInvalidDateError(originalValue);
    }
}
function normalizeYear(year) {
    return year.length === 2 ? `20${year}` : year;
}
function padDatePart(value) {
    return value.padStart(2, '0');
}
function stringifyDateValue(value) {
    var _a;
    if (typeof value === 'object'
        && value !== null
        && 'toISODate' in value
        && typeof value.toISODate === 'function') {
        return String((_a = value.toISODate()) !== null && _a !== void 0 ? _a : '');
    }
    if (typeof value === 'object'
        && value !== null
        && 'toJSDate' in value
        && typeof value.toJSDate === 'function') {
        return toSapDate(value.toJSDate());
    }
    return String(value).trim();
}
function toSapDate(value) {
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
