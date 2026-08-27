"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const cnab240Sicoob_1 = require("../../../utils/cnab240Sicoob");
const date_1 = require("../../../utils/date");
function toStringValue(value) {
    return `${value !== null && value !== void 0 ? value : ''}`.trim();
}
function onlyDigits(value) {
    return toStringValue(value).replace(/\D/g, '');
}
function parseAmount(value) {
    if (typeof value === 'number') {
        return value;
    }
    const stringValue = toStringValue(value);
    if (!stringValue) {
        return 0;
    }
    const valueWithoutCurrency = stringValue.replace(/[^\d,.-]/g, '');
    const lastCommaIndex = valueWithoutCurrency.lastIndexOf(',');
    const lastDotIndex = valueWithoutCurrency.lastIndexOf('.');
    const decimalSeparator = lastCommaIndex > lastDotIndex ? ',' : '.';
    const normalizedValue = valueWithoutCurrency
        .replace(new RegExp(`\\${decimalSeparator === ',' ? '.' : ','}`, 'g'), '')
        .replace(decimalSeparator, '.');
    const parsedValue = Number(normalizedValue);
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
}
function detectTipoInscricao(document, defaultValue) {
    if (defaultValue !== 'auto') {
        return defaultValue;
    }
    return onlyDigits(document).length <= 11 ? '1' : '2';
}
function splitValueAndDigit(value, explicitDigit = '') {
    const trimmedValue = value.trim();
    const trimmedDigit = explicitDigit.trim();
    if (trimmedDigit) {
        return { value: trimmedValue, digit: trimmedDigit };
    }
    const match = /^(.+?)[\s\-/]([0-9A-Za-z])$/.exec(trimmedValue);
    if (!match) {
        return { value: trimmedValue, digit: '' };
    }
    return {
        value: match[1].trim(),
        digit: match[2].trim(),
    };
}
function normalizeBarcode(value) {
    const digits = onlyDigits(value);
    if (digits.length === 44) {
        return digits;
    }
    if (digits.length === 47) {
        return [
            digits.slice(0, 4),
            digits.slice(32, 33),
            digits.slice(33, 47),
            digits.slice(4, 9),
            digits.slice(10, 20),
            digits.slice(21, 31),
        ].join('');
    }
    return digits;
}
function formatDatePart(value) {
    return `${value.getDate()}`.padStart(2, '0')
        + `${value.getMonth() + 1}`.padStart(2, '0')
        + `${value.getFullYear()}`.slice(-2);
}
function resolveFileName(fileName, fileSequence, generationDate) {
    const trimmedFileName = fileName.trim();
    if (trimmedFileName && !trimmedFileName.includes('{{')) {
        return trimmedFileName.toUpperCase().endsWith('.REM')
            ? trimmedFileName
            : `${trimmedFileName}.REM`;
    }
    return `PG${formatDatePart(generationDate)}${`${fileSequence}`.padStart(2, '0')}.REM`;
}
function appendUniquePath(paths, path) {
    if (!paths.includes(path)) {
        paths.push(path);
    }
}
function withBusinessPartnerPaths(paths) {
    const prefixes = [
        'businessPartner',
        'BusinessPartner',
        'Card',
        'supplier',
        'fornecedor',
    ];
    const allPaths = [...paths];
    for (const path of paths) {
        for (const prefix of prefixes) {
            appendUniquePath(allPaths, `${prefix}.${path}`);
        }
    }
    return allPaths;
}
function normalizeKey(value) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}
function findValueByKey(value, keys) {
    if (!value || typeof value !== 'object') {
        return undefined;
    }
    const normalizedKeys = keys.map(normalizeKey);
    for (const [objectKey, objectValue] of Object.entries(value)) {
        if (normalizedKeys.includes(normalizeKey(objectKey))
            && objectValue !== undefined
            && objectValue !== null
            && `${objectValue}`.trim() !== '') {
            return objectValue;
        }
        const nestedValue = findValueByKey(objectValue, keys);
        if (nestedValue !== undefined && nestedValue !== null && `${nestedValue}`.trim() !== '') {
            return nestedValue;
        }
    }
    return undefined;
}
function getFirstJsonValue(item, paths, fallback = '') {
    var _a;
    for (const path of paths) {
        const value = (0, cnab240Sicoob_1.getJsonValue)(item, path);
        if (value !== undefined && value !== null && `${value}`.trim() !== '') {
            return value;
        }
    }
    return (_a = findValueByKey(item, paths)) !== null && _a !== void 0 ? _a : fallback;
}
function isBarcodeKey(key) {
    const normalizedKey = normalizeKey(key);
    return normalizedKey.includes('barras')
        || normalizedKey.includes('barcode')
        || normalizedKey.includes('linhadigitavel')
        || normalizedKey.includes('fichacompensacao');
}
function findBarcodeByKey(value) {
    if (!value || typeof value !== 'object') {
        return undefined;
    }
    for (const [objectKey, objectValue] of Object.entries(value)) {
        if (isBarcodeKey(objectKey)
            && objectValue !== undefined
            && objectValue !== null
            && `${objectValue}`.trim() !== '') {
            return objectValue;
        }
        const nestedValue = findBarcodeByKey(objectValue);
        if (nestedValue !== undefined && nestedValue !== null && `${nestedValue}`.trim() !== '') {
            return nestedValue;
        }
    }
    return undefined;
}
function getBarcodeValue(item) {
    return getFirstJsonValue(item, fieldPaths.codigoBarras, findBarcodeByKey(item));
}
function listAvailableKeys(value, prefix = '') {
    if (!value || typeof value !== 'object') {
        return [];
    }
    return Object.entries(value).flatMap(([key, nestedValue]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        return [fullKey, ...listAvailableKeys(nestedValue, fullKey)];
    });
}
function warn(warnings, itemIndex, fieldName, message) {
    warnings.push({
        item: itemIndex + 1,
        field: fieldName,
        message,
    });
}
function requireOrFallback(value, fieldName, itemIndex, ignorePaymentErrors, warnings, fallback = '') {
    if (value) {
        return value;
    }
    if (!ignorePaymentErrors) {
        throw new Error(`Campo obrigatório '${fieldName}' não encontrado no item ${itemIndex + 1}.`);
    }
    warn(warnings, itemIndex, fieldName, `Campo ausente. Gerado com '${fallback || 'branco/zero'}'.`);
    return fallback;
}
function isUuidV4(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}
function inferPixKeyType(value) {
    const trimmedValue = value.trim();
    const digits = onlyDigits(trimmedValue);
    if (isUuidV4(trimmedValue)) {
        return '004';
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        return '002';
    }
    if (/^\+?\d{12,13}$/.test(trimmedValue) || /^\d{12,13}$/.test(digits)) {
        return '001';
    }
    if (digits.length === 11 || digits.length === 14) {
        return '003';
    }
    throw new Error(`Tipo de chave PIX não identificado: ${trimmedValue}`);
}
function isPixLikePayment(json) {
    const tipoPagamento = toStringValue(getFirstJsonValue(json, fieldPaths.tipoPagamento)).toUpperCase();
    const tipoDocumento = toStringValue(getFirstJsonValue(json, fieldPaths.tipoDocumento)).toUpperCase();
    return tipoPagamento === 'PIX'
        || tipoPagamento.includes('PIX')
        || tipoDocumento === 'PIX'
        || Boolean(toStringValue(getFirstJsonValue(json, fieldPaths.chavePix)));
}
function getPaymentAmount(json) {
    return parseAmount(getFirstJsonValue(json, fieldPaths.valor));
}
function normalizeDate(value) {
    return value ? (0, date_1.toSapDate)(value) : '';
}
function isDateInRange(value, dateFrom, dateTo) {
    return Boolean(value) && value >= dateFrom && value <= dateTo;
}
function getArrayValue(value) {
    return Array.isArray(value)
        ? value.filter((entry) => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry))
        : [];
}
function getInstallments(invoice) {
    return [
        'DocumentInstallments',
        'Installments',
        'Document_Installments',
        'Parcelas',
    ].flatMap((path) => getArrayValue((0, cnab240Sicoob_1.getJsonValue)(invoice, path)));
}
function getOpenAmount(value) {
    const explicitOpenAmount = getFirstJsonValue(value, [
        'sourceOpenAmount',
        'OpenAmount',
        'openAmount',
        'Saldo',
        'saldo',
        'SaldoAberto',
        'ValorAberto',
        'U_ValorAberto',
    ]);
    const openAmount = parseAmount(explicitOpenAmount);
    if (openAmount > 0) {
        return openAmount;
    }
    const total = parseAmount(getFirstJsonValue(value, [
        'Total',
        'InstallmentTotal',
        'InsTotal',
        'Amount',
        'DocTotal',
        'DocTotalSy',
    ]));
    const paid = parseAmount(getFirstJsonValue(value, [
        'PaidToDate',
        'PaidAmount',
        'PaidSum',
        'ValorPago',
    ]));
    return Math.max(total - paid, 0);
}
function getDueDate(value) {
    return normalizeDate(getFirstJsonValue(value, [
        'sourceDueDate',
        'DueDate',
        'DocDueDate',
        'TaxDate',
        'InstallmentDueDate',
        'U_DataVencimento',
        'data_vencimento',
    ]));
}
function expandPurchaseInvoice(invoice, dateFrom, dateTo) {
    const installments = getInstallments(invoice);
    if (installments.length === 0) {
        const dueDate = getDueDate(invoice);
        const openAmount = getOpenAmount(invoice);
        return openAmount > 0 && isDateInRange(dueDate, dateFrom, dateTo)
            ? [{
                    ...invoice,
                    sapSource: 'purchaseInvoice',
                    sourceDocEntry: Number(invoice.DocEntry),
                    sourceDocNum: Number(invoice.DocNum),
                    sourceOpenAmount: openAmount,
                    sourceDueDate: dueDate,
                }]
            : [];
    }
    return installments.flatMap((installment) => {
        const merged = {
            ...invoice,
            ...installment,
        };
        const dueDate = getDueDate(merged);
        const openAmount = getOpenAmount(merged);
        if (openAmount <= 0 || !isDateInRange(dueDate, dateFrom, dateTo)) {
            return [];
        }
        return [{
                ...merged,
                sapSource: 'purchaseInvoiceInstallment',
                sapInvoice: invoice,
                sapInstallment: installment,
                sourceDocEntry: Number(invoice.DocEntry),
                sourceDocNum: Number(invoice.DocNum),
                sourceInstallmentId: Number(getFirstJsonValue(installment, ['InstallmentId', 'InstlmntID', 'InstallmentNumber'], undefined)),
                sourceOpenAmount: openAmount,
                sourceDueDate: dueDate,
            }];
    });
}
function extractInputPayables(inputItems, dateFrom, dateTo) {
    const arrayKeys = ['items', 'data', 'result', 'results', 'value', 'contasAPagar', 'accountsPayable'];
    const rawItems = [];
    for (const item of inputItems) {
        let expanded = false;
        for (const key of arrayKeys) {
            const value = (0, cnab240Sicoob_1.getJsonValue)(item.json, key);
            if (Array.isArray(value)) {
                rawItems.push(...value.filter((entry) => Boolean(entry) && typeof entry === 'object' && !Array.isArray(entry)));
                expanded = true;
                break;
            }
        }
        if (!expanded && Object.keys(item.json).length > 0) {
            rawItems.push(item.json);
        }
    }
    return rawItems.flatMap((item) => {
        const installments = getInstallments(item);
        if (installments.length > 0 || item.DocumentStatus || item.DocEntry) {
            return expandPurchaseInvoice(item, dateFrom, dateTo);
        }
        const dueDate = getDueDate(item);
        const openAmount = getOpenAmount(item);
        return openAmount > 0 && isDateInRange(dueDate, dateFrom, dateTo)
            ? [{
                    ...item,
                    sapSource: 'inputPayable',
                    sourceOpenAmount: openAmount,
                    sourceDueDate: dueDate,
                }]
            : [];
    });
}
async function fetchBusinessPartner(api, payable, cache, warnings, itemIndex) {
    const cardCode = toStringValue(getFirstJsonValue(payable, ['CardCode', 'BPCode', 'cardCode']));
    if (!cardCode) {
        return payable;
    }
    try {
        let businessPartner = cache.get(cardCode);
        if (!businessPartner) {
            businessPartner = await api.getBusinessPartner(cardCode);
            cache.set(cardCode, businessPartner);
        }
        return {
            ...payable,
            businessPartner,
        };
    }
    catch (error) {
        warn(warnings, itemIndex, 'BusinessPartner', `Não foi possível consultar o fornecedor ${cardCode}: ${error.message}`);
        return payable;
    }
}
async function createVendorPaymentForInvoice(api, payable, paymentDate, cashAccount, docCurrency, remarks) {
    var _a, _b;
    const sourceDocEntry = payable.sourceDocEntry;
    if (!sourceDocEntry) {
        throw new Error('DocEntry da NF de entrada não encontrado para criação do VendorPayment.');
    }
    const paymentInvoice = {
        DocEntry: sourceDocEntry,
        SumApplied: (_a = payable.sourceOpenAmount) !== null && _a !== void 0 ? _a : getOpenAmount(payable),
        InvoiceType: 'it_PurchaseInvoice',
    };
    if (payable.sourceInstallmentId && !Number.isNaN(payable.sourceInstallmentId)) {
        paymentInvoice.InstallmentId = payable.sourceInstallmentId;
    }
    const payload = {
        DocDate: paymentDate,
        TaxDate: paymentDate,
        CardCode: toStringValue(getFirstJsonValue(payable, ['CardCode', 'BPCode'])),
        DocCurrency: docCurrency || undefined,
        CashAccount: cashAccount,
        CashSum: (_b = payable.sourceOpenAmount) !== null && _b !== void 0 ? _b : getOpenAmount(payable),
        Remarks: remarks || undefined,
        PaymentInvoices: [paymentInvoice],
    };
    return api.createVendorPayment(payload);
}
async function fetchSapPayables(api, dateFrom, dateTo, includePurchaseInvoices, purchaseInvoicesMaxPages, additionalPayablesQuery, additionalPayablesMaxPages) {
    const payables = [];
    if (includePurchaseInvoices) {
        let invoices;
        const query = {
            $filter: `DocumentStatus eq 'bost_Open' and DocDueDate ge '${dateFrom}' and DocDueDate le '${dateTo}'`,
            $orderby: 'DocDueDate asc, DocEntry asc',
        };
        try {
            invoices = await api.queryCollection('/PurchaseInvoices', query, purchaseInvoicesMaxPages || undefined);
        }
        catch {
            invoices = await api.queryCollection('/PurchaseInvoices', {
                $filter: query.$filter,
            }, purchaseInvoicesMaxPages || undefined);
        }
        payables.push(...invoices.flatMap((invoice) => expandPurchaseInvoice(invoice, dateFrom, dateTo)));
    }
    if (additionalPayablesQuery.trim()) {
        const additionalPayables = await api.queryCollection(additionalPayablesQuery.trim(), undefined, additionalPayablesMaxPages || undefined);
        payables.push(...additionalPayables.flatMap((payable) => {
            const dueDate = getDueDate(payable);
            const openAmount = getOpenAmount(payable);
            return openAmount > 0 && isDateInRange(dueDate, dateFrom, dateTo)
                ? [{
                        ...payable,
                        sapSource: 'additionalPayable',
                        sourceOpenAmount: openAmount,
                        sourceDueDate: dueDate,
                    }]
                : [];
        }));
    }
    return payables;
}
function toPaymentData(json, index, company, paymentDate, tipoInscricaoFavorecidoDefault, ignorePaymentErrors, warnings, skippedPayments) {
    const codigoBarras = normalizeBarcode(getBarcodeValue(json));
    const numeroInscricaoFavorecido = toStringValue(getFirstJsonValue(json, fieldPaths.numeroInscricaoFavorecido));
    const dataVencimento = toStringValue(getFirstJsonValue(json, fieldPaths.dataVencimento, json.sourceDueDate));
    const dataPagamento = paymentDate || dataVencimento;
    const rawValor = getFirstJsonValue(json, fieldPaths.valor);
    const valor = getPaymentAmount(json);
    if (valor <= 0) {
        const availableKeys = listAvailableKeys(json).slice(0, 80).join(', ');
        if (!ignorePaymentErrors) {
            throw new Error(`Valor de pagamento inválido no item ${index + 1}. Valor encontrado: '${toStringValue(rawValor) || 'vazio'}'. Campos disponíveis: ${availableKeys || 'nenhum'}.`);
        }
        warn(warnings, index, 'Valor do Pagamento', `Valor inválido ou ausente ('${toStringValue(rawValor) || 'vazio'}'). Pagamento ignorado.`);
        skippedPayments.push({ item: index + 1, reason: 'Valor de pagamento inválido ou ausente' });
        return undefined;
    }
    if (codigoBarras) {
        if (codigoBarras.length !== 44) {
            if (!ignorePaymentErrors) {
                throw new Error(`Código de barras/linha digitável inválido no item ${index + 1}. Esperado 44 ou 47 dígitos, recebido ${codigoBarras.length}.`);
            }
            warn(warnings, index, 'Código de Barras', `Código de barras/linha digitável inválido (${codigoBarras.length} dígitos). Pagamento ignorado.`);
            skippedPayments.push({ item: index + 1, reason: 'Código de barras/linha digitável inválido' });
            return undefined;
        }
        return {
            codigoBarras,
            codigoBancoFavorecido: '',
            agenciaFavorecido: '',
            agenciaDvFavorecido: '',
            contaFavorecido: '',
            contaDvFavorecido: '',
            nomeFavorecido: toStringValue(getFirstJsonValue(json, fieldPaths.nomeFavorecido)),
            tipoInscricaoFavorecido: numeroInscricaoFavorecido
                ? detectTipoInscricao(numeroInscricaoFavorecido, tipoInscricaoFavorecidoDefault)
                : '',
            numeroInscricaoFavorecido,
            nomePagador: company.nome,
            tipoInscricaoPagador: company.tipoInscricao,
            numeroInscricaoPagador: company.numeroInscricao,
            logradouroFavorecido: '',
            numeroEnderecoFavorecido: '',
            complementoFavorecido: '',
            bairroFavorecido: '',
            cidadeFavorecido: '',
            cepFavorecido: '',
            ufFavorecido: '',
            dataPagamento: requireOrFallback(dataPagamento, 'Data de Pagamento', index, ignorePaymentErrors, warnings),
            dataVencimento,
            valor,
            numeroDocumento: toStringValue(getFirstJsonValue(json, fieldPaths.numeroDocumento, getFirstJsonValue(json, fieldPaths.seuNumero))),
            seuNumero: toStringValue(getFirstJsonValue(json, fieldPaths.seuNumero, getFirstJsonValue(json, fieldPaths.numeroDocumento))),
        };
    }
    if (isPixLikePayment(json)) {
        const chavePix = toStringValue(getFirstJsonValue(json, fieldPaths.chavePix, numeroInscricaoFavorecido));
        const tipoChavePix = chavePix ? inferPixKeyType(chavePix) : '';
        const pixDocument = numeroInscricaoFavorecido || (tipoChavePix === '003' ? onlyDigits(chavePix) : '');
        const nomeFavorecido = toStringValue(getFirstJsonValue(json, fieldPaths.nomeFavorecido));
        const missingPixFields = [
            chavePix ? '' : 'Chave Pix',
            pixDocument ? '' : 'CPF/CNPJ do Favorecido',
            nomeFavorecido ? '' : 'Nome do Favorecido',
        ].filter(Boolean);
        if (missingPixFields.length > 0) {
            if (!ignorePaymentErrors) {
                throw new Error(`PIX sem dados suficientes no item ${index + 1}. Campos faltantes: ${missingPixFields.join(', ')}.`);
            }
            warn(warnings, index, 'PIX', `Pagamento identificado como PIX sem dados suficientes. Campos faltantes: ${missingPixFields.join(', ')}.`);
            skippedPayments.push({ item: index + 1, reason: 'PIX sem chave ou identificação do favorecido', missingFields: missingPixFields });
            return undefined;
        }
        return {
            tipoPagamento: 'PIX',
            tipoChavePix,
            chavePix,
            txIdPix: toStringValue(getFirstJsonValue(json, fieldPaths.txIdPix)),
            codigoBancoFavorecido: '',
            agenciaFavorecido: '',
            agenciaDvFavorecido: '',
            contaFavorecido: '',
            contaDvFavorecido: '',
            nomeFavorecido,
            tipoInscricaoFavorecido: detectTipoInscricao(pixDocument, tipoInscricaoFavorecidoDefault),
            numeroInscricaoFavorecido: pixDocument,
            logradouroFavorecido: '',
            numeroEnderecoFavorecido: '',
            complementoFavorecido: '',
            bairroFavorecido: '',
            cidadeFavorecido: '',
            cepFavorecido: '',
            ufFavorecido: '',
            dataPagamento: requireOrFallback(dataPagamento, 'Data de Pagamento', index, ignorePaymentErrors, warnings),
            dataVencimento,
            valor,
            numeroDocumento: toStringValue(getFirstJsonValue(json, fieldPaths.numeroDocumento, getFirstJsonValue(json, fieldPaths.seuNumero))),
            seuNumero: toStringValue(getFirstJsonValue(json, fieldPaths.seuNumero, getFirstJsonValue(json, fieldPaths.numeroDocumento))),
        };
    }
    const codigoBancoFavorecido = toStringValue(getFirstJsonValue(json, fieldPaths.codigoBancoFavorecido));
    const agenciaFavorecido = splitValueAndDigit(toStringValue(getFirstJsonValue(json, fieldPaths.agenciaFavorecido)), toStringValue(getFirstJsonValue(json, fieldPaths.agenciaDvFavorecido)));
    const contaFavorecido = splitValueAndDigit(toStringValue(getFirstJsonValue(json, fieldPaths.contaFavorecido)), toStringValue(getFirstJsonValue(json, fieldPaths.contaDvFavorecido)));
    const nomeFavorecido = toStringValue(getFirstJsonValue(json, fieldPaths.nomeFavorecido));
    const missingTransferFields = [
        codigoBancoFavorecido ? '' : 'Banco do Favorecido',
        agenciaFavorecido.value ? '' : 'Agência do Favorecido',
        contaFavorecido.value ? '' : 'Conta do Favorecido',
        contaFavorecido.digit ? '' : 'DV Conta do Favorecido',
        nomeFavorecido ? '' : 'Nome do Favorecido',
        numeroInscricaoFavorecido ? '' : 'CPF/CNPJ do Favorecido',
    ].filter(Boolean);
    if (missingTransferFields.length > 0) {
        const availableKeys = listAvailableKeys(json).slice(0, 80).join(', ');
        if (!ignorePaymentErrors) {
            throw new Error(`Não foi possível identificar a forma de pagamento no item ${index + 1}. Campos faltantes: ${missingTransferFields.join(', ')}. Campos disponíveis: ${availableKeys || 'nenhum'}.`);
        }
        warn(warnings, index, 'Forma de Pagamento', `Pagamento ignorado por dados incompletos. Campos faltantes: ${missingTransferFields.join(', ')}.`);
        skippedPayments.push({ item: index + 1, reason: 'Dados bancários incompletos', missingFields: missingTransferFields });
        return undefined;
    }
    return {
        codigoBancoFavorecido,
        agenciaFavorecido: agenciaFavorecido.value,
        agenciaDvFavorecido: agenciaFavorecido.digit,
        contaFavorecido: contaFavorecido.value,
        contaDvFavorecido: contaFavorecido.digit,
        nomeFavorecido,
        tipoInscricaoFavorecido: detectTipoInscricao(numeroInscricaoFavorecido, tipoInscricaoFavorecidoDefault),
        numeroInscricaoFavorecido,
        logradouroFavorecido: toStringValue(getFirstJsonValue(json, fieldPaths.logradouroFavorecido)),
        numeroEnderecoFavorecido: toStringValue(getFirstJsonValue(json, fieldPaths.numeroEnderecoFavorecido)),
        complementoFavorecido: toStringValue(getFirstJsonValue(json, fieldPaths.complementoFavorecido)),
        bairroFavorecido: toStringValue(getFirstJsonValue(json, fieldPaths.bairroFavorecido)),
        cidadeFavorecido: toStringValue(getFirstJsonValue(json, fieldPaths.cidadeFavorecido)),
        cepFavorecido: toStringValue(getFirstJsonValue(json, fieldPaths.cepFavorecido)),
        ufFavorecido: toStringValue(getFirstJsonValue(json, fieldPaths.ufFavorecido)),
        dataPagamento: requireOrFallback(dataPagamento, 'Data de Pagamento', index, ignorePaymentErrors, warnings),
        dataVencimento,
        valor,
        numeroDocumento: toStringValue(getFirstJsonValue(json, fieldPaths.numeroDocumento, getFirstJsonValue(json, fieldPaths.seuNumero))),
        seuNumero: toStringValue(getFirstJsonValue(json, fieldPaths.seuNumero, getFirstJsonValue(json, fieldPaths.numeroDocumento))),
    };
}
const fieldPaths = {
    valor: [
        'sourceOpenAmount',
        'OpenAmount',
        'openAmount',
        'ValorAberto',
        'U_ValorAberto',
        'InstallmentTotal',
        'InsTotal',
        'Total',
        'DocTotal',
        'DocTotalSy',
        'Amount',
        'valor',
        'valor_documento',
        'valor_titulo',
    ],
    codigoBarras: [
        'U_CodigoBarras',
        'U_Codigo_Barras',
        'U_LinhaDigitavel',
        'U_Linha_Digitavel',
        'CodigoBarras',
        'codigo_barras',
        'linha_digitavel',
        'BoletoBarcode',
        'BoletoLine',
        'boleto.codigo_barras',
        'boleto.linha_digitavel',
    ],
    dataPagamento: ['paymentDate', 'DataPagamento', 'U_DataPagamento', 'DocDueDate', 'sourceDueDate'],
    dataVencimento: ['sourceDueDate', 'DueDate', 'DocDueDate', 'InstallmentDueDate', 'U_DataVencimento', 'data_vencimento'],
    numeroDocumento: ['DocNum', 'Serial', 'SequenceSerial', 'NumAtCard', 'DocumentNumber', 'numero_documento'],
    seuNumero: ['sourceDocEntry', 'DocEntry', 'DocNum', 'Serial', 'NumAtCard', 'U_SeuNumero'],
    codigoBancoFavorecido: withBusinessPartnerPaths([
        'U_BancoFavorecido',
        'U_CodBanco',
        'BankCode',
        'BPBankAccounts.0.BankCode',
        'BPBankAccounts.0.BankCode2',
        'BPBankAccounts.0.BankCountry',
        'banco',
        'codigo_banco',
        'cnab_integracao_bancaria.banco_transferencia',
    ]),
    agenciaFavorecido: withBusinessPartnerPaths([
        'U_AgenciaFavorecido',
        'U_Agencia',
        'Branch',
        'BPBankAccounts.0.Branch',
        'BPBankAccounts.0.BankBranch',
        'agencia',
        'cnab_integracao_bancaria.agencia_transferencia',
    ]),
    agenciaDvFavorecido: withBusinessPartnerPaths([
        'U_AgenciaDv',
        'U_DigitoAgencia',
        'AgencyControlKey',
        'BPBankAccounts.0.AgencyControlKey',
        'agencia_dv',
        'digito_agencia',
    ]),
    contaFavorecido: withBusinessPartnerPaths([
        'U_ContaFavorecido',
        'U_Conta',
        'AccountNo',
        'BPBankAccounts.0.AccountNo',
        'BPBankAccounts.0.AccountNumber',
        'conta',
        'conta_corrente',
        'cnab_integracao_bancaria.conta_corrente_transferencia',
    ]),
    contaDvFavorecido: withBusinessPartnerPaths([
        'U_ContaDv',
        'U_DigitoConta',
        'ControlKey',
        'BPBankAccounts.0.ControlKey',
        'BPBankAccounts.0.AccountCheckDigit',
        'conta_dv',
        'digito_conta',
        'dv_conta',
    ]),
    nomeFavorecido: withBusinessPartnerPaths([
        'U_NomeFavorecido',
        'CardName',
        'CardForeignName',
        'AccountName',
        'BPBankAccounts.0.AccountName',
        'nome_favorecido',
        'razao_social',
    ]),
    numeroInscricaoFavorecido: withBusinessPartnerPaths([
        'U_CpfCnpjFavorecido',
        'FederalTaxID',
        'TaxId0',
        'TaxId4',
        'BPFiscalTaxIDCollection.0.TaxId0',
        'BPFiscalTaxIDCollection.0.TaxId4',
        'FiscalTaxID.TaxId0',
        'FiscalTaxID.TaxId4',
        'cpf_cnpj',
        'cnpj',
        'cpf',
    ]),
    chavePix: withBusinessPartnerPaths([
        'U_ChavePix',
        'U_PIX',
        'PixKey',
        'chave_pix',
        'chavePix',
        'pix.chave',
        'cnab_integracao_bancaria.chave_pix',
    ]),
    tipoChavePix: withBusinessPartnerPaths([
        'U_TipoChavePix',
        'PixKeyType',
        'tipo_chave_pix',
        'tipo_pix',
        'cnab_integracao_bancaria.tipo_chave_pix',
    ]),
    txIdPix: ['U_TxIdPix', 'txid', 'tx_id', 'pix_txid'],
    tipoPagamento: ['U_TipoPagamento', 'U_FormaPagamento', 'PaymentMethodCode', 'PaymentMethod', 'tipo_pagamento'],
    tipoDocumento: ['U_TipoDocumento', 'DocumentType', 'tipo_documento'],
    logradouroFavorecido: withBusinessPartnerPaths(['BPAddresses.0.Street', 'Street', 'endereco', 'logradouro']),
    numeroEnderecoFavorecido: withBusinessPartnerPaths(['BPAddresses.0.StreetNo', 'StreetNo', 'numero', 'numero_endereco']),
    complementoFavorecido: withBusinessPartnerPaths(['BPAddresses.0.BuildingFloorRoom', 'BuildingFloorRoom', 'complemento']),
    bairroFavorecido: withBusinessPartnerPaths(['BPAddresses.0.Block', 'Block', 'bairro']),
    cidadeFavorecido: withBusinessPartnerPaths(['BPAddresses.0.City', 'City', 'cidade']),
    cepFavorecido: withBusinessPartnerPaths(['BPAddresses.0.ZipCode', 'ZipCode', 'cep']),
    ufFavorecido: withBusinessPartnerPaths(['BPAddresses.0.State', 'State', 'uf', 'estado']),
};
async function execute(api) {
    var _a;
    const dateFrom = (0, date_1.toSapDate)(this.getNodeParameter('dateFrom', 0));
    const dateTo = (0, date_1.toSapDate)(this.getNodeParameter('dateTo', 0));
    const rawPaymentDate = this.getNodeParameter('paymentDate', 0, '');
    const paymentDate = rawPaymentDate ? (0, date_1.toSapDate)(rawPaymentDate) : '';
    const rawFileName = this.getNodeParameter('fileName', 0, '');
    const fileSequence = this.getNodeParameter('fileSequence', 0);
    const ignorePaymentErrors = this.getNodeParameter('ignorePaymentErrors', 0, true);
    const includePurchaseInvoices = this.getNodeParameter('includePurchaseInvoices', 0, true);
    const purchaseInvoicesMaxPages = this.getNodeParameter('purchaseInvoicesMaxPages', 0, 0);
    const createVendorPaymentsForInvoices = this.getNodeParameter('createVendorPaymentsForInvoices', 0, false);
    const paymentCashAccount = this.getNodeParameter('paymentCashAccount', 0, '');
    const paymentDocCurrency = this.getNodeParameter('paymentDocCurrency', 0, '');
    const paymentRemarks = this.getNodeParameter('paymentRemarks', 0, '');
    const additionalPayablesQuery = this.getNodeParameter('additionalPayablesQuery', 0, '');
    const additionalPayablesMaxPages = this.getNodeParameter('additionalPayablesMaxPages', 0, 0);
    const tipoInscricaoFavorecidoDefault = this.getNodeParameter('tipoInscricaoFavorecidoDefault', 0);
    if (createVendorPaymentsForInvoices && !paymentCashAccount.trim()) {
        throw new Error('Informe a Conta Caixa/Banco da Baixa para criar VendorPayment nas parcelas de NF.');
    }
    const generationDate = new Date();
    const fileName = resolveFileName(rawFileName, fileSequence, generationDate);
    const warnings = [];
    const skippedPayments = [];
    const vendorPaymentsCreated = [];
    const company = {
        convenio: this.getNodeParameter('companyConvenio', 0),
        tipoInscricao: this.getNodeParameter('companyTipoInscricao', 0),
        numeroInscricao: this.getNodeParameter('companyNumeroInscricao', 0),
        agencia: this.getNodeParameter('companyAgencia', 0),
        conta: this.getNodeParameter('companyConta', 0),
        contaDv: this.getNodeParameter('companyContaDv', 0),
        nome: this.getNodeParameter('companyNome', 0),
        endereco: this.getNodeParameter('companyEndereco', 0, ''),
        numeroEndereco: this.getNodeParameter('companyNumeroEndereco', 0, ''),
        complemento: this.getNodeParameter('companyComplemento', 0, ''),
        cidade: this.getNodeParameter('companyCidade', 0, ''),
        cep: this.getNodeParameter('companyCep', 0, ''),
        uf: this.getNodeParameter('companyUf', 0, ''),
    };
    const fetchedPayables = await fetchSapPayables(api, dateFrom, dateTo, includePurchaseInvoices, purchaseInvoicesMaxPages, additionalPayablesQuery, additionalPayablesMaxPages);
    const inputPayables = extractInputPayables(this.getInputData(), dateFrom, dateTo);
    const payables = [...fetchedPayables, ...inputPayables];
    if (payables.length === 0) {
        throw new Error('Nenhum contas a pagar/parcela aberta foi encontrado no período informado.');
    }
    const bpCache = new Map();
    const enrichedPayables = [];
    for (const [index, payable] of payables.entries()) {
        let enrichedPayable = await fetchBusinessPartner(api, payable, bpCache, warnings, index);
        if (createVendorPaymentsForInvoices
            && ['purchaseInvoice', 'purchaseInvoiceInstallment'].includes((_a = enrichedPayable.sapSource) !== null && _a !== void 0 ? _a : '')) {
            try {
                const vendorPayment = await createVendorPaymentForInvoice(api, enrichedPayable, paymentDate || enrichedPayable.sourceDueDate || dateTo, paymentCashAccount, paymentDocCurrency, paymentRemarks);
                vendorPaymentsCreated.push(vendorPayment);
                enrichedPayable = {
                    ...enrichedPayable,
                    vendorPayment,
                };
            }
            catch (error) {
                if (!ignorePaymentErrors) {
                    throw error;
                }
                warn(warnings, index, 'VendorPayment', `Não foi possível criar VendorPayment: ${error.message}`);
            }
        }
        enrichedPayables.push(enrichedPayable);
    }
    const payments = enrichedPayables
        .map((payable, index) => toPaymentData(payable, index, company, paymentDate, tipoInscricaoFavorecidoDefault, ignorePaymentErrors, warnings, skippedPayments))
        .filter((payment) => Boolean(payment));
    if (payments.length === 0) {
        throw new Error(`Nenhum pagamento válido foi encontrado para gerar a remessa. Avisos: ${JSON.stringify(warnings)}`);
    }
    const content = (0, cnab240Sicoob_1.buildCnab240SicoobPaymentRemittance)({
        company,
        payments,
        fileSequence,
        generationDate,
    });
    const totalAmount = payments.reduce((total, payment) => total + payment.valor, 0);
    const binaryData = await this.helpers.prepareBinaryData(Buffer.from(content, 'ascii'), fileName, 'text/plain');
    return [{
            json: {
                fileName,
                bank: 'Sicoob',
                layout: 'CNAB240',
                dateFrom,
                dateTo,
                payments: payments.length,
                skippedPayments,
                skippedPaymentCount: skippedPayments.length,
                totalAmount,
                lines: content.trimEnd().split('\r\n').length,
                warnings,
                warningCount: warnings.length,
                vendorPaymentsCreated,
                vendorPaymentsCreatedCount: vendorPaymentsCreated.length,
                sourcePayablesCount: payables.length,
                content,
            },
            binary: {
                data: binaryData,
            },
        }];
}
