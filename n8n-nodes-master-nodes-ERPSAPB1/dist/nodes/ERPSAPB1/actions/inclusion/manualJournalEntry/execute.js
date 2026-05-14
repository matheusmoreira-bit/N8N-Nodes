"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.manualJournalEntry = manualJournalEntry;
const n8n_workflow_1 = require("n8n-workflow");
const date_1 = require("../../../utils/date");
function parseJournalLinesJson(rawValue) {
    try {
        return JSON.parse(rawValue);
    }
    catch {
        throw new Error('O JSON informado para JournalEntryLines é inválido.');
    }
}
function isJournalEntryLineArray(value) {
    return Array.isArray(value) && value.every((line) => typeof line === 'object' && line !== null && 'AccountCode' in line);
}
function normalizeText(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
function normalizeOptionalNumber(value) {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    if (typeof value === 'number') {
        return Number.isNaN(value) ? undefined : value;
    }
    const normalized = normalizeText(value).replace(',', '.');
    if (!normalized) {
        return undefined;
    }
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? undefined : parsed;
}
function formatAmount(value) {
    var _a;
    const parsed = (_a = normalizeOptionalNumber(value)) !== null && _a !== void 0 ? _a : 0;
    return Number(parsed.toFixed(2));
}
function assertJournalIsBalanced(lines) {
    if (lines.length < 2) {
        throw new Error('Informe ao menos duas linhas para o lançamento contábil.');
    }
    const totalDebit = lines.reduce((acc, line) => acc + formatAmount(line.Debit), 0);
    const totalCredit = lines.reduce((acc, line) => acc + formatAmount(line.Credit), 0);
    const diff = Math.abs(totalDebit - totalCredit);
    if (totalDebit <= 0 && totalCredit <= 0) {
        throw new Error('Lançamento inválido: total de débito e crédito zerados. Informe valores maiores que zero.');
    }
    const hasAnyValuedLine = lines.some((line) => formatAmount(line.Debit) > 0 || formatAmount(line.Credit) > 0);
    if (!hasAnyValuedLine) {
        throw new Error('Lançamento inválido: todas as linhas estão com débito/crédito zerados.');
    }
    if (diff > 0.01) {
        throw new Error(`Lançamento não balanceado. Total débito: ${totalDebit.toFixed(2)} | Total crédito: ${totalCredit.toFixed(2)}.`);
    }
}
function extractDetailedErrorMessage(error) {
    var _a, _b, _c, _d, _e, _f, _g;
    const axiosError = error;
    const errorMessageValue = (_c = (_b = (_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.error) === null || _c === void 0 ? void 0 : _c.message;
    if (typeof errorMessageValue === 'string' && errorMessageValue) {
        return errorMessageValue;
    }
    if (typeof errorMessageValue === 'object' && (errorMessageValue === null || errorMessageValue === void 0 ? void 0 : errorMessageValue.value)) {
        return errorMessageValue.value;
    }
    if ((_e = (_d = axiosError.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.detail) {
        return axiosError.response.data.detail;
    }
    if ((_g = (_f = axiosError.response) === null || _f === void 0 ? void 0 : _f.data) === null || _g === void 0 ? void 0 : _g.message) {
        return axiosError.response.data.message;
    }
    return axiosError.message;
}
function buildManualLines(lines) {
    if (!lines.length) {
        throw new Error('Informe ao menos duas linhas para o lançamento contábil.');
    }
    const normalizedLines = lines.map((line, lineIndex) => {
        const accountCode = normalizeText(line.accountCode);
        if (!accountCode) {
            throw new Error(`AccountCode é obrigatório na linha ${lineIndex + 1}.`);
        }
        return {
            AccountCode: accountCode,
            Debit: formatAmount(line.debit),
            Credit: formatAmount(line.credit),
            BPLID: normalizeOptionalNumber(line.bplId),
            ProjectCode: normalizeText(line.projectCode) || undefined,
            CostingCode: normalizeText(line.costingCode) || undefined,
            DueDate: normalizeText(line.dueDate) ? (0, date_1.toSapDate)(line.dueDate) : undefined,
            TaxDate: normalizeText(line.taxDate) ? (0, date_1.toSapDate)(line.taxDate) : undefined,
            LineMemo: '',
        };
    });
    assertJournalIsBalanced(normalizedLines);
    return normalizedLines;
}
function resolveJournalEntryLines(journalLinesMode, manualLines, journalLinesJson) {
    var _a;
    if (journalLinesMode === 'manual') {
        return buildManualLines((_a = manualLines.lineEntryValues) !== null && _a !== void 0 ? _a : []);
    }
    const parsed = parseJournalLinesJson(journalLinesJson);
    if (isJournalEntryLineArray(parsed)) {
        assertJournalIsBalanced(parsed);
        return parsed;
    }
    if (typeof parsed === 'object'
        && parsed !== null
        && 'JournalEntryLines' in parsed
        && isJournalEntryLineArray(parsed.JournalEntryLines)) {
        const lines = parsed.JournalEntryLines;
        assertJournalIsBalanced(lines);
        return lines;
    }
    throw new Error('O JSON de JournalEntryLines deve ser um array no formato SAP.');
}
async function manualJournalEntry(api, index) {
    var _a, _b, _c, _d;
    const referenceDate = (0, date_1.toSapDate)(this.getNodeParameter('referenceDate', index));
    const memo = normalizeText(this.getNodeParameter('memo', index));
    const journalLinesMode = this.getNodeParameter('journalLinesMode', index, 'manual');
    const manualLines = this.getNodeParameter('lineEntries', index, {});
    const journalLinesJson = this.getNodeParameter('journalLinesJson', index, '[]');
    let journalEntryTemplate;
    try {
        journalEntryTemplate = {
            ReferenceDate: referenceDate,
            Memo: memo,
            JournalEntryLines: resolveJournalEntryLines(journalLinesMode, manualLines, journalLinesJson),
        };
        const createdJournalEntry = await api.createJournalEntry(journalEntryTemplate);
        return this.helpers.returnJsonArray([createdJournalEntry]);
    }
    catch (error) {
        if (error instanceof n8n_workflow_1.NodeOperationError) {
            throw error;
        }
        const detailedMessage = (_a = extractDetailedErrorMessage(error)) !== null && _a !== void 0 ? _a : (error instanceof Error ? error.message : 'Erro desconhecido.');
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Nao foi possivel criar o lançamento contábil. Detalhe: ${detailedMessage}. Payload: ${JSON.stringify({
            ReferenceDate: (_b = journalEntryTemplate === null || journalEntryTemplate === void 0 ? void 0 : journalEntryTemplate.ReferenceDate) !== null && _b !== void 0 ? _b : referenceDate,
            Memo: (_c = journalEntryTemplate === null || journalEntryTemplate === void 0 ? void 0 : journalEntryTemplate.Memo) !== null && _c !== void 0 ? _c : memo,
            JournalEntryLines: (_d = journalEntryTemplate === null || journalEntryTemplate === void 0 ? void 0 : journalEntryTemplate.JournalEntryLines) !== null && _d !== void 0 ? _d : [],
        })}.`);
    }
}
