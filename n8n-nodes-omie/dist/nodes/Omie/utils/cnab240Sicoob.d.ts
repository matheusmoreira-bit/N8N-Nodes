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
    tipoPagamento?: string;
    tipoChavePix?: string;
    chavePix?: string;
    txIdPix?: string;
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
export declare function buildCnab240SicoobPaymentRemittance(options: Cnab240SicoobOptions): string;
export declare function getJsonValue(item: IDataObject, path: string, fallback?: unknown): unknown;
