"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCnab240SicoobPaymentRemittance = buildCnab240SicoobPaymentRemittance;
exports.getJsonValue = getJsonValue;
const BANCO_SICOOB = '756';
const TIPO_SERVICO_PAGAMENTO_FORNECEDOR = '20';
const FORMA_LANCAMENTO_TED = '41';
const FORMA_LANCAMENTO_PIX = '45';
const LAYOUT_LOTE_PAGAMENTO_FORNECEDOR = '045';
const LAYOUT_LOTE_PIX = '046';
const CAMARA_TED = '018';
const CAMARA_PIX = '009';
const BANCO_FAVORECIDO_PIX_CHAVE = '000';
const TIPO_CHAVE_TELEFONE = '001';
const TIPO_CHAVE_EMAIL = '002';
const TIPO_CHAVE_CPF_CNPJ = '003';
const TIPO_CHAVE_ALEATORIA = '004';
function onlyDigits(value) {
    return `${value ?? ''}`.replace(/\D/g, '');
}
function stripAccents(value) {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
function alpha(value, length) {
    const normalized = stripAccents(`${value ?? ''}`)
        .toUpperCase()
        .replace(/[^A-Z0-9 .,&\-/]/g, ' ')
        .slice(0, length);
    return normalized.padEnd(length, ' ');
}
function numeric(value, length) {
    return onlyDigits(value).slice(-length).padStart(length, '0');
}
function amount(value, length = 15) {
    const cents = Math.round((Number(value) || 0) * 100);
    return `${cents}`.padStart(length, '0').slice(-length);
}
function date(value) {
    if (!value) {
        return '00000000';
    }
    const textValue = `${value}`.trim();
    const omieDateMatch = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(textValue);
    if (omieDateMatch) {
        const [, day, month, year] = omieDateMatch;
        return `${day}${month}${year}`;
    }
    const parsedDate = new Date(textValue);
    if (Number.isNaN(parsedDate.getTime())) {
        return numeric(textValue, 8);
    }
    const day = `${parsedDate.getDate()}`.padStart(2, '0');
    const month = `${parsedDate.getMonth() + 1}`.padStart(2, '0');
    const year = `${parsedDate.getFullYear()}`;
    return `${day}${month}${year}`;
}
function time(value) {
    return `${value.getHours()}`.padStart(2, '0')
        + `${value.getMinutes()}`.padStart(2, '0')
        + `${value.getSeconds()}`.padStart(2, '0');
}
function buildLine(parts) {
    const line = parts.join('');
    if (line.length !== 240) {
        throw new Error(`Registro CNAB 240 inválido: esperado 240 posições, recebido ${line.length}.`);
    }
    return line;
}
function accountWithDv(account, dv) {
    return `${numeric(account, 12)}${alpha(dv, 1)}`;
}
function buildFileHeader(company, generationDate, fileSequence) {
    return buildLine([
        BANCO_SICOOB,
        '0000',
        '0',
        alpha('', 9),
        numeric(company.tipoInscricao, 1),
        numeric(company.numeroInscricao, 14),
        alpha(company.convenio, 20),
        numeric(company.agencia, 5),
        alpha('', 1),
        accountWithDv(company.conta, company.contaDv),
        alpha('', 1),
        alpha(company.nome, 30),
        alpha('SICOOB', 30),
        alpha('', 10),
        '1',
        date(generationDate.toISOString()),
        time(generationDate),
        numeric(fileSequence, 6),
        '087',
        '01600',
        alpha('', 69),
    ]);
}
function isPixPayment(payment) {
    return `${payment.tipoPagamento ?? ''}`.trim().toUpperCase() === 'PIX'
        || Boolean(`${payment.tipoChavePix ?? ''}`.trim())
        || Boolean(`${payment.chavePix ?? ''}`.trim());
}
function getBatchKind(payment) {
    if (!payment.codigoBarras && isPixPayment(payment)) {
        return 'pix';
    }
    return 'standard';
}
function buildBatchHeader(company, batchNumber, kind) {
    const isPixBatch = kind === 'pix';
    return buildLine([
        BANCO_SICOOB,
        numeric(batchNumber, 4),
        '1',
        'C',
        TIPO_SERVICO_PAGAMENTO_FORNECEDOR,
        isPixBatch ? FORMA_LANCAMENTO_PIX : FORMA_LANCAMENTO_TED,
        isPixBatch ? LAYOUT_LOTE_PIX : LAYOUT_LOTE_PAGAMENTO_FORNECEDOR,
        alpha('', 1),
        numeric(company.tipoInscricao, 1),
        numeric(company.numeroInscricao, 14),
        alpha(company.convenio, 20),
        numeric(company.agencia, 5),
        alpha('', 1),
        accountWithDv(company.conta, company.contaDv),
        alpha('', 1),
        alpha(company.nome, 30),
        alpha('', 40),
        alpha(company.endereco, 30),
        alpha(company.numeroEndereco, 5),
        alpha(company.complemento, 15),
        alpha(company.cidade, 20),
        numeric(company.cep, 8),
        alpha(company.uf, 2),
        alpha('', 8),
        alpha('', 10),
    ]);
}
function buildSegmentA(payment, batchNumber, sequence) {
    const isPix = isPixPayment(payment);
    return buildLine([
        BANCO_SICOOB,
        numeric(batchNumber, 4),
        '3',
        numeric(sequence, 5),
        'A',
        '000',
        // Manual CNAB 240 Sicoob, Segmento A/P001: 009 = Pix (SPI), 018 = TED (STR/CIP).
        isPix ? CAMARA_PIX : CAMARA_TED,
        isPix ? BANCO_FAVORECIDO_PIX_CHAVE : numeric(payment.codigoBancoFavorecido, 3),
        isPix ? numeric(0, 5) : numeric(payment.agenciaFavorecido, 5),
        isPix ? alpha('', 1) : alpha(payment.agenciaDvFavorecido, 1),
        isPix ? accountWithDv('', '') : accountWithDv(payment.contaFavorecido, payment.contaDvFavorecido),
        alpha('', 1),
        alpha(payment.nomeFavorecido, 30),
        alpha(payment.seuNumero, 20),
        date(payment.dataPagamento),
        'BRL',
        numeric(0, 15),
        amount(payment.valor),
        alpha(payment.numeroDocumento, 20),
        numeric(0, 8),
        amount(0),
        alpha('', 40),
        alpha('', 2),
        numeric(0, 5),
        alpha('', 5),
        numeric(0, 1),
        alpha('', 10),
    ]);
}
function normalizeTipoChavePix(value) {
    const normalized = `${value ?? ''}`.trim().toUpperCase();
    if (['1', '01', '001', 'TELEFONE', 'PHONE'].includes(normalized)) {
        return TIPO_CHAVE_TELEFONE;
    }
    if (['2', '02', '002', 'EMAIL', 'E-MAIL'].includes(normalized)) {
        return TIPO_CHAVE_EMAIL;
    }
    if (['3', '03', '003', 'CPF', 'CNPJ', 'CPF_CNPJ', 'CPF/CNPJ'].includes(normalized)) {
        return TIPO_CHAVE_CPF_CNPJ;
    }
    if (['4', '04', '004', 'EVP', 'ALEATORIA', 'ALEATÓRIA', 'RANDOM'].includes(normalized)) {
        return TIPO_CHAVE_ALEATORIA;
    }
    return TIPO_CHAVE_CPF_CNPJ;
}
function normalizePixKey(payment) {
    const tipoChavePix = normalizeTipoChavePix(payment.tipoChavePix);
    const rawKey = `${payment.chavePix || payment.numeroInscricaoFavorecido || ''}`.trim();
    if (tipoChavePix === TIPO_CHAVE_CPF_CNPJ || tipoChavePix === TIPO_CHAVE_TELEFONE) {
        return onlyDigits(rawKey);
    }
    return rawKey;
}
function buildSegmentB(payment, batchNumber, sequence) {
    if (isPixPayment(payment)) {
        const tipoChavePix = normalizeTipoChavePix(payment.tipoChavePix);
        const chavePix = normalizePixKey(payment);
        return buildLine([
            BANCO_SICOOB,
            numeric(batchNumber, 4),
            '3',
            numeric(sequence, 5),
            'B',
            // Manual CNAB 240 Sicoob, Segmento B/G100: forma de iniciação PIX nas posições 15-17.
            numeric(tipoChavePix, 3),
            numeric(payment.tipoInscricaoFavorecido, 1),
            numeric(payment.numeroInscricaoFavorecido, 14),
            // Manual CNAB 240 Sicoob, Segmento B/G101: TXID nas posições 33-67.
            alpha(payment.txIdPix, 35),
            alpha('', 60),
            // Manual CNAB 240 Sicoob, Segmento B/G101: chave PIX nas posições 128-162.
            alpha(chavePix, 35),
            numeric(0, 6),
            alpha('', 72),
        ]);
    }
    return buildLine([
        BANCO_SICOOB,
        numeric(batchNumber, 4),
        '3',
        numeric(sequence, 5),
        'B',
        alpha('', 3),
        numeric(payment.tipoInscricaoFavorecido, 1),
        numeric(payment.numeroInscricaoFavorecido, 14),
        alpha(payment.logradouroFavorecido, 30),
        alpha(payment.numeroEnderecoFavorecido, 5),
        alpha(payment.complementoFavorecido, 15),
        alpha(payment.bairroFavorecido, 15),
        alpha(payment.cidadeFavorecido, 20),
        numeric(payment.cepFavorecido, 8),
        alpha(payment.ufFavorecido, 2),
        date(payment.dataVencimento || payment.dataPagamento),
        amount(payment.valor),
        amount(0),
        amount(0),
        amount(0),
        amount(0),
        alpha(payment.numeroDocumento, 15),
        alpha('', 15),
    ]);
}
function buildSegmentJ(payment, batchNumber, sequence) {
    return buildLine([
        BANCO_SICOOB,
        numeric(batchNumber, 4),
        '3',
        numeric(sequence, 5),
        'J',
        '000',
        numeric(payment.codigoBarras, 44),
        alpha(payment.nomeFavorecido, 30),
        date(payment.dataVencimento || payment.dataPagamento),
        amount(payment.valor),
        amount(0),
        amount(0),
        date(payment.dataPagamento),
        amount(payment.valor),
        numeric(0, 15),
        alpha(payment.seuNumero, 20),
        alpha('', 20),
        '09',
        alpha('', 6),
        alpha('', 10),
    ]);
}
function buildSegmentJ52(payment, company, batchNumber, sequence) {
    const tipoInscricaoPagador = payment.tipoInscricaoPagador || company.tipoInscricao;
    const numeroInscricaoPagador = payment.numeroInscricaoPagador || company.numeroInscricao;
    const nomePagador = payment.nomePagador || company.nome;
    return buildLine([
        BANCO_SICOOB,
        numeric(batchNumber, 4),
        '3',
        numeric(sequence, 5),
        'J',
        '000',
        '52',
        numeric(tipoInscricaoPagador, 1),
        numeric(numeroInscricaoPagador, 15),
        alpha(nomePagador, 40),
        numeric(payment.tipoInscricaoFavorecido, 1),
        numeric(payment.numeroInscricaoFavorecido, 15),
        alpha(payment.nomeFavorecido, 40),
        numeric(0, 1),
        numeric(0, 15),
        alpha('', 40),
        alpha('', 53),
    ]);
}
function getRecordCount(payments) {
    return payments.length * 2;
}
function buildBatchTrailer(payments, batchNumber) {
    const recordCount = getRecordCount(payments) + 2;
    const totalAmount = payments.reduce((total, payment) => total + (Number(payment.valor) || 0), 0);
    return buildLine([
        BANCO_SICOOB,
        numeric(batchNumber, 4),
        '5',
        alpha('', 9),
        numeric(recordCount, 6),
        amount(totalAmount, 18),
        numeric(0, 18),
        numeric(0, 6),
        alpha('', 175),
    ]);
}
function buildFileTrailer(batchCount, recordCount) {
    return buildLine([
        BANCO_SICOOB,
        '9999',
        '9',
        alpha('', 9),
        numeric(batchCount, 6),
        numeric(recordCount, 6),
        numeric(0, 6),
        alpha('', 205),
    ]);
}
function groupPaymentsByBatchKind(payments) {
    return payments.reduce((batches, payment) => {
        const kind = getBatchKind(payment);
        const existingBatch = batches.find((batch) => batch.kind === kind);
        if (existingBatch) {
            existingBatch.payments.push(payment);
        }
        else {
            batches.push({ kind, payments: [payment] });
        }
        return batches;
    }, []);
}
function buildCnab240SicoobPaymentRemittance(options) {
    if (options.payments.length === 0) {
        throw new Error('Nenhum pagamento informado para gerar a remessa CNAB 240 Sicoob.');
    }
    const batches = groupPaymentsByBatchKind(options.payments);
    const lines = [
        buildFileHeader(options.company, options.generationDate, options.fileSequence),
    ];
    for (const [batchIndex, batch] of batches.entries()) {
        const batchNumber = batchIndex + 1;
        lines.push(buildBatchHeader(options.company, batchNumber, batch.kind));
        let sequence = 1;
        for (const payment of batch.payments) {
            if (payment.codigoBarras) {
                lines.push(buildSegmentJ(payment, batchNumber, sequence));
                lines.push(buildSegmentJ52(payment, options.company, batchNumber, sequence + 1));
                sequence += 2;
            }
            else {
                lines.push(buildSegmentA(payment, batchNumber, sequence));
                lines.push(buildSegmentB(payment, batchNumber, sequence + 1));
                sequence += 2;
            }
        }
        lines.push(buildBatchTrailer(batch.payments, batchNumber));
    }
    lines.push(buildFileTrailer(batches.length, lines.length + 1));
    return `${lines.join('\r\n')}\r\n`;
}
function getJsonValue(item, path, fallback = '') {
    if (!path) {
        return fallback;
    }
    return path.split('.').reduce((value, key) => {
        if (value && typeof value === 'object' && key in value) {
            return value[key];
        }
        return undefined;
    }, item) ?? fallback;
}
//# sourceMappingURL=cnab240Sicoob.js.map