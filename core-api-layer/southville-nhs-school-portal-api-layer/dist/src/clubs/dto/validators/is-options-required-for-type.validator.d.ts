import { ValidationOptions, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class IsOptionsRequiredForTypeConstraint implements ValidatorConstraintInterface {
    validate(options: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsOptionsRequiredForType(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
