import { IDataObject } from 'n8n-workflow';

export interface Cnab240SicoobCompanyData {
    convenio: string;
    tipoInscricao: string;
    numeroInscricao: string;
    agencia: string;
    conta: string;
    contaDv: string;
    nome: string;
    endereco: string;
    numeroEndereco: string;
    complemento: string;
    cidade: string;
    cep: string;
    uf: string;
}

export interface Cnab240SicoobPaymentData {
    codigoBarras?: string;
    codigoBancoFavorecido: string;
    agenciaFavorecido: string;
    agenciaDvFavorecido: string;
    contaFavorecido: string;
    contaDvFavorecido: string;
    nomeFavorecido: string;
    tipoInscricaoFavorecido: string;
    numeroInscricaoFavorecido: string;
    nomePagador?: string;
    tipoInscricaoPagador?: string;
    numeroInscricaoPagador?: string;
    logradouroFavorecido: string;
    numeroEnderecoFavorecido: string;
    complementoFavorecido: string;
    bairroFavorecido: string;
    cidadeFavorecido: string;
    cepFavorecido: string;
    ufFavorecido: string;
    dataPagamento: string;
    dataVencimento: string;
    valor: number;
    numeroDocumento: string;
    seuNumero: string;
}

export interface Cnab240SicoobOptions {
    company: Cnab240SicoobCompanyData;
    payments: Cnab240SicoobPaymentData[];
    fileSequence: number;
    generationDate: Date;
}

function onlyDigits(value: unknown): string {
    return `${value ?? ''}`.replace(/\D/g, '');
}

function stripAccents(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function alpha(value: unknown, length: number): string {
    const normalized = stripAccents(`${value ?? ''}`)
        .toUpperCase()
        .replace(/[^A-Z0-9 .,&\-/]/g, ' ')
        .slice(0, length);

    return normalized.padEnd(length, ' ');
}

function numeric(value: unknown, length: number): string {
    return onlyDigits(value).slice(-length).padStart(length, '0');
}

function amount(value: number, length = 15): string {
    const cents = Math.round((Number(value) || 0) * 100);
    return `${cents}`.padStart(length, '0').slice(-length);
}

function date(value: unknown): string {
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

function time(value: Date): string {
    return `${value.getHours()}`.padStart(2, '0')
        + `${value.getMinutes()}`.padStart(2, '0')
        + `${value.getSeconds()}`.padStart(2, '0');
}

function buildLine(parts: Array<string>): string {
    const line = parts.join('');
    if (line.length !== 240) {
        throw new Error(`Registro CNAB 240 inválido: esperado 240 posições, recebido ${line.length}.`);
    }
    return line;
}

function accountWithDv(account: string, dv: string): string {
    return `${numeric(account, 12)}${alpha(dv, 1)}`;
}

function buildFileHeader(company: Cnab240SicoobCompanyData, generationDate: Date, fileSequence: number): string {
    return buildLine([
        '756',
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

function buildBatchHeader(company: Cnab240SicoobCompanyData): string {
    return buildLine([
        '756',
        '0001',
        '1',
        'C',
        '20',
        '41',
        '045',
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

function buildSegmentA(payment: Cnab240SicoobPaymentData, sequence: number): string {
    return buildLine([
        '756',
        '0001',
        '3',
        numeric(sequence, 5),
        'A',
        '000',
        '018',
        numeric(payment.codigoBancoFavorecido, 3),
        numeric(payment.agenciaFavorecido, 5),
        alpha(payment.agenciaDvFavorecido, 1),
        accountWithDv(payment.contaFavorecido, payment.contaDvFavorecido),
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

function buildSegmentB(payment: Cnab240SicoobPaymentData, sequence: number): string {
    return buildLine([
        '756',
        '0001',
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

function buildSegmentJ(payment: Cnab240SicoobPaymentData, sequence: number): string {
    return buildLine([
        '756',
        '0001',
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

function buildSegmentJ52(
    payment: Cnab240SicoobPaymentData,
    company: Cnab240SicoobCompanyData,
    sequence: number,
): string {
    const tipoInscricaoPagador = payment.tipoInscricaoPagador || company.tipoInscricao;
    const numeroInscricaoPagador = payment.numeroInscricaoPagador || company.numeroInscricao;
    const nomePagador = payment.nomePagador || company.nome;

    return buildLine([
        '756',
        '0001',
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

function getRecordCount(payments: Cnab240SicoobPaymentData[]): number {
    return payments.reduce((count, payment) => count + (payment.codigoBarras ? 2 : 2), 0);
}

function buildBatchTrailer(payments: Cnab240SicoobPaymentData[]): string {
    const recordCount = getRecordCount(payments) + 2;
    const totalAmount = payments.reduce((total, payment) => total + (Number(payment.valor) || 0), 0);

    return buildLine([
        '756',
        '0001',
        '5',
        alpha('', 9),
        numeric(recordCount, 6),
        amount(totalAmount, 18),
        numeric(0, 18),
        numeric(0, 6),
        alpha('', 175),
    ]);
}

function buildFileTrailer(payments: Cnab240SicoobPaymentData[]): string {
    const recordCount = getRecordCount(payments) + 4;

    return buildLine([
        '756',
        '9999',
        '9',
        alpha('', 9),
        numeric(1, 6),
        numeric(recordCount, 6),
        numeric(0, 6),
        alpha('', 205),
    ]);
}

export function buildCnab240SicoobPaymentRemittance(options: Cnab240SicoobOptions): string {
    if (options.payments.length === 0) {
        throw new Error('Nenhum pagamento informado para gerar a remessa CNAB 240 Sicoob.');
    }

    const lines: string[] = [
        buildFileHeader(options.company, options.generationDate, options.fileSequence),
        buildBatchHeader(options.company),
    ];

    let sequence = 1;
    for (const payment of options.payments) {
        if (payment.codigoBarras) {
            lines.push(buildSegmentJ(payment, sequence));
            lines.push(buildSegmentJ52(payment, options.company, sequence + 1));
            sequence += 2;
        } else {
            lines.push(buildSegmentA(payment, sequence));
            lines.push(buildSegmentB(payment, sequence + 1));
            sequence += 2;
        }
    }

    lines.push(buildBatchTrailer(options.payments));
    lines.push(buildFileTrailer(options.payments));

    return `${lines.join('\r\n')}\r\n`;
}

export function getJsonValue(item: IDataObject, path: string, fallback: unknown = ''): unknown {
    if (!path) {
        return fallback;
    }

    return path.split('.').reduce<unknown>((value, key) => {
        if (value && typeof value === 'object' && key in value) {
            return (value as IDataObject)[key];
        }
        return undefined;
    }, item) ?? fallback;
}
