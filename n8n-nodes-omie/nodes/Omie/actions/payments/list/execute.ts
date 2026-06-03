import {
    IExecuteFunctions,
    INodeExecutionData,
    IDataObject,
} from 'n8n-workflow';

import { OmieApi } from '../../../transport/OmieApi';
import { dateToOmieFormat } from '../../../utils/date';

export async function execute(this: IExecuteFunctions, api: OmieApi, index: number): Promise<INodeExecutionData[]> {
    const page = this.getNodeParameter('page', index) as number;
    const pageSize = this.getNodeParameter('pageSize', index) as number;
    const onlyApiImported = this.getNodeParameter('onlyApiImported', index) as boolean;
    const dateFrom = this.getNodeParameter('dateFrom', index) as string;
    const dateTo = this.getNodeParameter('dateTo', index) as string;

    const params: IDataObject = {
        pagina: page,
        registros_por_pagina: pageSize,
        apenas_importado_api: onlyApiImported ? 'S' : 'N',
    };

    if (dateFrom) {
        params.filtrar_por_data_de = dateToOmieFormat(dateFrom);
    }
    if (dateTo) {
        params.filtrar_por_data_ate = dateToOmieFormat(dateTo);
    }

    const results = await api.listPayments(params);
    return this.helpers.returnJsonArray(results);
}
