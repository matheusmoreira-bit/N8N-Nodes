import {
    IExecuteFunctions,
    INodeExecutionData,
    IDataObject,
} from 'n8n-workflow';

import { OmieApi } from '../../../transport/OmieApi';

export async function execute(this: IExecuteFunctions, api: OmieApi, index: number): Promise<INodeExecutionData[]> {
    const codigoClienteOmie = this.getNodeParameter('codigoClienteOmie', index) as number;
    const codigoClienteIntegracao = this.getNodeParameter('codigoClienteIntegracao', index) as string;
    const razaoSocial = this.getNodeParameter('razaoSocial', index) as string;
    const nomeFantasia = this.getNodeParameter('nomeFantasia', index) as string;
    const email = this.getNodeParameter('email', index) as string;
    const cpfCnpj = this.getNodeParameter('cpfCnpj', index) as string;

    const payload: IDataObject = {
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
