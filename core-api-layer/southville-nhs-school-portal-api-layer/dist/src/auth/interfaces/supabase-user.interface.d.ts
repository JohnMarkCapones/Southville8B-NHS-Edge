export interface SupabaseUser {
    id: string;
    email: string;
    role?: string;
    user_metadata?: {
        first_name?: string;
        last_name?: string;
        avatar_url?: string;
        [key: string]: any;
    };
    app_metadata?: {
        provider?: string;
        providers?: string[];
        [key: string]: any;
    };
    aud: string;
    created_at: string;
    updated_at?: string;
    email_confirmed_at?: string;
    phone?: string;
    phone_confirmed_at?: string;
    last_sign_in_at?: string;
    confirmed_at?: string;
}
export interface SupabaseJWTPayload {
    aud: string;
    exp: number;
    iat: number;
    iss: string;
    sub: string;
    email?: string;
    phone?: string;
    app_metadata?: {
        provider?: string;
        providers?: string[];
        [key: string]: any;
    };
    user_metadata?: {
        first_name?: string;
        last_name?: string;
        avatar_url?: string;
        [key: string]: any;
    };
    role?: string;
    aal?: string;
    amr?: Array<{
        method: string;
        timestamp: number;
    }>;
    session_id?: string;
}
