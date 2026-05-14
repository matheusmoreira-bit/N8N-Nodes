"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getByDocument = getByDocument;
const text_1 = require("../../../utils/text");
async function getByDocument(api, index) {
    const document = this.getNodeParameter('document', index);
    const supplier = await api.getSupplierByDocument((0, text_1.extractDigitsFromString)(document));
    return this.helpers.returnJsonArray(supplier !== null && supplier !== void 0 ? supplier : []);
}
