import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ async: false })
export class IsDateRangeValidConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const startDate = object.start_date;
    const endDate = object.end_date;

    if (!startDate || !endDate) {
      return true; // Let other validators handle required fields
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    return start < end;
  }

  defaultMessage(args: ValidationArguments) {
    return 'End date must be after start date';
  }
}

export function IsDateRangeValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsDateRangeValidConstraint,
    });
  };
}
