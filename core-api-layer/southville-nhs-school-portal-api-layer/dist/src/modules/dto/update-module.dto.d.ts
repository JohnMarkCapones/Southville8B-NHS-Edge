import { CreateModuleDto } from './create-module.dto';
declare const UpdateModuleDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateModuleDto>>;
export declare class UpdateModuleDto extends UpdateModuleDto_base {
    replaceFile?: boolean;
}
export {};
