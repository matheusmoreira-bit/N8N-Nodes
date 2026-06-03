"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterAccountsPayableResults = filterAccountsPayableResults;
function normalizeText(value) {
    return `${value ?? ''}`.trim().toUpperCase();
}
function matchesYesNoFilter(value, expected) {
    if (!expected) {
        return true;
    }
    return normalizeText(value) === expected;
}
function matchesStatusFilter(value, expected) {
    const statuses = `${expected ?? ''}`
        .split(',')
        .map((status) => normalizeText(status))
        .filter(Boolean);
    if (statuses.length === 0) {
        return true;
    }
    return statuses.includes(normalizeText(value));
}
function parseDateValue(value) {
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
function matchesDateRange(value, from, to) {
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
function filterAccountsPayableResults(results, filters) {
    return results.filter((result) => (matchesYesNoFilter(result.baixa_bloqueada, filters.baixaBloqueada)
        && matchesYesNoFilter(result.bloqueado, filters.bloqueado)
        && matchesStatusFilter(result.status_titulo, filters.statusTitulo)
        && matchesDateRange(result.data_vencimento, filters.dataVencimentoFrom, filters.dataVencimentoTo)
        && matchesDateRange(result.data_previsao, filters.dataPrevisaoFrom, filters.dataPrevisaoTo)));
}
//# sourceMappingURL=filters.js.map