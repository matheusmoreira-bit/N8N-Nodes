"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
async function execute(api, index) {
    const codigoProdutoOmie = this.getNodeParameter('codigoProdutoOmie', index);
    const codigoProdutoIntegracao = this.getNodeParameter('codigoProdutoIntegracao', index);
    const descricao = this.getNodeParameter('descricao', index);
    const unidade = this.getNodeParameter('unidade', index);
    const ncm = this.getNodeParameter('ncm', index);
    const payload = {
        codigo_produto_omie: codigoProdutoOmie,
    };
    if (codigoProdutoIntegracao) {
        payload.codigo_produto_integracao = codigoProdutoIntegracao;
    }
    if (descricao) {
        payload.descricao = descricao;
    }
    if (unidade) {
        payload.unidade = unidade;
    }
    if (ncm) {
        payload.ncm = ncm;
    }
    const response = await api.updateItem(payload);
    return this.helpers.returnJsonArray([response]);
}
//# sourceMappingURL=execute.js.map