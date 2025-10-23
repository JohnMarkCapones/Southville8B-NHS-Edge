import { ValidationOptions, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class IsSafeUrlConstraint implements ValidatorConstraintInterface {
    validate(url: string, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsSafeUrl(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
