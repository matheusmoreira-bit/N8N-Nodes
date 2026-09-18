"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByDocument = getByDocument;
const text_1 = require("../../../utils/text");
async function getByDocument(api, index) {
    const document = this.getNodeParameter('document', index);
    const customer = await api.getCustomerByDocument((0, text_1.extractDigitsFromString)(document));
    return this.helpers.returnJsonArray(customer !== null && customer !== void 0 ? customer : []);
}
