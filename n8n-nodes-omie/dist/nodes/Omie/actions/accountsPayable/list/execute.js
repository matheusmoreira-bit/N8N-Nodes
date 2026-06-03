"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.execute = execute;
const date_1 = require("../../../utils/date");
async function execute(api, index) {
    const page = this.getNodeParameter('page', index);
    const pageSize = this.getNodeParameter('pageSize', index);
    const onlyApiImported = this.getNodeParameter('onlyApiImported', index);
    const orderDescending = this.getNodeParameter('orderDescending', index);
    const dateFrom = this.getNodeParameter('dateFrom', index);
    const dateTo = this.getNodeParameter('dateTo', index);
    const params = {
        pagina: page,
        registros_por_pagina: pageSize,
        apenas_importado_api: onlyApiImported ? 'S' : 'N',
    };
    if (orderDescending) {
        params.ordem_descrescente = 'S';
    }
    if (dateFrom) {
        params.filtrar_por_data_de = (0, date_1.dateToOmieFormat)(dateFrom);
    }
    if (dateTo) {
        params.filtrar_por_data_ate = (0, date_1.dateToOmieFormat)(dateTo);
    }
    const results = await api.listAccountsPayable(params);
    return this.helpers.returnJsonArray(results);
}
//# sourceMappingURL=execute.js.map