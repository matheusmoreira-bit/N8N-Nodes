import { INodeProperties } from 'n8n-workflow';

export function addResourceDisplayOptions(properties: INodeProperties[], resource: string): INodeProperties[] {
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
