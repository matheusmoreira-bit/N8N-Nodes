"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
async function execute(api, index) {
    const codigoClienteOmie = this.getNodeParameter('codigoClienteOmie', index);
    const codigoClienteIntegracao = this.getNodeParameter('codigoClienteIntegracao', index);
    const razaoSocial = this.getNodeParameter('razaoSocial', index);
    const nomeFantasia = this.getNodeParameter('nomeFantasia', index);
    const email = this.getNodeParameter('email', index);
    const cpfCnpj = this.getNodeParameter('cpfCnpj', index);
    const payload = {
        codigo_cliente_omie: codigoClienteOmie,
    };
    if (codigoClienteIntegracao) {
        payload.codigo_cliente_integracao = codigoClienteIntegracao;
    }
    if (razaoSocial) {
        payload.razao_social = razaoSocial;
    }
    if (nomeFantasia) {
        payload.nome_fantasia = nomeFantasia;
    }
    if (email) {
        payload.email = email;
    }
    if (cpfCnpj) {
        payload.cpf_cnpj = cpfCnpj;
    }
    const response = await api.updateSupplier(payload);
    return this.helpers.returnJsonArray([response]);
}
//# sourceMappingURL=execute.js.map