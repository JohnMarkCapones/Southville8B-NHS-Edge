import { AuthService } from './auth.service';
import { LoginDto, TokenVerifyDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            role: string | undefined;
            created_at: string;
            email_confirmed_at: string | undefined;
            user_metadata: {
                [key: string]: any;
                first_name?: string;
                last_name?: string;
                avatar_url?: string;
            } | undefined;
        };
        session: {
            access_token: any;
            refresh_token: any;
            expires_at: any;
        };
        message: string;
    }>;
    verify(tokenDto: TokenVerifyDto): Promise<{
        success: boolean;
        user: {
            id: string;
            email: string;
            role: string | undefined;
            created_at: string;
            email_confirmed_at: string | undefined;
            user_metadata: {
                [key: string]: any;
                first_name?: string;
                last_name?: string;
                avatar_url?: string;
            } | undefined;
        };
        message: string;
    }>;
}
