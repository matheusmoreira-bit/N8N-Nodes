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
    if (trimmedFileName
        && !trimmedFileName.includes('{{')
        && !trimmedFileName.includes('format')) {
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
async function enrichPayablesWithOmieDetails(api, payables, warnings, fetchDetailsFromOmie) {
    if (!fetchDetailsFromOmie) {
        return payables;
    }
    const enrichedPayables = [];
    for (const [index, payable] of payables.entries()) {
        if (normalizeBarcode(getBarcodeValue(payable))) {
            enrichedPayables.push(payable);
            continue;
        }
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
            enrichedPayables.push(payable);
            continue;
        }
        try {
            const detail = await api.getAccountPayable(params);
            enrichedPayables.push({
                ...payable,
                ...detail,
            });
        }
        catch (error) {
            warn(warnings, index, 'Consulta Omie', `Não foi possível consultar detalhes da conta a pagar: ${error.message}`);
            enrichedPayables.push(payable);
        }
    }
    return enrichedPayables;
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
    codigoBancoFavorecido: ['codigo_banco_favorecido', 'banco_favorecido', 'codigo_banco', 'banco.codigo', 'dados_bancarios.codigo_banco'],
    agenciaFavorecido: ['agencia_favorecido', 'agencia', 'dados_bancarios.agencia'],
    agenciaDvFavorecido: ['agencia_dv_favorecido', 'agencia_dv', 'digito_agencia', 'dados_bancarios.agencia_dv'],
    contaFavorecido: ['conta_favorecido', 'conta_corrente_favorecido', 'conta', 'dados_bancarios.conta'],
    contaDvFavorecido: ['conta_dv_favorecido', 'digito_conta_favorecido', 'conta_dv', 'digito_conta', 'dados_bancarios.conta_dv'],
    nomeFavorecido: ['nome_favorecido', 'razao_social_favorecido', 'nome_fantasia_favorecido', 'razao_social', 'nome_fantasia', 'cliente_nome'],
    numeroInscricaoFavorecido: ['cpf_cnpj_favorecido', 'cnpj_cpf_favorecido', 'cpf_cnpj', 'cnpj_cpf', 'cnpj', 'cpf'],
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
        let valor = parseAmount(rawValor);
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
        const codigoBancoFavorecido = toStringValue(getFirstJsonValue(json, fieldPaths.codigoBancoFavorecido));
        if (!codigoBancoFavorecido) {
            const availableKeys = listAvailableKeys(json).slice(0, 80).join(', ');
            if (ignorePaymentErrors) {
                warn(warnings, index, 'Forma de Pagamento', 'Não foi encontrado código de barras nem banco do favorecido. Pagamento ignorado para evitar código de barras zerado. '
                    + `Campos disponíveis: ${availableKeys || 'nenhum'}.`);
                skippedPayments.push({
                    item: index + 1,
                    reason: 'Forma de pagamento não identificada',
                });
                continue;
            }
            throw new Error(`Não foi possível identificar a forma de pagamento no item ${index + 1}. `
                + 'Para boleto, informe um campo de código de barras/linha digitável, como codigo_barras_ficha_compensacao. '
                + 'Para transferência, informe banco, agência, conta e CPF/CNPJ do favorecido. '
                + `Campos disponíveis no item: ${availableKeys || 'nenhum'}.`);
        }
        payments.push({
            codigoBancoFavorecido: codigoBancoFavorecido,
            agenciaFavorecido: requireOrFallback(toStringValue(getFirstJsonValue(json, fieldPaths.agenciaFavorecido)), 'Agência do Favorecido', index, ignorePaymentErrors, warnings),
            agenciaDvFavorecido: toStringValue(getFirstJsonValue(json, fieldPaths.agenciaDvFavorecido)),
            contaFavorecido: requireOrFallback(toStringValue(getFirstJsonValue(json, fieldPaths.contaFavorecido)), 'Conta do Favorecido', index, ignorePaymentErrors, warnings),
            contaDvFavorecido: requireOrFallback(toStringValue(getFirstJsonValue(json, fieldPaths.contaDvFavorecido)), 'DV Conta do Favorecido', index, ignorePaymentErrors, warnings),
            nomeFavorecido: requireOrFallback(toStringValue(getFirstJsonValue(json, fieldPaths.nomeFavorecido)), 'Nome do Favorecido', index, ignorePaymentErrors, warnings),
            tipoInscricaoFavorecido: detectTipoInscricao(numeroInscricaoFavorecido, tipoInscricaoFavorecidoDefault),
            numeroInscricaoFavorecido: requireOrFallback(numeroInscricaoFavorecido, 'CPF/CNPJ do Favorecido', index, ignorePaymentErrors, warnings),
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