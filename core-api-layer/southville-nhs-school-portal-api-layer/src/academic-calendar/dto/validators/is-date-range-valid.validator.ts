import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isDateRangeValid', async: false })
export class IsDateRangeValidConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any, args: ValidationArguments) {
    const object = args.object as any;
    const startDate = object.start_date;
    const endDate = object.end_date;

    if (!startDate || !endDate) {
      return true; // Let other validators handle missing dates
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return true; // Let other validators handle invalid dates
    }

    // Check if end_date is same or after start_date
    return end >= start;
  }

  defaultMessage(args: ValidationArguments) {
    return 'end_date must be the same as or after start_date';
  }
}
