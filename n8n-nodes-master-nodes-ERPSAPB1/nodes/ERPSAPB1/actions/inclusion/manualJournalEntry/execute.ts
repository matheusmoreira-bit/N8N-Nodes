import { IExecuteFunctions, INodeExecutionData, NodeOperationError } from 'n8n-workflow';

import { ERPSAPB1Api } from '../../../transport/ERPSAPB1Api';
import {
    ICreatedJournalEntry,
    IJournalEntryLine,
    IJournalEntryTemplate,
} from '../../../transport/Interfaces';
import { toSapDate } from '../../../utils/date';

interface IManualJournalLineInput {
    accountCode: string;
    debit: number;
    credit: number;
    bplId?: number;
    projectCode?: string;
    costingCode?: string;
    dueDate?: string;
    taxDate?: string;
}

interface IJournalLineParameter {
    lineEntryValues?: IManualJournalLineInput[];
}

function parseJournalLinesJson(rawValue: string): unknown {
    try {
        return JSON.parse(rawValue);
    } catch {
        throw new Error('O JSON informado para JournalEntryLines é inválido.');
    }
}

function isJournalEntryLineArray(value: unknown): value is IJournalEntryLine[] {
    return Array.isArray(value) && value.every((line) => typeof line === 'object' && line !== null && 'AccountCode' in line);
}

function normalizeText(value: unknown): string {
    if (value === null || value === undefined) {
        return '';
    }

    return String(value).trim();
}

function normalizeOptionalNumber(value: unknown): number | undefined {
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

function formatAmount(value: unknown): number {
    const parsed = normalizeOptionalNumber(value) ?? 0;
    return Number(parsed.toFixed(2));
}

function assertJournalIsBalanced(lines: IJournalEntryLine[]): void {
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

function extractDetailedErrorMessage(error: unknown): string | undefined {
    const axiosError = error as {
        response?: {
            data?: {
                error?: {
                    message?: {
                        value?: string;
                    } | string;
                };
                detail?: string;
                message?: string;
            };
        };
        message?: string;
    };

    const errorMessageValue = axiosError.response?.data?.error?.message;
    if (typeof errorMessageValue === 'string' && errorMessageValue) {
        return errorMessageValue;
    }

    if (typeof errorMessageValue === 'object' && errorMessageValue?.value) {
        return errorMessageValue.value;
    }

    if (axiosError.response?.data?.detail) {
        return axiosError.response.data.detail;
    }

    if (axiosError.response?.data?.message) {
        return axiosError.response.data.message;
    }

    return axiosError.message;
}

function buildManualLines(lines: IManualJournalLineInput[]): IJournalEntryLine[] {
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
            DueDate: normalizeText(line.dueDate) ? toSapDate(line.dueDate as string) : undefined,
            TaxDate: normalizeText(line.taxDate) ? toSapDate(line.taxDate as string) : undefined,
            LineMemo: '',
        } as IJournalEntryLine;
    });

    assertJournalIsBalanced(normalizedLines);
    return normalizedLines;
}

function resolveJournalEntryLines(journalLinesMode: string, manualLines: IJournalLineParameter, journalLinesJson: string): IJournalEntryLine[] {
    if (journalLinesMode === 'manual') {
        return buildManualLines(manualLines.lineEntryValues ?? []);
    }

    const parsed = parseJournalLinesJson(journalLinesJson);

    if (isJournalEntryLineArray(parsed)) {
        assertJournalIsBalanced(parsed);
        return parsed;
    }

    if (
        typeof parsed === 'object'
        && parsed !== null
        && 'JournalEntryLines' in parsed
        && isJournalEntryLineArray((parsed as { JournalEntryLines: unknown }).JournalEntryLines)
    ) {
        const lines = (parsed as { JournalEntryLines: IJournalEntryLine[] }).JournalEntryLines;
        assertJournalIsBalanced(lines);
        return lines;
    }

    throw new Error('O JSON de JournalEntryLines deve ser um array no formato SAP.');
}

export async function manualJournalEntry(this: IExecuteFunctions, api: ERPSAPB1Api, index: number): Promise<INodeExecutionData[]> {
    const referenceDate = toSapDate(this.getNodeParameter('referenceDate', index) as string);
    const memo = normalizeText(this.getNodeParameter('memo', index));
    const journalLinesMode = this.getNodeParameter('journalLinesMode', index, 'manual') as string;
    const manualLines = this.getNodeParameter('lineEntries', index, {}) as IJournalLineParameter;
    const journalLinesJson = this.getNodeParameter('journalLinesJson', index, '[]') as string;
    let journalEntryTemplate: Partial<IJournalEntryTemplate> | undefined;

    try {
        journalEntryTemplate = {
            ReferenceDate: referenceDate,
            Memo: memo,
            JournalEntryLines: resolveJournalEntryLines(journalLinesMode, manualLines, journalLinesJson),
        };

        const createdJournalEntry = await api.createJournalEntry(journalEntryTemplate);

        return this.helpers.returnJsonArray([createdJournalEntry as unknown as ICreatedJournalEntry]);
    } catch (error: unknown) {
        if (error instanceof NodeOperationError) {
            throw error;
        }

        const detailedMessage = extractDetailedErrorMessage(error) ?? (error instanceof Error ? error.message : 'Erro desconhecido.');
        throw new NodeOperationError(
            this.getNode(),
            `Nao foi possivel criar o lançamento contábil. Detalhe: ${detailedMessage}. Payload: ${JSON.stringify({
                ReferenceDate: journalEntryTemplate?.ReferenceDate ?? referenceDate,
                Memo: journalEntryTemplate?.Memo ?? memo,
                JournalEntryLines: journalEntryTemplate?.JournalEntryLines ?? [],
            })}.`,
        );
    }
}
