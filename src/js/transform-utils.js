export const getAttributeMetadata = (name, /** @type {Array} */ attributes) => {
    return attributes.find(attribute => attribute.name === name);
};

export const validateAllowedValues = (attribute, metadata) => {
    const allowedValues = [].concat(metadata.validation?.allowedValues);

    if (allowedValues.length > 0 && !allowedValues.includes(attribute.rawValue)) {
        const allowedValuesStrings = allowedValues.map(value => `"${value}"`).join(', ');
        return {
            isValid: false,
            message: `Attribute ${metadata.name} must have one of the following values: ${allowedValuesStrings}`
        };
    }
    return { isValid: true };
};

export const withDefaultValue = (attribute = {}, metadata) => {
    return { ...attribute, rawValue: attribute.rawValue ?? metadata.defaultValue };
};
