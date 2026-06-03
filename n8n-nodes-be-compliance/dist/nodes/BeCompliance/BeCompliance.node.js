"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeCompliance = void 0;
const axios_1 = __importDefault(require("axios"));
class BeCompliance {
    constructor() {
        this.description = {
            displayName: 'Be Compliance',
            name: 'beCompliance',
            icon: 'file:becompliance.png',
            group: ['transform'],
            version: 1,
            description: 'Interact with BeCompliance API (PF and PJ)',
            defaults: {
                name: 'Be Compliance',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'beComplianceApi',
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Due Diligence (PF)',
                            value: 'dueDiligence',
                        },
                        {
                            name: 'Third Party Analysis (PJ)',
                            value: 'thirdPartyAnalysis',
                        },
                    ],
                    default: 'dueDiligence',
                },
                {
                    displayName: 'Operation',
                    name: 'operation',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Get',
                            value: 'get',
                            description: 'Get record by document number',
                            action: 'Get record by document',
                        },
                        {
                            name: 'Create',
                            value: 'create',
                            description: 'Create a new record',
                            action: 'Create record',
                        },
                    ],
                    default: 'get',
                },
                // ----------------------------------
                // PJ Parameters
                // ----------------------------------
                {
                    displayName: 'Search Type',
                    name: 'searchType',
                    type: 'options',
                    displayOptions: {
                        show: {
                            resource: ['thirdPartyAnalysis'],
                            operation: ['get'],
                        },
                    },
                    options: [
                        { name: 'CNPJ', value: 'cnpj' },
                        { name: 'Name', value: 'name' },
                    ],
                    default: 'cnpj',
                },
                {
                    displayName: 'Value',
                    name: 'searchValue',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['thirdPartyAnalysis'],
                            operation: ['get'],
                        },
                    },
                    default: '',
                    required: true,
                },
                {
                    displayName: 'CNPJ',
                    name: 'cnpj',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['thirdPartyAnalysis'],
                            operation: ['create'],
                        },
                    },
                    default: '',
                    required: true,
                },
                {
                    displayName: 'Name',
                    name: 'name',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['thirdPartyAnalysis'],
                            operation: ['create'],
                        },
                    },
                    default: '',
                    required: true,
                },
                // ----------------------------------
                // PF Parameters
                // ----------------------------------
                {
                    displayName: 'CPF',
                    name: 'cpf',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['dueDiligence'],
                        },
                    },
                    default: '',
                    required: true,
                },
                {
                    displayName: 'Notes',
                    name: 'notes',
                    type: 'string',
                    displayOptions: {
                        show: {
                            resource: ['dueDiligence'],
                            operation: ['create'],
                        },
                    },
                    default: '',
                },
            ],
        };
    }
    async execute() {
        var _a;
        const items = this.getInputData();
        const returnData = [];
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        const credentials = await this.getCredentials('beComplianceApi');
        const tenantId = credentials.tenantId;
        const email = credentials.email;
        const password = credentials.password;
        // 1. Auth Login (shared for both domains)
        let token = '';
        try {
            const loginResponse = await axios_1.default.post(`https://api.becompliance.com/ext/v1/${tenantId}/auth/login`, {
                email,
                password,
            });
            token = loginResponse.data.access_token;
        }
        catch (error) {
            throw new Error(`Falha na autenticação BeCompliance: ${error.message}`);
        }
        for (let i = 0; i < items.length; i++) {
            try {
                let response;
                const headers = { Authorization: `Bearer ${token}` };
                if (resource === 'thirdPartyAnalysis') {
                    const baseUrl = `https://api.becompliance.com/ext/v1/${tenantId}/third-party-analysis`;
                    if (operation === 'get') {
                        const searchType = this.getNodeParameter('searchType', i);
                        const searchValue = this.getNodeParameter('searchValue', i);
                        response = await axios_1.default.get(baseUrl, {
                            headers,
                            params: { [searchType]: searchValue },
                        });
                    }
                    else if (operation === 'create') {
                        const cnpj = this.getNodeParameter('cnpj', i);
                        const name = this.getNodeParameter('name', i);
                        response = await axios_1.default.post(baseUrl, {
                            name,
                            cnpj: cnpj.replace(/[^0-9]/g, ''),
                            alternative_names: [name],
                            is_international: cnpj.replace(/[^0-9]/g, '').length <= 11,
                            Is_viewable: true,
                            notify_requester_only: false,
                            rerun_when_expired: false,
                            search_courts_of_justice: true,
                            search_international: true,
                            solicitation_areas: ["Compras"],
                            solicitation_user_email: email,
                        }, { headers });
                    }
                }
                else if (resource === 'dueDiligence') {
                    const baseUrl = `https://api-benp.becompliance.com/${tenantId}/due_diligence`;
                    const cpf = this.getNodeParameter('cpf', i);
                    if (operation === 'get') {
                        response = await axios_1.default.get(baseUrl, {
                            headers,
                            params: {
                                document_number: cpf,
                                archived: false,
                                np_type: 'external',
                                module: 'compliance',
                            },
                        });
                    }
                    else if (operation === 'create') {
                        const notes = this.getNodeParameter('notes', i);
                        response = await axios_1.default.post(baseUrl, {
                            cpf,
                            type: "OUTROS",
                            np_type: "external",
                            notes,
                        }, { headers });
                    }
                }
                if (response) {
                    if (Array.isArray(response.data)) {
                        returnData.push(...this.helpers.returnJsonArray(response.data));
                    }
                    else {
                        returnData.push({ json: response.data });
                    }
                }
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message, details: (_a = error.response) === null || _a === void 0 ? void 0 : _a.data } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.BeCompliance = BeCompliance;
