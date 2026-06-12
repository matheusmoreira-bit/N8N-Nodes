"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addResourceDisplayOptions = addResourceDisplayOptions;
function addResourceDisplayOptions(properties, resource) {
    return properties.map((property) => ({
        ...property,
        displayOptions: {
            ...property.displayOptions,
            show: {
                ...property.displayOptions?.show,
                omieResource: [resource],
            },
        },
    }));
}
//# sourceMappingURL=displayOptions.js.map