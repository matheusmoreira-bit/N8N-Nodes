"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
async function execute(api, index) {
    const returnAll = this.getNodeParameter('returnAll', index, true);
    const maxItems = this.getNodeParameter('maxItems', index, 0);
    const page = this.getNodeParameter('page', index, 1);
    const pageSize = this.getNodeParameter('pageSize', index);
    const onlyApiImported = this.getNodeParameter('onlyApiImported', index);
    const cpfCnpj = this.getNodeParameter('cpfCnpj', index);
    const nomeFantasia = this.getNodeParameter('nomeFantasia', index);
    const params = {
        pagina: page,
        registros_por_pagina: pageSize,
    };
    if (onlyApiImported) {
        params.apenas_importado_api = 'S';
    }
    if (cpfCnpj) {
        params.cpf_cnpj = cpfCnpj;
    }
    if (nomeFantasia) {
        params.nome_fantasia = nomeFantasia;
    }
    const results = await api.listSuppliers(params, returnAll, maxItems);
    return this.helpers.returnJsonArray(results);
}
//# sourceMappingURL=execute.js.map