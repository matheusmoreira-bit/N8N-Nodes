"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const date_1 = require("../../../utils/date");
async function execute(api, index) {
    const codigoLancamento = this.getNodeParameter('codigoLancamento', index);
    const codigoLancamentoIntegracao = this.getNodeParameter('codigoLancamentoIntegracao', index);
    const paymentAmount = this.getNodeParameter('paymentAmount', index);
    const paymentDate = this.getNodeParameter('paymentDate', index);
    const discount = this.getNodeParameter('discount', index);
    const interest = this.getNodeParameter('interest', index);
    const fine = this.getNodeParameter('fine', index);
    const observation = this.getNodeParameter('observation', index);
    const conciliateDocument = this.getNodeParameter('conciliateDocument', index);
    const payload = {
        codigo_lancamento: codigoLancamento,
        valor: paymentAmount,
        data: (0, date_1.dateToOmieFormat)(paymentDate),
    };
    if (codigoLancamentoIntegracao) {
        payload.codigo_lancamento_integracao = codigoLancamentoIntegracao;
    }
    if (discount) {
        payload.desconto = discount;
    }
    if (interest) {
        payload.juros = interest;
    }
    if (fine) {
        payload.multa = fine;
    }
    if (observation) {
        payload.observacao = observation;
    }
    if (conciliateDocument) {
        payload.conciliar_documento = 'S';
    }
    const response = await api.settleAccountPayable(payload);
    return this.helpers.returnJsonArray([response]);
}
//# sourceMappingURL=execute.js.map