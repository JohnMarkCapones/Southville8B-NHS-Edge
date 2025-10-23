import { PipeTransform, ArgumentMetadata } from '@nestjs/common';
export declare class PermissionValidationPipe implements PipeTransform {
    transform(value: any, metadata: ArgumentMetadata): any;
}
