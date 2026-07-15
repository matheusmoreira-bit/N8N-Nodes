"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listReturns = listReturns;
const helpers_1 = require("../helpers");
async function listReturns(api, itemIndex) {
    var _a, _b;
    const endpointPath = this.getNodeParameter('cnabListReturnsEndpointPath', itemIndex);
    const startDateValue = this.getNodeParameter('startDate', itemIndex, '');
    const endDateValue = this.getNodeParameter('endDate', itemIndex, '');
    const splitItems = this.getNodeParameter('splitItems', itemIndex, true);
    const additionalFields = this.getNodeParameter('cnabListReturnsAdditionalFields', itemIndex, {});
    const today = new Date();
    const startDate = (0, helpers_1.toApiDate)(startDateValue, () => today);
    const endDate = (0, helpers_1.toApiDate)(endDateValue, () => today);
    const queryParameters = (0, helpers_1.parseJsonObject)(additionalFields.queryParametersJson, 'Query Parameters JSON');
    const startDateQueryName = `${(_a = additionalFields.startDateQueryName) !== null && _a !== void 0 ? _a : 'startDate'}`.trim();
    const endDateQueryName = `${(_b = additionalFields.endDateQueryName) !== null && _b !== void 0 ? _b : 'endDate'}`.trim();
    if (startDateQueryName) {
        queryParameters[startDateQueryName] = startDate;
    }
    if (endDateQueryName) {
        queryParameters[endDateQueryName] = endDate;
    }
    const response = await api.listCnabReturns({
        endpointPath,
        queryParameters,
    });
    if (splitItems) {
        return (0, helpers_1.normalizeRows)(response).map((row) => ({
            json: {
                resource: 'cnab',
                operation: 'listReturns',
                endpointPath,
                startDate,
                endDate,
                ...row,
            },
            pairedItem: { item: itemIndex },
        }));
    }
    return [
        {
            json: {
                resource: 'cnab',
                operation: 'listReturns',
                endpointPath,
                startDate,
                endDate,
                response: (0, helpers_1.normalizeResponse)(response),
            },
            pairedItem: { item: itemIndex },
        },
    ];
}
