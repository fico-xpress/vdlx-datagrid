import { getAttributeMetadata, validateAllowedValues, withDefaultValue } from '../../src/js/transform-utils';

describe('transform utils', () => {
    describe('getAttributeMetadata', () => {
        it('retrieves metadata for an attribute', () => {
            expect(getAttributeMetadata('attribute', [{ name: 'attribute' }])).toEqual({ name: 'attribute' });
        });
        it('returns undefined if metadata cant be found', () => {
            expect(getAttributeMetadata('attribute', [{ name: 'attribute2' }])).toBeUndefined();
        });
    });

    describe('withDefaultValue', () => {
        it('inserts default value if attribute doesnt have a value', () => {
            expect(withDefaultValue({ defaultValue: 'value' }, {})).toEqual({ rawValue: 'value' });
        });
        it('keeps existing rawValue', () => {
            expect(withDefaultValue({ defaultValue: 'value' }, { rawValue: 'value2' })).toEqual({ rawValue: 'value2' });
        });
    });

    describe('validateAllowedValues', () => {
        it('valid when allowedValues is empty', () => {
            expect(validateAllowedValues({}, { rawValue: 'value' })).toEqual({ isValid: true });
        });

        it('validates', () => {
            expect(validateAllowedValues({ validation: { allowedValues: ['value'] } }, { rawValue: 'value' })).toEqual({
                isValid: true
            });
        });

        it('returns invalid when value is not one of allowedValues', () => {
            expect(
                validateAllowedValues(
                    { validation: { allowedValues: ['value', 'otherValue'] }, name: 'attribute' },
                    { rawValue: 'value2' }
                )
            ).toEqual({
                isValid: false,
                message: 'Attribute attribute must have one of the following values: "value", "otherValue"'
            });
        });
    });
});
