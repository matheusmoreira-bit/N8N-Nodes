"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
async function execute(api, index) {
    const page = this.getNodeParameter('page', index);
    const pageSize = this.getNodeParameter('pageSize', index);
    const onlyApiImported = this.getNodeParameter('onlyApiImported', index);
    const codigoItemOmie = this.getNodeParameter('codigoItemOmie', index);
    const descricao = this.getNodeParameter('descricao', index);
    const params = {
        pagina: page,
        registros_por_pagina: pageSize,
    };
    if (onlyApiImported) {
        params.apenas_importado_api = 'S';
    }
    if (codigoItemOmie) {
        params.codigo_produto_omie = codigoItemOmie;
    }
    if (descricao) {
        params.descricao = descricao;
    }
    const results = await api.listItems(params);
    return this.helpers.returnJsonArray(results);
}
//# sourceMappingURL=execute.js.map