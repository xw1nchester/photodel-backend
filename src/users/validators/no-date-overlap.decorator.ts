import { registerDecorator, ValidationOptions } from 'class-validator';

import { NoDateOverlapValidator } from './no-date-overlap.validator';

export function NoDateOverlap(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: NoDateOverlapValidator
        });
    };
}
