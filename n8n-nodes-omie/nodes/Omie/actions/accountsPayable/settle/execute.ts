import {
    IExecuteFunctions,
    INodeExecutionData,
    IDataObject,
} from 'n8n-workflow';

import { OmieApi } from '../../../transport/OmieApi';
import { dateToOmieFormat } from '../../../utils/date';

export async function execute(this: IExecuteFunctions, api: OmieApi, index: number): Promise<INodeExecutionData[]> {
    const codigoLancamento = this.getNodeParameter('codigoLancamento', index) as number;
    const codigoLancamentoIntegracao = this.getNodeParameter('codigoLancamentoIntegracao', index) as string;
    const paymentAmount = this.getNodeParameter('paymentAmount', index) as number;
    const paymentDate = this.getNodeParameter('paymentDate', index) as string;
    const discount = this.getNodeParameter('discount', index) as number;
    const interest = this.getNodeParameter('interest', index) as number;
    const fine = this.getNodeParameter('fine', index) as number;
    const observation = this.getNodeParameter('observation', index) as string;
    const conciliateDocument = this.getNodeParameter('conciliateDocument', index) as boolean;

    const payload: IDataObject = {
        codigo_lancamento: codigoLancamento,
        valor: paymentAmount,
        data: dateToOmieFormat(paymentDate),
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
