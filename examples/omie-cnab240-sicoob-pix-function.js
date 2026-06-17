// n8n Function/Code node - Run Once for All Items
// CNAB 240 Sicoob pagamentos: TED legado, boleto J/J52 e PIX Transferencia por chave.

const BANCO_SICOOB = '756';
const TIPO_SERVICO_PAGAMENTO_FORNECEDOR = '20';
const FORMA_LANCAMENTO_TED = '41';
const FORMA_LANCAMENTO_PIX = '45';
const LAYOUT_LOTE_TED = '045';
const LAYOUT_LOTE_PIX = '046';
const CAMARA_TED = '018';
const CAMARA_PIX = '009';
const BANCO_FAVORECIDO_PIX_CHAVE = '000';
const TIPO_CHAVE_TELEFONE = '001';
const TIPO_CHAVE_EMAIL = '002';
const TIPO_CHAVE_CPF_CNPJ = '003';
const TIPO_CHAVE_ALEATORIA = '004';

const firstJson = items[0]?.json ?? {};
const CONFIG = {
  convenio: pick(firstJson, ['companyConvenio', 'company.convenio', 'convenio']),
  tipoInscricao: pick(firstJson, ['companyTipoInscricao', 'company.tipoInscricao', 'tipo_inscricao_empresa']) || '2',
  numeroInscricao: pick(firstJson, ['companyNumeroInscricao', 'company.numeroInscricao', 'cnpj_empresa']),
  agencia: pick(firstJson, ['companyAgencia', 'company.agencia']),
  conta: pick(firstJson, ['companyConta', 'company.conta']),
  contaDv: pick(firstJson, ['companyContaDv', 'company.contaDv', 'company.digitoConta']),
  nome: pick(firstJson, ['companyNome', 'company.nome', 'razao_social_empresa']),
  endereco: pick(firstJson, ['companyEndereco', 'company.endereco']) || '',
  numeroEndereco: pick(firstJson, ['companyNumeroEndereco', 'company.numeroEndereco']) || '',
  complemento: pick(firstJson, ['companyComplemento', 'company.complemento']) || '',
  cidade: pick(firstJson, ['companyCidade', 'company.cidade']) || '',
  cep: pick(firstJson, ['companyCep', 'company.cep']) || '',
  uf: pick(firstJson, ['companyUf', 'company.uf']) || '',
  fileSequence: Number(pick(firstJson, ['fileSequence', 'sequencial_arquivo']) || 1),
  fileName: pick(firstJson, ['fileName', 'nome_arquivo']) || '',
};

const generationDate = new Date();
const payables = flattenPayables(items.map((item) => item.json));
const payments = payables.map(normalizePayment).filter(Boolean);

if (payments.length === 0) {
  throw new Error('Nenhum pagamento valido foi encontrado para gerar a remessa.');
}

const fileName = CONFIG.fileName || `PG${datePart(generationDate)}${String(CONFIG.fileSequence).padStart(2, '0')}.REM`;
const content = buildRemittance(CONFIG, payments, CONFIG.fileSequence, generationDate);
const binaryData = Buffer.from(content, 'ascii').toString('base64');

return [{
  json: {
    fileName,
    bank: 'Sicoob',
    layout: 'CNAB240',
    payments: payments.length,
    pixPayments: payments.filter(isPixPayment).length,
    totalAmount: payments.reduce((sum, payment) => sum + payment.valor, 0),
    lines: content.trimEnd().split('\r\n').length,
    content,
  },
  binary: {
    data: {
      data: binaryData,
      fileName,
      mimeType: 'text/plain',
    },
  },
}];

function normalizePayment(json) {
  const barcode = normalizeBarcode(pick(json, [
    'codigo_barras_ficha_compensacao',
    'codigo_barras',
    'linha_digitavel',
    'boleto.codigo_barras',
    'boleto.linha_digitavel',
  ]));
  const value = parsePaymentAmount(json);
  if (value <= 0) return undefined;

  const favoredDocument = onlyDigits(pick(json, [
    'cnab_integracao_bancaria.cpf_cnpj_transferencia',
    'cpf_cnpj_favorecido',
    'cpf_cnpj',
    'cnpj_cpf',
    'cnpj',
    'cpf',
  ]));
  const favoredName = pick(json, [
    'cnab_integracao_bancaria.nome_transferencia',
    'nome_favorecido',
    'razao_social',
    'nome_fantasia',
    'cliente_nome',
  ]);
  const paymentDate = pick(json, ['data_previsao', 'data_pagamento', 'data_vencimento']);
  const dueDate = pick(json, ['data_vencimento', 'data_previsao', 'data_pagamento']);
  const documentNumber = String(pick(json, ['numero_documento_fiscal', 'numero_documento', 'codigo_lancamento_integracao']) || '');
  const seuNumero = String(pick(json, ['codigo_lancamento_omie', 'codigo_lancamento', 'codigo_lancamento_integracao', 'numero_documento_fiscal']) || documentNumber);

  if (barcode) {
    return basePayment({ barcode, favoredDocument, favoredName, paymentDate, dueDate, value, documentNumber, seuNumero });
  }

  if (isPixJson(json)) {
    const transferDocument = onlyDigits(pick(json, ['cnab_integracao_bancaria.cpf_cnpj_transferencia']));
    const rawKey = transferDocument;
    const keyType = inferPixKeyType(rawKey);
    const pixKey = normalizePixKey(rawKey, keyType);
    if (!pixKey || !favoredDocument || !favoredName) return undefined;

    return {
      ...basePayment({ favoredDocument, favoredName, paymentDate, dueDate, value, documentNumber, seuNumero }),
      tipoPagamento: 'PIX',
      tipoChavePix: keyType,
      chavePix: pixKey,
      txIdPix: String(pick(json, ['txid', 'tx_id', 'pix_txid', 'id_conciliacao']) || ''),
      codigoBancoFavorecido: '',
      agenciaFavorecido: '',
      agenciaDvFavorecido: '',
      contaFavorecido: '',
      contaDvFavorecido: '',
    };
  }

  const account = splitValueAndDigit(String(pick(json, [
    'cnab_integracao_bancaria.conta_corrente_transferencia',
    'conta_corrente_favorecido',
    'conta_corrente',
    'conta',
  ]) || ''), String(pick(json, ['conta_dv_favorecido', 'digito_conta']) || ''));

  return {
    ...basePayment({ favoredDocument, favoredName, paymentDate, dueDate, value, documentNumber, seuNumero }),
    codigoBancoFavorecido: String(pick(json, ['cnab_integracao_bancaria.banco_transferencia', 'codigo_banco_favorecido', 'codigo_banco']) || ''),
    agenciaFavorecido: String(pick(json, ['cnab_integracao_bancaria.agencia_transferencia', 'agencia_favorecido', 'agencia']) || ''),
    agenciaDvFavorecido: String(pick(json, ['agencia_dv_favorecido', 'digito_agencia']) || ''),
    contaFavorecido: account.value,
    contaDvFavorecido: account.digit,
  };
}

function basePayment({ barcode = '', favoredDocument, favoredName, paymentDate, dueDate, value, documentNumber, seuNumero }) {
  return {
    codigoBarras: barcode,
    nomeFavorecido: favoredName,
    tipoInscricaoFavorecido: favoredDocument.length <= 11 ? '1' : '2',
    numeroInscricaoFavorecido: favoredDocument,
    dataPagamento: paymentDate,
    dataVencimento: dueDate || paymentDate,
    valor: value,
    numeroDocumento: documentNumber,
    seuNumero,
    logradouroFavorecido: '',
    numeroEnderecoFavorecido: '',
    complementoFavorecido: '',
    bairroFavorecido: '',
    cidadeFavorecido: '',
    cepFavorecido: '',
    ufFavorecido: '',
  };
}

function buildRemittance(company, payments, fileSequence, generatedAt) {
  const batches = groupByKind(payments);
  const lines = [buildFileHeader(company, generatedAt, fileSequence)];
  for (const [index, batch] of batches.entries()) {
    const batchNumber = index + 1;
    lines.push(buildBatchHeader(company, batchNumber, batch.kind));
    let sequence = 1;
    for (const payment of batch.payments) {
      if (payment.codigoBarras) {
        lines.push(buildSegmentJ(payment, batchNumber, sequence));
        lines.push(buildSegmentJ52(payment, company, batchNumber, sequence + 1));
      } else {
        lines.push(buildSegmentA(payment, batchNumber, sequence));
        lines.push(buildSegmentB(payment, batchNumber, sequence + 1));
      }
      sequence += 2;
    }
    lines.push(buildBatchTrailer(batch.payments, batchNumber));
  }
  lines.push(buildFileTrailer(batches.length, lines.length + 1));
  return `${lines.join('\r\n')}\r\n`;
}

function buildFileHeader(company, generatedAt, fileSequence) {
  return line([
    BANCO_SICOOB, '0000', '0', a('', 9), n(company.tipoInscricao, 1), n(company.numeroInscricao, 14),
    a(company.convenio, 20), n(company.agencia, 5), a('', 1), accountWithDv(company.conta, company.contaDv),
    a('', 1), a(company.nome, 30), a('SICOOB', 30), a('', 10), '1', date(generatedAt.toISOString()),
    time(generatedAt), n(fileSequence, 6), '087', '01600', a('', 69),
  ]);
}

function buildBatchHeader(company, batchNumber, kind) {
  const isPix = kind === 'pix';
  return line([
    BANCO_SICOOB, n(batchNumber, 4), '1', 'C', TIPO_SERVICO_PAGAMENTO_FORNECEDOR,
    // Manual CNAB 240 Sicoob/G029: 45 = Pix Transferencia; 41 = TED.
    isPix ? FORMA_LANCAMENTO_PIX : FORMA_LANCAMENTO_TED,
    isPix ? LAYOUT_LOTE_PIX : LAYOUT_LOTE_TED,
    a('', 1), n(company.tipoInscricao, 1), n(company.numeroInscricao, 14), a(company.convenio, 20),
    n(company.agencia, 5), a('', 1), accountWithDv(company.conta, company.contaDv), a('', 1),
    a(company.nome, 30), a('', 40), a(company.endereco, 30), a(company.numeroEndereco, 5),
    a(company.complemento, 15), a(company.cidade, 20), n(company.cep, 8), a(company.uf, 2), a('', 8), a('', 10),
  ]);
}

function buildSegmentA(payment, batchNumber, sequence) {
  const isPix = isPixPayment(payment);
  return line([
    BANCO_SICOOB, n(batchNumber, 4), '3', n(sequence, 5), 'A', '000',
    // Manual CNAB 240 Sicoob/P001: 009 = Pix (SPI); 018 = TED (STR/CIP).
    isPix ? CAMARA_PIX : CAMARA_TED,
    isPix ? BANCO_FAVORECIDO_PIX_CHAVE : n(payment.codigoBancoFavorecido, 3),
    isPix ? n(0, 5) : n(payment.agenciaFavorecido, 5), isPix ? a('', 1) : a(payment.agenciaDvFavorecido, 1),
    isPix ? accountWithDv('', '') : accountWithDv(payment.contaFavorecido, payment.contaDvFavorecido),
    a('', 1), a(payment.nomeFavorecido, 30), a(payment.seuNumero, 20), date(payment.dataPagamento), 'BRL',
    n(0, 15), amount(payment.valor), a(payment.numeroDocumento, 20), n(0, 8), amount(0),
    a('', 40), a('', 2), n(0, 5), a('', 5), n(0, 1), a('', 10),
  ]);
}

function buildSegmentB(payment, batchNumber, sequence) {
  if (isPixPayment(payment)) {
    return line([
      BANCO_SICOOB, n(batchNumber, 4), '3', n(sequence, 5), 'B',
      // Manual CNAB 240 Sicoob/G100: forma de iniciacao PIX nas posicoes 15-17.
      n(normalizePixKeyType(payment.tipoChavePix), 3),
      n(payment.tipoInscricaoFavorecido, 1), n(payment.numeroInscricaoFavorecido, 14),
      // Manual CNAB 240 Sicoob/G101: TXID posicoes 33-67 e chave PIX posicoes 128-162.
      a(payment.txIdPix, 35), a('', 60), a(normalizePixKey(payment.chavePix, payment.tipoChavePix), 35),
      n(0, 6), a('', 72),
    ]);
  }

  return line([
    BANCO_SICOOB, n(batchNumber, 4), '3', n(sequence, 5), 'B', a('', 3),
    n(payment.tipoInscricaoFavorecido, 1), n(payment.numeroInscricaoFavorecido, 14),
    a(payment.logradouroFavorecido, 30), a(payment.numeroEnderecoFavorecido, 5), a(payment.complementoFavorecido, 15),
    a(payment.bairroFavorecido, 15), a(payment.cidadeFavorecido, 20), n(payment.cepFavorecido, 8), a(payment.ufFavorecido, 2),
    date(payment.dataVencimento || payment.dataPagamento), amount(payment.valor), amount(0), amount(0), amount(0), amount(0),
    a(payment.numeroDocumento, 15), a('', 15),
  ]);
}

function buildSegmentJ(payment, batchNumber, sequence) {
  return line([BANCO_SICOOB, n(batchNumber, 4), '3', n(sequence, 5), 'J', '000', n(payment.codigoBarras, 44), a(payment.nomeFavorecido, 30), date(payment.dataVencimento || payment.dataPagamento), amount(payment.valor), amount(0), amount(0), date(payment.dataPagamento), amount(payment.valor), n(0, 15), a(payment.seuNumero, 20), a('', 20), '09', a('', 6), a('', 10)]);
}

function buildSegmentJ52(payment, company, batchNumber, sequence) {
  return line([BANCO_SICOOB, n(batchNumber, 4), '3', n(sequence, 5), 'J', '000', '52', n(company.tipoInscricao, 1), n(company.numeroInscricao, 15), a(company.nome, 40), n(payment.tipoInscricaoFavorecido, 1), n(payment.numeroInscricaoFavorecido, 15), a(payment.nomeFavorecido, 40), n(0, 1), n(0, 15), a('', 40), a('', 53)]);
}

function buildBatchTrailer(batchPayments, batchNumber) {
  const total = batchPayments.reduce((sum, payment) => sum + payment.valor, 0);
  return line([BANCO_SICOOB, n(batchNumber, 4), '5', a('', 9), n(batchPayments.length * 2 + 2, 6), amount(total, 18), n(0, 18), n(0, 6), a('', 175)]);
}

function buildFileTrailer(batchCount, recordCount) {
  return line([BANCO_SICOOB, '9999', '9', a('', 9), n(batchCount, 6), n(recordCount, 6), n(0, 6), a('', 205)]);
}

function groupByKind(payments) {
  return payments.reduce((groups, payment) => {
    const kind = !payment.codigoBarras && isPixPayment(payment) ? 'pix' : 'standard';
    let group = groups.find((item) => item.kind === kind);
    if (!group) groups.push(group = { kind, payments: [] });
    group.payments.push(payment);
    return groups;
  }, []);
}

function flattenPayables(jsonItems) {
  const arrayKeys = ['conta_pagar_cadastro', 'contas_pagar', 'items', 'data', 'result', 'results'];
  return jsonItems.flatMap((json) => {
    for (const key of arrayKeys) {
      const value = get(json, key);
      if (Array.isArray(value)) return value;
    }
    return [json];
  }).filter((item) => item && typeof item === 'object');
}

function isPixJson(json) {
  const paymentType = String(pick(json, [
    'codigo_tipo_documento',
    'tipoPagamento',
    'tipo_pagamento',
    'pagamento.tipoPagamento',
    'pagamento.tipo_pagamento',
  ]) || '').trim().toUpperCase();

  return paymentType === 'PIX';
}

function isPixPayment(payment) {
  return String(payment.tipoPagamento || '').toUpperCase() === 'PIX' || Boolean(payment.chavePix);
}

function inferPixKeyType(value) {
  const text = String(value || '').trim();
  const digits = onlyDigits(text);
  if (digits.length === 11 || digits.length === 14) return TIPO_CHAVE_CPF_CNPJ;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) return TIPO_CHAVE_EMAIL;
  if (/^\+?\d{10,13}$/.test(digits)) return TIPO_CHAVE_TELEFONE;
  if (isUuidV4(text)) return TIPO_CHAVE_ALEATORIA;
  return TIPO_CHAVE_CPF_CNPJ;
}

function normalizePixKeyType(value) {
  const text = String(value || '').toUpperCase();
  if (['1', '01', '001', 'TELEFONE', 'PHONE'].includes(text)) return TIPO_CHAVE_TELEFONE;
  if (['2', '02', '002', 'EMAIL', 'E-MAIL'].includes(text)) return TIPO_CHAVE_EMAIL;
  if (['3', '03', '003', 'CPF', 'CNPJ', 'CPF/CNPJ'].includes(text)) return TIPO_CHAVE_CPF_CNPJ;
  if (['4', '04', '004', 'EVP', 'ALEATORIA', 'ALEATÓRIA', 'RANDOM'].includes(text)) return TIPO_CHAVE_ALEATORIA;
  return TIPO_CHAVE_CPF_CNPJ;
}

function normalizePixKey(value, type) {
  const keyType = normalizePixKeyType(type);
  const text = String(value || '').trim();
  return keyType === TIPO_CHAVE_CPF_CNPJ || keyType === TIPO_CHAVE_TELEFONE ? onlyDigits(text) : text;
}

function normalizeBarcode(value) {
  const digits = onlyDigits(value);
  if (digits.length === 44) return digits;
  if (digits.length === 47) return [digits.slice(0, 4), digits.slice(32, 33), digits.slice(33, 47), digits.slice(4, 9), digits.slice(10, 20), digits.slice(21, 31)].join('');
  return '';
}

function splitValueAndDigit(value, explicitDigit = '') {
  const digit = String(explicitDigit || '').trim();
  const text = String(value || '').trim();
  if (digit) return { value: text, digit };
  const match = /^(.+?)[\s\-/]([0-9A-Za-z])$/.exec(text);
  return match ? { value: match[1].trim(), digit: match[2].trim() } : { value: text, digit: '' };
}

function pick(obj, paths) {
  for (const path of paths) {
    const value = get(obj, path);
    if (value !== undefined && value !== null && String(value).trim() !== '') return value;
  }
  return '';
}

function get(obj, path) {
  return String(path).split('.').reduce((value, key) => value && typeof value === 'object' ? value[key] : undefined, obj);
}

function parseAmount(value) {
  if (typeof value === 'number') return value;
  const text = String(value || '').replace(/[^\d,.-]/g, '');
  if (!text) return 0;
  const decimal = text.lastIndexOf(',') > text.lastIndexOf('.') ? ',' : '.';
  const normalized = text.replace(new RegExp(`\\${decimal === ',' ? '.' : ','}`, 'g'), '').replace(decimal, '.');
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function parsePaymentAmount(json) {
  const rawValue = pick(json, [
    'valor_documento',
    'valor_titulo',
    'valor_pagamento',
    'valor_liquido',
    'valor_total',
    'valor',
  ]);

  return parseAmount(rawValue);
}

function isUuidV4(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || '').trim());
}

function onlyDigits(value) {
  return String(value || '').replace(/\D/g, '');
}

function strip(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function a(value, length) {
  return strip(value).toUpperCase().replace(/[^A-Z0-9 .,&\-/]/g, ' ').slice(0, length).padEnd(length, ' ');
}

function n(value, length) {
  return onlyDigits(value).slice(-length).padStart(length, '0');
}

function amount(value, length = 15) {
  return String(Math.round((Number(value) || 0) * 100)).padStart(length, '0').slice(-length);
}

function date(value) {
  const text = String(value || '').trim();
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (br) return `${br[1]}${br[2]}${br[3]}`;
  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return n(text, 8);
  return `${String(parsed.getDate()).padStart(2, '0')}${String(parsed.getMonth() + 1).padStart(2, '0')}${parsed.getFullYear()}`;
}

function time(value) {
  return `${String(value.getHours()).padStart(2, '0')}${String(value.getMinutes()).padStart(2, '0')}${String(value.getSeconds()).padStart(2, '0')}`;
}

function datePart(value) {
  return `${String(value.getDate()).padStart(2, '0')}${String(value.getMonth() + 1).padStart(2, '0')}${String(value.getFullYear()).slice(-2)}`;
}

function accountWithDv(account, dv) {
  return `${n(account, 12)}${a(dv, 1)}`;
}

function line(parts) {
  const result = parts.join('');
  if (result.length !== 240) throw new Error(`Registro CNAB 240 invalido: esperado 240 posicoes, recebido ${result.length}.`);
  return result;
}
