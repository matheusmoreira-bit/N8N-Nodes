"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseOrder = purchaseOrder;
const n8n_workflow_1 = require("n8n-workflow");
const ERPSAPB1Builders_1 = require("../../../transport/ERPSAPB1Builders");
const date_1 = require("../../../utils/date");
function isSapDocumentLineArray(value) {
    return Array.isArray(value) && value.every((lineValue) => {
        if (typeof lineValue !== 'object' || lineValue === null) {
            return false;
        }
        const documentLine = lineValue;
        return Boolean(documentLine.ItemCode
            && documentLine.ItemDescription
            && documentLine.Quantity !== undefined
            && documentLine.UnitPrice !== undefined);
    });
}
function isPurchaseOrderLineInputArray(value) {
    return Array.isArray(value) && value.every((lineValue) => typeof lineValue === 'object' && lineValue !== null && 'itemCode' in lineValue);
}
function parseDocumentLinesJson(rawValue) {
    try {
        return JSON.parse(rawValue);
    }
    catch {
        throw new Error('O JSON informado para documentLines é invalido.');
    }
}
function resolveDocumentLines(documentLinesMode, manualDocumentLines, documentLinesJson) {
    var _a;
    if (documentLinesMode === 'manual') {
        if (!((_a = manualDocumentLines.lineValues) === null || _a === void 0 ? void 0 : _a.length)) {
            throw new Error('Informe ao menos um item para criar o pedido de compra.');
        }
        return (0, ERPSAPB1Builders_1.buildPurchaseOrderLines)(manualDocumentLines.lineValues);
    }
    const parsedDocumentLines = parseDocumentLinesJson(documentLinesJson);
    if (isSapDocumentLineArray(parsedDocumentLines)) {
        return parsedDocumentLines;
    }
    if (isPurchaseOrderLineInputArray(parsedDocumentLines)) {
        return (0, ERPSAPB1Builders_1.buildPurchaseOrderLines)(parsedDocumentLines);
    }
    if (typeof parsedDocumentLines === 'object'
        && parsedDocumentLines !== null
        && 'lineValues' in parsedDocumentLines
        && isPurchaseOrderLineInputArray(parsedDocumentLines.lineValues)) {
        return (0, ERPSAPB1Builders_1.buildPurchaseOrderLines)(parsedDocumentLines.lineValues);
    }
    throw new Error('O JSON de documentLines deve ser um array no formato SAP ou um array de itens no formato simplificado do node.');
}
function resolveOptionalSapDate(value) {
    return value ? (0, date_1.toSapDate)(value) : undefined;
}
function resolveRequiredSapDate(value) {
    if (value) {
        return (0, date_1.toSapDate)(value);
    }
    return (0, date_1.toSapDate)(new Date());
}
function safeTrim(value) {
    if (value === null || value === undefined) {
        return '';
    }
    return String(value).trim();
}
function normalizeDocCurrency(value) {
    const normalized = safeTrim(value);
    if (!normalized) {
        return undefined;
    }
    if (normalized.toUpperCase() === 'BRL' || normalized === 'R$') {
        return undefined;
    }
    return normalized;
}
function resolveOptionalNumber(value) {
    if (value === null || value === undefined || value === '') {
        return undefined;
    }
    if (typeof value === 'number') {
        return Number.isNaN(value) || value <= 0 ? undefined : value;
    }
    const normalized = String(value).trim().replace(',', '.');
    if (!normalized) {
        return undefined;
    }
    const parsed = Number(normalized);
    return Number.isNaN(parsed) || parsed <= 0 ? undefined : parsed;
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
function normalizeForComparison(value) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}
function resolveDynamicFieldValue(dynamicFields, fieldNames) {
    if (!(dynamicFields === null || dynamicFields === void 0 ? void 0 : dynamicFields.length)) {
        return '';
    }
    const normalizedFieldNames = fieldNames.map((fieldName) => fieldName.toLowerCase());
    const matchedField = dynamicFields.find((field) => normalizedFieldNames.includes(String(field.name).toLowerCase()));
    return safeTrim(matchedField === null || matchedField === void 0 ? void 0 : matchedField.value);
}
async function purchaseOrder(api, index) {
    var _a, _b, _c, _d;
    const cardCode = safeTrim(this.getNodeParameter('cardCode', index, ''));
    const supplierDocument = safeTrim(this.getNodeParameter('supplierDocument', index, ''));
    const docDate = resolveRequiredSapDate(this.getNodeParameter('docDate', index, ''));
    const dueDate = resolveRequiredSapDate(this.getNodeParameter('dueDate', index, ''));
    const taxDate = resolveRequiredSapDate(this.getNodeParameter('taxDate', index, ''));
    const bplId = this.getNodeParameter('bplId', index, undefined);
    const comments = this.getNodeParameter('comments', index, '');
    const journalMemo = this.getNodeParameter('journalMemo', index, '');
    const docCurrency = normalizeDocCurrency(this.getNodeParameter('docCurrency', index, ''));
    const docRateRaw = this.getNodeParameter('docRate', index, undefined);
    const docRate = resolveOptionalNumber(docRateRaw);
    const documentLinesMode = this.getNodeParameter('documentLinesMode', index, 'manual');
    const { dynamicFields } = this.getNodeParameter('dynamicFields', index, {});
    const manualDocumentLines = this.getNodeParameter('documentLines', index, {});
    const documentLinesJson = this.getNodeParameter('documentLinesJson', index, '[]');
    const optionalFields = this.getNodeParameter('optionalFields', index, {});
    try {
        let resolvedDocCurrency = docCurrency;
        if (resolvedDocCurrency) {
            const currencyCodes = await api.listCurrencyCodes();
            const directMatch = currencyCodes.find((code) => code === resolvedDocCurrency);
            const normalizedInput = normalizeForComparison(resolvedDocCurrency);
            const looseMatch = currencyCodes.find((code) => normalizeForComparison(code) === normalizedInput);
            if (directMatch) {
                resolvedDocCurrency = directMatch;
            }
            else if (looseMatch) {
                resolvedDocCurrency = looseMatch;
            }
            else {
                throw new Error(`Moeda "${resolvedDocCurrency}" não encontrada no SAP. Use um dos códigos cadastrados: ${currencyCodes.join(', ')}`);
            }
        }
        let resolvedCardCode = cardCode || resolveDynamicFieldValue(dynamicFields, ['CardCode', 'cardCode']);
        const resolvedSupplierDocument = supplierDocument || resolveDynamicFieldValue(dynamicFields, ['supplierDocument', 'SupplierDocument', 'taxId0', 'TaxId0', 'FederalTaxID']);
        if (!resolvedCardCode && resolvedSupplierDocument) {
            const supplier = await api.getSupplierByDocument(resolvedSupplierDocument);
            if (!(supplier === null || supplier === void 0 ? void 0 : supplier.BPCode)) {
                throw new Error(`Nao foi possivel localizar fornecedor no SAP para o documento ${resolvedSupplierDocument}.`);
            }
            resolvedCardCode = supplier.BPCode;
        }
        if (!resolvedCardCode) {
            throw new Error('Informe CardCode ou CNPJ/CPF do fornecedor para criar o pedido de compra.');
        }
        const purchaseOrder = (0, ERPSAPB1Builders_1.applyDynamicFields)({
            CardCode: resolvedCardCode,
            DocDate: docDate,
            DocDueDate: dueDate,
            TaxDate: taxDate,
            BPL_IDAssignedToInvoice: bplId,
            Comments: comments || undefined,
            JournalMemo: journalMemo || undefined,
            DocCurrency: resolvedDocCurrency,
            DocRate: docRate,
            U_FGR_RATEIO_CC: 'N',
            U_FGR_CONTRATO: 'N',
            AttachmentEntry: (_a = optionalFields.attachmentEntry) !== null && _a !== void 0 ? _a : undefined,
            SequenceCode: (_b = optionalFields.sequenceCode) !== null && _b !== void 0 ? _b : undefined,
            SequenceModel: (_c = optionalFields.sequenceModel) !== null && _c !== void 0 ? _c : undefined,
            SequenceSerial: (_d = optionalFields.sequenceSerial) !== null && _d !== void 0 ? _d : undefined,
            DocumentLines: resolveDocumentLines(documentLinesMode, manualDocumentLines, documentLinesJson),
        }, dynamicFields);
        const createdPurchaseOrder = await api.createPurchaseOrder(purchaseOrder);
        return this.helpers.returnJsonArray([createdPurchaseOrder]);
    }
    catch (error) {
        if (error instanceof n8n_workflow_1.NodeOperationError) {
            throw error;
        }
        const detailedMessage = extractDetailedErrorMessage(error);
        if (detailedMessage) {
            throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Nao foi possivel criar o pedido de compra. Detalhe: ${detailedMessage}.`);
        }
        throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Nao foi possivel criar o pedido de compra.');
    }
}
