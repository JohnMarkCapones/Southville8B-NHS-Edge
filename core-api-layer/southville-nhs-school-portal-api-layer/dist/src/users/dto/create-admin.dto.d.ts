import { CreateUserDto } from './create-user.dto';
export declare class CreateAdminDto extends CreateUserDto {
    birthday: string;
    roleDescription?: string;
    phoneNumber?: string;
    constructor();
}
