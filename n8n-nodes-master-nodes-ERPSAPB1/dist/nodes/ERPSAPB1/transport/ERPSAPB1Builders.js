"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyDynamicFields = applyDynamicFields;
exports.buildPurchaseOrderLines = buildPurchaseOrderLines;
exports.buildManualJournalLines = buildManualJournalLines;
function removeEmptyProperties(value) {
    return Object.fromEntries(Object.entries(value).filter(([, entryValue]) => entryValue !== undefined && entryValue !== null && entryValue !== ''));
}
function removeEmptyPropertiesKeeping(value, keepEmptyStringKeys) {
    return Object.fromEntries(Object.entries(value).filter(([entryKey, entryValue]) => {
        if (entryValue === '') {
            return keepEmptyStringKeys.includes(entryKey);
        }
        return entryValue !== undefined && entryValue !== null;
    }));
}
function applyDynamicFields(value, dynamicFields) {
    const mutableValue = value;
    dynamicFields === null || dynamicFields === void 0 ? void 0 : dynamicFields.forEach((field) => {
        mutableValue[field.name] = field.value;
    });
    return value;
}
function toAmountInCents(value) {
    return Math.round(Number(value) * 100);
}
function parseDecimal(value) {
    if (typeof value === 'number') {
        return Number.isNaN(value) ? undefined : value;
    }
    const textValue = `${value !== null && value !== void 0 ? value : ''}`.trim();
    if (!textValue) {
        return undefined;
    }
    const numericText = textValue.replace(/[^\d,.-]/g, '');
    const normalized = numericText.includes(',')
        ? numericText.replace(/\./g, '').replace(',', '.')
        : numericText;
    const parsed = Number(normalized);
    return Number.isNaN(parsed) ? undefined : parsed;
}
function buildPurchaseOrderLines(lineValues) {
    if (!lineValues.length) {
        throw new Error('Informe ao menos um item para criar o pedido de compra.');
    }
    return lineValues.map((lineValue) => {
        var _a, _b, _c, _d, _e, _f;
        if (!lineValue.itemCode || !lineValue.itemDescription) {
            throw new Error('Cada item deve conter ItemCode e ItemDescription.');
        }
        const quantity = parseDecimal(lineValue.quantity);
        const unitPrice = parseDecimal(lineValue.unitPrice);
        if (quantity === undefined || unitPrice === undefined) {
            throw new Error('Cada item deve conter Quantity e UnitPrice.');
        }
        const documentLine = applyDynamicFields({
            ItemCode: lineValue.itemCode,
            ItemDescription: lineValue.itemDescription,
            TaxCode: (_a = lineValue.taxCode) !== null && _a !== void 0 ? _a : '',
            Quantity: quantity,
            UnitPrice: unitPrice,
            CFOPCode: lineValue.cfopCode,
            Usage: lineValue.usage,
            WarehouseCode: lineValue.warehouseCode || '99',
            AccountCode: lineValue.accountCode,
            CostingCode: lineValue.costingCode || ((_b = lineValue.costingCodes) === null || _b === void 0 ? void 0 : _b.costingCode),
            CostingCode2: (_c = lineValue.costingCodes) === null || _c === void 0 ? void 0 : _c.costingCode2,
            CostingCode3: (_d = lineValue.costingCodes) === null || _d === void 0 ? void 0 : _d.costingCode3,
            CostingCode4: (_e = lineValue.costingCodes) === null || _e === void 0 ? void 0 : _e.costingCode4,
            ProjectCode: lineValue.projectCode,
            U_FGR_TIPO_LANC: lineValue.tipoLancamento || 'D',
        }, (_f = lineValue.dynamicFields) === null || _f === void 0 ? void 0 : _f.dynamicFields);
        return removeEmptyPropertiesKeeping(documentLine, ['TaxCode']);
    });
}
function isJournalBalanced(lineValues) {
    const totalDebit = lineValues
        .filter((lineValue) => lineValue.debitOrCreditIndicator === 'debit')
        .reduce((sum, lineValue) => sum + toAmountInCents(lineValue.amount), 0);
    const totalCredit = lineValues
        .filter((lineValue) => lineValue.debitOrCreditIndicator === 'credit')
        .reduce((sum, lineValue) => sum + toAmountInCents(lineValue.amount), 0);
    return totalDebit === totalCredit;
}
function buildManualJournalLines(branchId, lineValues, businessPartnerCode) {
    if (lineValues.length < 2) {
        throw new Error('Informe ao menos duas linhas para o lancamento contabil manual.');
    }
    if (!isJournalBalanced(lineValues)) {
        throw new Error('As linhas de debito e credito precisam estar balanceadas.');
    }
    return lineValues.map((lineValue) => {
        var _a;
        const amount = Number(lineValue.amount).toFixed(2);
        const journalLine = applyDynamicFields({
            AccountCode: lineValue.accountCode,
            Debit: lineValue.debitOrCreditIndicator === 'debit' ? amount : '0.00',
            Credit: lineValue.debitOrCreditIndicator === 'credit' ? amount : '0.00',
            LineMemo: lineValue.lineMemo,
            BPLID: branchId,
            ShortName: businessPartnerCode,
            ProjectCode: lineValue.projectCode,
            CostingCode: lineValue.costingCode,
            DueDate: lineValue.dueDate,
            TaxDate: lineValue.taxDate,
        }, (_a = lineValue.dynamicFields) === null || _a === void 0 ? void 0 : _a.dynamicFields);
        return removeEmptyProperties(journalLine);
    });
}
