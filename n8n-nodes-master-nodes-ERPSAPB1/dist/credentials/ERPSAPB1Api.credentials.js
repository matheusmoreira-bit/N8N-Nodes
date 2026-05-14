"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERPSAPB1Api = void 0;
class ERPSAPB1Api {
    constructor() {
        this.name = 'erpSAPB1Api';
        this.displayName = 'ERPSAPB1 API';
        this.documentationUrl = 'erpsapb1';
        this.properties = [
            {
                displayName: 'URL base',
                name: 'baseUrl',
                type: 'string',
                placeholder: 'http://URL',
                description: 'O url da api SAP B1.',
                default: '',
                required: true,
            },
            {
                displayName: 'Usuário',
                name: 'authUser',
                type: 'string',
                description: 'O nome de usuário para gerar o token de endpoint.',
                default: '',
                required: true,
            },
            {
                displayName: 'Senha',
                name: 'authPassword',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                description: 'A senha para gerar o token de endpoint.',
                default: '',
                required: true,
            },
            {
                displayName: 'Company Database',
                name: 'authCompanyDb',
                type: 'string',
                description: 'A chave CompanyDB para gerar o token de endpoint.',
                default: '',
                required: true,
            },
        ];
    }
}
exports.ERPSAPB1Api = ERPSAPB1Api;
