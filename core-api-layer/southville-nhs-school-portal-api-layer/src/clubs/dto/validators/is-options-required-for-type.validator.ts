import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';
import { QuestionType } from '../create-form-question.dto';

@ValidatorConstraint({ name: 'isOptionsRequiredForType', async: false })
export class IsOptionsRequiredForTypeConstraint
  implements ValidatorConstraintInterface
{
  validate(options: any, args: ValidationArguments) {
    const object = args.object as any;
    const questionType = object.question_type;

    // If question type is DROPDOWN, RADIO, or CHECKBOX, options are required
    if (
      questionType === QuestionType.DROPDOWN ||
      questionType === QuestionType.RADIO ||
      questionType === QuestionType.CHECKBOX
    ) {
      return Array.isArray(options) && options.length > 0;
    }

    // For other question types, options are optional
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const object = args.object as any;
    const questionType = object.question_type;
    return `Options are required for ${questionType} question type`;
  }
}

export function IsOptionsRequiredForType(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsOptionsRequiredForTypeConstraint,
    });
  };
}
