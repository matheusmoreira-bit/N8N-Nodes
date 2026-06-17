"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const cnab240Sicoob_1 = require("../../../utils/cnab240Sicoob");
function toStringValue(value) {
    return `${value ?? ''}`.trim();
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
function onlyDigits(value) {
    return toStringValue(value).replace(/\D/g, '');
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
        return {
            value: trimmedValue,
            digit: trimmedDigit,
        };
    }
    const match = /^(.+?)[\s\-/]([0-9A-Za-z])$/.exec(trimmedValue);
    if (!match) {
        return {
            value: trimmedValue,
            digit: '',
        };
    }
    return {
        value: match[1].trim(),
        digit: match[2].trim(),
    };
}
function requireValue(value, fieldName, itemIndex) {
    if (!value) {
        throw new Error(`Campo obrigatório '${fieldName}' não encontrado no item ${itemIndex + 1}.`);
    }
    return value;
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
        return requireValue(value, fieldName, itemIndex);
    }
    warn(warnings, itemIndex, fieldName, `Campo ausente. Gerado com '${fallback || 'branco/zero'}'.`);
    return fallback;
}
function appendUniquePath(paths, path) {
    if (!paths.includes(path)) {
        paths.push(path);
    }
}
function withSupplierPaths(paths) {
    const supplierPrefixes = [
        'fornecedor',
        'cliente_fornecedor',
        'supplier',
    ];
    const bankPrefixes = [
        'dados_bancarios',
        'dadosBancarios',
        'dados_bancarios.0',
        'dadosBancarios.0',
        'dados_bancarios_fornecedor',
    ];
    const allPaths = [...paths];
    for (const path of paths) {
        for (const prefix of supplierPrefixes) {
            appendUniquePath(allPaths, `${prefix}.${path}`);
        }
        for (const bankPrefix of bankPrefixes) {
            appendUniquePath(allPaths, `${bankPrefix}.${path}`);
            for (const supplierPrefix of supplierPrefixes) {
                appendUniquePath(allPaths, `${supplierPrefix}.${bankPrefix}.${path}`);
            }
        }
    }
    return allPaths;
}
function getFirstJsonValue(item, paths, fallback = '') {
    for (const path of paths) {
        const value = (0, cnab240Sicoob_1.getJsonValue)(item, path);
        if (value !== undefined && value !== null && `${value}`.trim() !== '') {
            return value;
        }
    }
    return findValueByKey(item, paths) ?? fallback;
}
function normalizeKey(value) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}
function isBarcodeKey(key) {
    const normalizedKey = normalizeKey(key);
    return normalizedKey.includes('barras')
        || normalizedKey.includes('barcode')
        || normalizedKey.includes('linhadigitavel')
        || normalizedKey.includes('fichacompensacao');
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
function isObjectEmpty(value) {
    return Object.keys(value).length === 0;
}
function extractPayableJson(inputItems) {
    const payables = [];
    const arrayKeys = [
        'conta_pagar_cadastro',
        'contas_pagar',
        'contasAPagar',
        'accountsPayable',
        'items',
        'data',
        'result',
        'results',
    ];
    for (const item of inputItems) {
        const json = item.json;
        if (isObjectEmpty(json)) {
            continue;
        }
        let expanded = false;
        for (const key of arrayKeys) {
            const value = (0, cnab240Sicoob_1.getJsonValue)(json, key);
            if (Array.isArray(value)) {
                payables.push(...value.filter((entry) => (Boolean(entry)
                    && typeof entry === 'object'
                    && !Array.isArray(entry)
                    && !isObjectEmpty(entry))));
                expanded = true;
                break;
            }
        }
        if (!expanded) {
            payables.push(json);
        }
    }
    return payables;
}
function hasBarcodeData(payable) {
    return Boolean(normalizeBarcode(getBarcodeValue(payable)));
}
function hasTransferBankData(payable) {
    return Boolean(toStringValue(getFirstJsonValue(payable, fieldPaths.codigoBancoFavorecido))
        && toStringValue(getFirstJsonValue(payable, fieldPaths.agenciaFavorecido))
        && toStringValue(getFirstJsonValue(payable, fieldPaths.contaFavorecido)));
}
function hasFavoredIdentityData(payable) {
    return Boolean(toStringValue(getFirstJsonValue(payable, fieldPaths.nomeFavorecido))
        && toStringValue(getFirstJsonValue(payable, fieldPaths.numeroInscricaoFavorecido)));
}
function shouldFetchSupplierDetails(payable) {
    return !hasBarcodeData(payable) && (!hasTransferBankData(payable) || !hasFavoredIdentityData(payable));
}
function getSupplierLookupParams(payable) {
    const codigoClienteOmie = getFirstJsonValue(payable, [
        'codigo_cliente_fornecedor',
        'codigo_cliente',
        'codigo_cliente_omie',
        'fornecedor.codigo_cliente_omie',
        'cliente_fornecedor.codigo_cliente_omie',
    ]);
    const codigoClienteIntegracao = getFirstJsonValue(payable, [
        'codigo_cliente_fornecedor_integracao',
        'codigo_cliente_integracao',
        'fornecedor.codigo_cliente_integracao',
        'cliente_fornecedor.codigo_cliente_integracao',
    ]);
    if (codigoClienteOmie) {
        const parsedCodigoClienteOmie = Number(codigoClienteOmie);
        return {
            codigo_cliente_omie: Number.isNaN(parsedCodigoClienteOmie)
                ? codigoClienteOmie
                : parsedCodigoClienteOmie,
        };
    }
    if (codigoClienteIntegracao) {
        return {
            codigo_cliente_integracao: codigoClienteIntegracao,
        };
    }
    return {};
}
function getSupplierCacheKey(params) {
    return Object.entries(params)
        .map(([key, value]) => `${key}:${value}`)
        .join('|');
}
function mergeSupplierDetails(payable, supplier) {
    const supplierBankData = getFirstJsonValue(supplier, [
        'dados_bancarios',
        'dadosBancarios',
        'dados_bancarios.0',
        'dadosBancarios.0',
    ], {});
    return {
        ...payable,
        fornecedor: supplier,
        cliente_fornecedor: supplier,
        dados_bancarios_fornecedor: supplierBankData,
    };
}
async function enrichPayablesWithOmieDetails(api, payables, warnings, fetchDetailsFromOmie) {
    if (!fetchDetailsFromOmie) {
        return payables;
    }
    const enrichedPayables = [];
    const supplierCache = new Map();
    for (const [index, payable] of payables.entries()) {
        if (hasBarcodeData(payable)) {
            enrichedPayables.push(payable);
            continue;
        }
        let enrichedPayable = payable;
        const codigoLancamentoOmie = getFirstJsonValue(payable, ['codigo_lancamento_omie', 'codigo_lancamento']);
        const codigoLancamentoIntegracao = getFirstJsonValue(payable, ['codigo_lancamento_integracao']);
        const params = {};
        if (codigoLancamentoOmie) {
            params.codigo_lancamento_omie = codigoLancamentoOmie;
        }
        else if (codigoLancamentoIntegracao) {
            params.codigo_lancamento_integracao = codigoLancamentoIntegracao;
        }
        if (Object.keys(params).length === 0) {
            enrichedPayable = payable;
        }
        else {
            try {
                const detail = await api.getAccountPayable(params);
                enrichedPayable = {
                    ...payable,
                    ...detail,
                };
            }
            catch (error) {
                warn(warnings, index, 'Consulta Omie', `Não foi possível consultar detalhes da conta a pagar: ${error.message}`);
            }
        }
        if (shouldFetchSupplierDetails(enrichedPayable)) {
            const supplierParams = getSupplierLookupParams(enrichedPayable);
            const supplierCacheKey = getSupplierCacheKey(supplierParams);
            if (supplierCacheKey) {
                try {
                    let supplier = supplierCache.get(supplierCacheKey);
                    if (!supplier) {
                        supplier = await api.getSupplier(supplierParams);
                        supplierCache.set(supplierCacheKey, supplier);
                    }
                    enrichedPayable = mergeSupplierDetails(enrichedPayable, supplier);
                }
                catch (error) {
                    warn(warnings, index, 'Consulta Fornecedor Omie', `Não foi possível consultar dados bancários do fornecedor: ${error.message}`);
                }
            }
        }
        enrichedPayables.push(enrichedPayable);
    }
    return enrichedPayables;
}
function isPixLikePayment(json) {
    const tipoPagamento = toStringValue(getFirstJsonValue(json, fieldPaths.tipoPagamento)).toUpperCase();
    const tipoDocumento = toStringValue(getFirstJsonValue(json, fieldPaths.tipoDocumento)).toUpperCase();
    return tipoPagamento === 'PIX'
        || tipoDocumento === 'PIX';
}
function getPaymentIdentificationMessage(json, missingFields) {
    const tipoPagamento = toStringValue(getFirstJsonValue(json, fieldPaths.tipoPagamento));
    const tipoDocumento = toStringValue(getFirstJsonValue(json, fieldPaths.tipoDocumento));
    const formaPagamento = toStringValue(getFirstJsonValue(json, fieldPaths.codigoFormaPagamento));
    const chavePix = toStringValue(getFirstJsonValue(json, fieldPaths.chavePix));
    const details = [
        tipoPagamento ? `tipo de pagamento: ${tipoPagamento}` : '',
        tipoDocumento ? `tipo de documento: ${tipoDocumento}` : '',
        formaPagamento ? `forma de pagamento: ${formaPagamento}` : '',
        chavePix ? 'chave Pix encontrada' : '',
    ].filter(Boolean).join('; ');
    const missingText = missingFields.length > 0
        ? ` Campos faltantes para transferência: ${missingFields.join(', ')}.`
        : '';
    if (isPixLikePayment(json)) {
        return 'Pagamento identificado como PIX, mas não há código de barras nem dados bancários completos para gerar o CNAB Sicoob por transferência. '
            + 'O gerador atual não monta pagamento PIX somente por chave; preencha banco, agência, conta e DV no cadastro do fornecedor/integração bancária do Omie, ou envie uma linha digitável/código de barras quando for boleto. '
            + `${details ? `Detalhes encontrados: ${details}.` : ''}${missingText}`;
    }
    return 'Não foi encontrado código de barras nem dados bancários completos do favorecido. Pagamento ignorado para evitar código de barras zerado ou conta bancária inválida.'
        + missingText;
}
function inferPixKeyType(value) {
    const trimmedValue = value.trim();
    const digits = onlyDigits(trimmedValue);
    if (digits.length === 11 || digits.length === 14) {
        return '03';
    }
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
        return '02';
    }
    if (/^\+?\d{10,13}$/.test(digits)) {
        return '01';
    }
    if (isUuidV4(trimmedValue)) {
        return '04';
    }
    return '03';
}
function isUuidV4(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}
function getPaymentAmount(json) {
    return parseAmount(getFirstJsonValue(json, fieldPaths.valor));
}
const fieldPaths = {
    valor: [
        'valor_documento',
        'valor_titulo',
        'valor_pagamento',
        'valor_liquido',
        'valor_total',
        'valor_pag',
        'valor',
        'nValorTitulo',
        'nValorDocumento',
        'n_valor_titulo',
        'n_valor_documento',
        'n_val_pago',
        'resumo.n_val_pago',
        'resumo.n_val_titulo',
        'resumo.valor_documento',
    ],
    codigoBarras: [
        'codigo_barras_ficha_compensacao',
        'codigo_barras_ficha',
        'codigo_barras',
        'cod_barras',
        'linha_digitavel',
        'linha_digitavel_boleto',
        'cCodigoBarras',
        'cLinhaDigitavel',
        'boleto.codigo_barras_ficha_compensacao',
        'boleto.codigo_barras',
        'boleto.linha_digitavel',
    ],
    dataPagamento: ['data_previsao', 'data_pagamento', 'data_vencimento'],
    dataVencimento: ['data_vencimento', 'data_previsao', 'data_pagamento'],
    numeroDocumento: ['numero_documento_fiscal', 'numero_documento', 'numero_doc', 'documento', 'codigo_lancamento_integracao'],
    seuNumero: ['codigo_lancamento_omie', 'codigo_lancamento', 'codigo_lancamento_integracao', 'numero_documento_fiscal'],
    codigoBancoFavorecido: withSupplierPaths([
        'cnab_integracao_bancaria.banco_transferencia',
        'codigo_banco_favorecido',
        'banco_favorecido',
        'codigo_banco',
        'cod_banco',
        'banco',
        'banco.codigo',
        'dados_bancarios.codigo_banco',
        'dados_bancarios.cod_banco',
        'dados_bancarios.banco',
        'dadosBancarios.codigo_banco',
        'dadosBancarios.cod_banco',
        'dadosBancarios.banco',
    ]),
    agenciaFavorecido: withSupplierPaths([
        'cnab_integracao_bancaria.agencia_transferencia',
        'agencia_favorecido',
        'agencia',
        'agencia_conta',
        'dados_bancarios.agencia',
        'dados_bancarios.agencia_conta',
        'dadosBancarios.agencia',
        'dadosBancarios.agencia_conta',
    ]),
    agenciaDvFavorecido: withSupplierPaths([
        'cnab_integracao_bancaria.agencia_dv_transferencia',
        'cnab_integracao_bancaria.digito_agencia_transferencia',
        'agencia_dv_favorecido',
        'agencia_dv',
        'digito_agencia',
        'dados_bancarios.agencia_dv',
        'dados_bancarios.digito_agencia',
        'dadosBancarios.agencia_dv',
        'dadosBancarios.digito_agencia',
    ]),
    contaFavorecido: withSupplierPaths([
        'cnab_integracao_bancaria.conta_corrente_transferencia',
        'cnab_integracao_bancaria.conta_transferencia',
        'conta_favorecido',
        'conta_corrente_favorecido',
        'conta_corrente',
        'conta',
        'dados_bancarios.conta_corrente',
        'dados_bancarios.conta',
        'dadosBancarios.conta_corrente',
        'dadosBancarios.conta',
    ]),
    contaDvFavorecido: withSupplierPaths([
        'cnab_integracao_bancaria.conta_dv_transferencia',
        'cnab_integracao_bancaria.digito_conta_transferencia',
        'conta_dv_favorecido',
        'digito_conta_favorecido',
        'conta_dv',
        'digito_conta',
        'dv_conta',
        'dados_bancarios.conta_dv',
        'dados_bancarios.digito_conta',
        'dados_bancarios.dv_conta',
        'dadosBancarios.conta_dv',
        'dadosBancarios.digito_conta',
        'dadosBancarios.dv_conta',
    ]),
    nomeFavorecido: withSupplierPaths([
        'cnab_integracao_bancaria.nome_transferencia',
        'nome_favorecido',
        'razao_social_favorecido',
        'nome_fantasia_favorecido',
        'razao_social',
        'nome_fantasia',
        'cliente_nome',
        'dados_bancarios.nome_titular',
        'dados_bancarios.nome_titular_conta',
        'dadosBancarios.nome_titular',
        'dadosBancarios.nome_titular_conta',
    ]),
    numeroInscricaoFavorecido: withSupplierPaths([
        'cnab_integracao_bancaria.cpf_cnpj_transferencia',
        'cpf_cnpj_favorecido',
        'cnpj_cpf_favorecido',
        'cpf_cnpj',
        'cnpj_cpf',
        'cnpj',
        'cpf',
        'dados_bancarios.cpf_cnpj',
        'dados_bancarios.cnpj_cpf',
        'dados_bancarios.cpf_cnpj_titular',
        'dadosBancarios.cpf_cnpj',
        'dadosBancarios.cnpj_cpf',
        'dadosBancarios.cpf_cnpj_titular',
    ]),
    chavePix: withSupplierPaths([
        'cnab_integracao_bancaria.chave_pix',
        'chave_pix',
        'cChavePix',
        'dados_bancarios.chave_pix',
        'dados_bancarios.cChavePix',
        'dadosBancarios.chave_pix',
        'dadosBancarios.cChavePix',
    ]),
    tipoChavePix: withSupplierPaths([
        'cnab_integracao_bancaria.tipo_chave_pix',
        'cnab_integracao_bancaria.tipo_pix',
        'tipo_chave_pix',
        'tipo_pix',
        'pix_tipo_chave',
        'dados_bancarios.tipo_chave_pix',
        'dadosBancarios.tipo_chave_pix',
    ]),
    txIdPix: [
        'cnab_integracao_bancaria.txid',
        'cnab_integracao_bancaria.tx_id',
        'txid',
        'tx_id',
        'pix_txid',
        'id_conciliacao',
        'id_conciliacao_pix',
    ],
    tipoPagamento: [
        'tipoPagamento',
        'tipo_pagamento',
        'pagamento.tipoPagamento',
        'pagamento.tipo_pagamento',
    ],
    tipoDocumento: ['codigo_tipo_documento', 'tipo_documento', 'documento_tipo'],
    codigoFormaPagamento: [
        'cnab_integracao_bancaria.codigo_forma_pagamento',
        'codigo_forma_pagamento',
        'forma_pagamento',
    ],
    logradouroFavorecido: ['logradouro_favorecido', 'endereco_favorecido', 'endereco', 'logradouro'],
    numeroEnderecoFavorecido: ['numero_endereco_favorecido', 'numero_favorecido', 'endereco_numero', 'numero_endereco', 'numero'],
    complementoFavorecido: ['complemento_favorecido', 'endereco_complemento', 'complemento'],
    bairroFavorecido: ['bairro_favorecido', 'bairro'],
    cidadeFavorecido: ['cidade_favorecido', 'cidade'],
    cepFavorecido: ['cep_favorecido', 'cep'],
    ufFavorecido: ['uf_favorecido', 'estado_favorecido', 'uf', 'estado'],
};
async function execute(api) {
    const inputItems = this.getInputData();
    const payableItems = extractPayableJson(inputItems);
    if (payableItems.length === 0) {
        throw new Error('Nenhum contas a pagar foi recebido para gerar o CNAB. '
            + 'Conecte a saída do Omie > Contas a Pagar > Listar neste node CNAB 240 Sicoob, '
            + 'ou execute o fluxo a partir do node de listagem para que os itens cheguem como entrada.');
    }
    const rawFileName = this.getNodeParameter('fileName', 0, '');
    const fileSequence = this.getNodeParameter('fileSequence', 0);
    const generationDate = new Date();
    const fileName = resolveFileName(rawFileName, fileSequence, generationDate);
    const ignorePaymentErrors = this.getNodeParameter('ignorePaymentErrors', 0, true);
    const fetchDetailsFromOmie = this.getNodeParameter('fetchDetailsFromOmie', 0, true);
    const tipoInscricaoFavorecidoDefault = this.getNodeParameter('tipoInscricaoFavorecidoDefault', 0);
    const warnings = [];
    const skippedPayments = [];
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
    const enrichedPayableItems = await enrichPayablesWithOmieDetails(api, payableItems, warnings, fetchDetailsFromOmie);
    const payments = [];
    for (const [index, json] of enrichedPayableItems.entries()) {
        let codigoBarras = normalizeBarcode(getBarcodeValue(json));
        const numeroInscricaoFavorecido = toStringValue(getFirstJsonValue(json, fieldPaths.numeroInscricaoFavorecido));
        const dataPagamento = toStringValue(getFirstJsonValue(json, fieldPaths.dataPagamento));
        const rawValor = getFirstJsonValue(json, fieldPaths.valor);
        let valor = getPaymentAmount(json);
        if (valor <= 0) {
            const availableKeys = listAvailableKeys(json).slice(0, 80).join(', ');
            if (ignorePaymentErrors) {
                warn(warnings, index, 'Valor do Pagamento', `Valor inválido ou ausente ('${toStringValue(rawValor) || 'vazio'}'). Gerado com 0. Campos disponíveis: ${availableKeys || 'nenhum'}.`);
                skippedPayments.push({
                    item: index + 1,
                    reason: 'Valor de pagamento inválido ou ausente',
                });
                continue;
            }
            else {
                throw new Error(`Valor de pagamento inválido no item ${index + 1}. `
                    + `Valor encontrado: '${toStringValue(rawValor) || 'vazio'}'. `
                    + `Campos disponíveis no item: ${availableKeys || 'nenhum'}.`);
            }
        }
        if (codigoBarras) {
            if (codigoBarras.length !== 44) {
                if (ignorePaymentErrors) {
                    warn(warnings, index, 'Código de Barras', `Código de barras/linha digitável inválido (${codigoBarras.length} dígitos). Pagamento ignorado.`);
                    skippedPayments.push({
                        item: index + 1,
                        reason: 'Código de barras/linha digitável inválido',
                    });
                    continue;
                }
                else {
                    throw new Error(`Código de barras/linha digitável inválido no item ${index + 1}. `
                        + `Esperado 44 ou 47 dígitos, recebido ${codigoBarras.length}.`);
                }
            }
            payments.push({
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
                dataVencimento: toStringValue(getFirstJsonValue(json, fieldPaths.dataVencimento, dataPagamento)),
                valor,
                numeroDocumento: toStringValue(getFirstJsonValue(json, fieldPaths.numeroDocumento, getFirstJsonValue(json, fieldPaths.seuNumero))),
                seuNumero: toStringValue(getFirstJsonValue(json, fieldPaths.seuNumero, getFirstJsonValue(json, fieldPaths.numeroDocumento))),
            });
            continue;
        }
        if (isPixLikePayment(json)) {
            const transferDocument = onlyDigits(getFirstJsonValue(json, ['cnab_integracao_bancaria.cpf_cnpj_transferencia']));
            const rawChavePix = transferDocument;
            const tipoChavePix = inferPixKeyType(rawChavePix);
            const pixDocument = numeroInscricaoFavorecido || (inferPixKeyType(rawChavePix) === '03' ? rawChavePix : '');
            const chavePix = rawChavePix || pixDocument;
            const nomeFavorecido = toStringValue(getFirstJsonValue(json, fieldPaths.nomeFavorecido));
            const missingPixFields = [
                chavePix ? '' : 'Chave Pix',
                pixDocument ? '' : 'CPF/CNPJ do Favorecido',
                nomeFavorecido ? '' : 'Nome do Favorecido',
            ].filter(Boolean);
            if (missingPixFields.length > 0) {
                const availableKeys = listAvailableKeys(json).slice(0, 80).join(', ');
                const message = `Pagamento identificado como PIX, mas não há dados suficientes para gerar PIX por chave. Campos faltantes: ${missingPixFields.join(', ')}.`;
                if (ignorePaymentErrors) {
                    warn(warnings, index, 'PIX', `${message} Campos disponíveis: ${availableKeys || 'nenhum'}.`);
                    skippedPayments.push({
                        item: index + 1,
                        reason: 'PIX sem chave ou identificação do favorecido',
                        missingFields: missingPixFields,
                    });
                    continue;
                }
                throw new Error(`${message} Campos disponíveis no item: ${availableKeys || 'nenhum'}.`);
            }
            payments.push({
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
                dataVencimento: toStringValue(getFirstJsonValue(json, fieldPaths.dataVencimento, dataPagamento)),
                valor,
                numeroDocumento: toStringValue(getFirstJsonValue(json, fieldPaths.numeroDocumento, getFirstJsonValue(json, fieldPaths.seuNumero))),
                seuNumero: toStringValue(getFirstJsonValue(json, fieldPaths.seuNumero, getFirstJsonValue(json, fieldPaths.numeroDocumento))),
            });
            continue;
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
            const message = getPaymentIdentificationMessage(json, missingTransferFields);
            if (ignorePaymentErrors) {
                warn(warnings, index, 'Forma de Pagamento', `${message} `
                    + `Campos disponíveis: ${availableKeys || 'nenhum'}.`);
                skippedPayments.push({
                    item: index + 1,
                    reason: isPixLikePayment(json)
                        ? 'PIX sem dados bancários completos'
                        : 'Dados bancários incompletos',
                    missingFields: missingTransferFields,
                });
                continue;
            }
            throw new Error(`Não foi possível identificar a forma de pagamento no item ${index + 1}. `
                + 'Para boleto, informe um campo de código de barras/linha digitável, como codigo_barras_ficha_compensacao. '
                + `${message} `
                + `Campos disponíveis no item: ${availableKeys || 'nenhum'}.`);
        }
        payments.push({
            codigoBancoFavorecido: codigoBancoFavorecido,
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
            dataVencimento: toStringValue(getFirstJsonValue(json, fieldPaths.dataVencimento, dataPagamento)),
            valor,
            numeroDocumento: toStringValue(getFirstJsonValue(json, fieldPaths.numeroDocumento, getFirstJsonValue(json, fieldPaths.seuNumero))),
            seuNumero: toStringValue(getFirstJsonValue(json, fieldPaths.seuNumero, getFirstJsonValue(json, fieldPaths.numeroDocumento))),
        });
    }
    if (payments.length === 0) {
        throw new Error('Nenhum pagamento válido foi encontrado para gerar a remessa. '
            + 'Os pagamentos foram ignorados porque não possuem código de barras/linha digitável ou dados bancários suficientes. '
            + `Avisos: ${JSON.stringify(warnings)}`);
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
                payments: payments.length,
                skippedPayments,
                skippedPaymentCount: skippedPayments.length,
                totalAmount,
                lines: content.trimEnd().split('\r\n').length,
                warnings,
                warningCount: warnings.length,
                content,
            },
            binary: {
                data: binaryData,
            },
        }];
}
//# sourceMappingURL=execute.js.map