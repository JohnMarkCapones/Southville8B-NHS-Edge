%% Auth Login Workflow Sequence Diagram
%% File: auth_login_sequence.md

sequenceDiagram
    autonumber
    participant C as Client
    participant AC as AuthController
    participant AS as AuthService
    participant SC as ISupabaseAuthClient
    participant ITS as IInternalTokenService
    participant RTS as IRefreshTokenStore
    participant DB as Postgres (auth_refresh_tokens)

    C->>AC: POST /api/v1/auth/login\n{ email, password }
    AC->>AS: LoginAsync(email, password, ct)

    AS->>SC: PasswordGrantAsync(email, password)
    SC-->>AS: Supabase Auth JSON (user, session)

    AS->>AS: Parse JSON -> userId, role, permissions
    AS->>ITS: CreateToken(userId, role, perms)
    ITS-->>AS: AccessToken + ExpiresAtUtc

    AS->>AS: GenerateRefreshToken()
    AS->>RTS: StoreAsync(userId, role, refreshToken, slidingExpiry)
    RTS->>DB: INSERT auth_refresh_tokens
    DB-->>RTS: OK

    AS-->>AC: accessToken, accessExp, refreshToken, refreshExp
    AC-->>C: 200 OK (LoginResponse JSON)

    rect rgb(255,240,240)
    note over AS,SC: Error Paths:\n- Invalid credentials (Supabase)\n- Network timeout\n- Store duplicate (rare)
    end

    rect rgb(240,255,240)
    note over ITS,RTS: Security Measures:\n- Access: short-lived JWT\n- Refresh: random 256-bit, salted+peppered bcrypt hash\n- Sliding expiration
    end
