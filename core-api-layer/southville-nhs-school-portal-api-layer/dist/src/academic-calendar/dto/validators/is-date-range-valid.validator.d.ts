import { ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class IsDateRangeValidConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
