import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import map from 'lodash/map';

export const getAttributeMetadata = (name, /** @type {Array} */ attributes) => {
    return find(attributes, attribute => attribute.name === name);
};

export const validateAllowedValues = (metadata, attribute) => {
    const allowedValues = [].concat(get(metadata, 'validation.allowedValues', []));

    if (allowedValues.length > 0 && !includes(allowedValues, attribute.rawValue)) {
        const allowedValuesStrings = map(allowedValues, value => `"${value}"`).join(', ');
        return {
            isValid: false,
            message: `Attribute ${metadata.name} must have one of the following values: ${allowedValuesStrings}`
        };
    }
    return { isValid: true };
};

export const withDefaultValue = (metadata, attribute = {}) => {
    return { ...attribute, rawValue: attribute.rawValue ?? metadata.defaultValue };
};
