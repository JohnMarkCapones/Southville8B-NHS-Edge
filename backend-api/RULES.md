# **RULES.md — SouthvilleEPortal Architecture & AI Agent Constitution**

> Modular Monolith (DDD) for SouthvilleEPortal — strict rules for code, modules, AI agents and deployment (Supabase Auth + Supabase Postgres are the single sources of truth).

---

## 🔑 Core Principles

1. **Modular Monolith + DDD**
    - Each **module** (Students, Teachers, Grades, etc.) is fully self-contained: `Module/` → `API/`, `Application/`, `Domain/`, `Infrastructure/`.
    - Modules must be independent units (bounded contexts). They may communicate by:
        - Application-level abstractions (interfaces)
        - Domain events / event bus
        - Shared kernel utilities only (no business rules in `Shared/`).
2. **Supabase is THE platform**
    - **Authentication**: Supabase Auth (JWT + RBAC) is the only auth provider (see Centralized Auth Option below for API brokerage).
    - **Database**: Supabase Postgres is the database (use Supabase DB connection string, poolers, and features).
    - Use Supabase features safely: Edge Functions, Realtime, Storage as needed — the monolith hosts core business logic.
3. **Security-first**
    - All endpoints require authentication by default (Supabase-derived identity).
    - Validate all JWTs against **Supabase JWKS endpoint** (`SUPABASE_JWKS_URL`) OR internal API-issued tokens (see Centralized Auth).
    - RBAC / PBAC via claims (`role`, custom claims, internal augmentation).
    - **Service role key** (`SUPABASE_SERVICE_ROLE_KEY`) is backend-only; never expose or log.
4. **No cross-module leaks**
    - Domain code from one module must not depend on another module's domain.
    - Only `Shared/` (shared kernel) can be referenced by modules.
5. **Layer responsibilities**
    - `API/`: thin controllers, DTOs, model binding & validation, auth brokerage (Option 2).
    - `Application/`: orchestrates use cases, enforces invariants via domain, coordinates infra.
    - `Domain/`: pure business logic, entities, value objects, domain events.
    - `Infrastructure/`: persistence (EF Core), external service integrations.
    - `Shared/`: base abstractions & cross-cutting concerns (no business rules).
6. **Testing & Documentation**
    - Unit tests (Domain + Application) per module.
    - Integration tests (API + Infrastructure).
    - Public endpoints documented in `docs/openapi.yaml`.

---

## ❌ Anti-Patterns (Strictly forbidden)
- Fat controllers (push logic to Application/Domain).
- Secrets in `appsettings.json` or committed to VCS.
- EF Core / ORM artifacts in `Domain/`.
- Module cross-domain dependencies.
- Business logic in `Shared/`.
- Exposing `SUPABASE_SERVICE_ROLE_KEY` to clients.

---

## ✅ Allowed Dependencies
- `API` → `Application`
- `Application` → `Domain`, `Infrastructure` (through interfaces)
- `Infrastructure` → implements `Application` / `Domain` abstractions
- `Domain` → no infra dependencies
- `Shared` → referenced by all (pure cross-cutting)

---

## Supabase + .NET Operational Requirements (explicit)
(Existing environment, JWT, RLS, pooling, migrations guidance retained — see earlier content.)

---

## 🔐 Centralized Authentication Option (API-Layer Brokerage)
**Option 2: API mediates all credential flows (credentials never sent directly to Supabase from the browser). On success API issues short‑lived internal JWT + persistent refresh token.**

---

## 🔐 Refresh Token Security & Rotation Policy
**Status:** Persistent refresh tokens with per‑token salt, dual pepper (V1 legacy / V2 active), bcrypt verification hash, rotation & sliding session window. Replay family revoke implemented (on replay detection all active tokens for that user are revoked). **Migration `AddReplacedByTokenId` applied (column present).**

### Entity Fields
`Salt`, `PepperVersion`, `LookupHash`, `TokenHash`, `CreatedAtUtc`, `ExpiresAtUtc`, `RevokedAtUtc`, `ReplacedByTokenId`.

### Hashing Strategy (UPDATED)
- **LookupHash** = `SHA256(rawToken + pepper)` (deterministic, indexed, NOT sufficient alone for validity).
- **TokenHash** = `bcrypt(rawToken + Salt + pepper, workFactor)` (slow verification). Work factor configurable (default 12, bounds 10–16).
- No plaintext tokens stored; only client holds the raw refresh token.

### Rotation & Sliding Window
- On every `/auth/refresh` the old refresh token is revoked and a NEW refresh token is issued (rotation-on-use).
- Sliding extension: new expiry = `min(now + slidingDays, CreatedAtUtc + absoluteDays)`.
- Defaults: `slidingDays = 7`, `absoluteDays = 30` (hard session cap → user must re-login after absolute limit).
- **Replay handling:** If a revoked token with `ReplacedByTokenId` appears again, all active tokens for that user are revoked (family revoke) and a security event is logged.

### **Rotation Procedure (Pepper Keys)**
1. Add new pepper as `TokenPeppers:V2`; keep old as V1.
2. Deploy (users keep sessions; new logins use V2).
3. Observe metrics: count of remaining V1 tokens.
4. Revoke V1 tokens when acceptable:
   ```sql
   UPDATE auth_refresh_tokens SET revoked_at_utc = now() WHERE pepperversion = 'V1' AND revoked_at_utc IS NULL;
   ```
5. Remove V1 config and fallback code after drain.

### Security Notes
- Peppers are high-entropy secrets (treat like service role key).
- Optional future hardening: HMAC variant; rotation metrics endpoint.
- Background cleanup removes expired / revoked tokens.

### RLS (Optional)
If RLS enforced for direct PostgREST, restrict by `user_id = auth.uid()`; monolith already enforces ownership.

### Dual Pepper Rotation
Operational until all V1 tokens removed; then simplify to single active pepper.

### Planned Enhancements (Remaining)
- Permission claim enforcement (policy tests / `perm` claims in authorization layer).
- Advanced replay analytics (frequency, geo anomaly) – optional.
- RLS migrations for user-owned tables (planned when exposing direct DB pathways).
- Privacy / data subject endpoints.
- Automated restore test pipeline.
- Key rotation audit & alerting (current rotation service in place).

### Rate Limiting (Auth Endpoints)
- `/auth/login`: 5 req/min/IP.
- `/auth/refresh`: 30 req/5min/IP.

### CSRF (If Cookies Enabled)
- Antiforgery token header `X-CSRF-TOKEN` (double-submit) prepared; enable cookie delivery mode when frontend adopts it.

### Logging / Auditing
Events: `login.success`, `login.failed`, `refresh.rotate`, `refresh.replay_family_revoked`, `logout`, `revoke_all`, `jwt.rotation.success`.
Retention: ≥90 days (security channel).

---

## 📘 Compliance & Governance (Southville 8B NHS Edge)

**Project:** Southville 8B NHS Edge  
**Version:** 1.0  
**Prepared by:** John Mark Capones (Project Lead)  
**Team:** Colegio De Montalban – 4th Year BSIT

### 1. Executive Summary
Unified school management & learning platform. Handles sensitive academic, personal, operational data. Must align with international security standards (ISO/IEC), Philippine Data Privacy Act (RA 10173), DepEd archival guidelines, and best‑practice privacy frameworks.

### 2. ISO/IEC Compliance Mapping (Condensed)
| Standard | Focus | Key Implementation Anchors |
|----------|-------|-----------------------------|
| 27001 | ISMS governance | Policies repo, risk register, security roles, CI/CD gates |
| 27002 | Controls baseline | Encryption in transit (TLS via Cloudflare), secrets via env, RBAC, logging |
| 27005 | Risk management | Semester risk review (availability, leakage, vendor) |
| 27017 | Cloud security | Private buckets (R2 / Supabase Storage), signed URLs, WAF rules |
| 27018 | Cloud PII privacy | Pseudonymized analytics IDs, restricted claims exposure |
| 27032 | Cybersecurity | WAF, DDoS, rate limiting, dependency patch cycle |
| 27701 | Privacy extensions | Data subject rights endpoints, consent tracking |
| 22301 | Business continuity | Automated Supabase backups + restore drills, DNS failover |
| 20000-1 | Service management | Incident tickets via GitHub templates |
| 30111 | Vulnerability handling | Dependabot + CVE triage schedule |
| 27035 / 27036 / 24762 / 15408 / 21827 | Incident / Vendor / DR / Evaluation / Maturity | Runbook, vendor evaluation, quarterly restore test, auth module assessment, continuous improvement |

### 3. Legal & Data Protection
| Regulation | Requirement | Implementation |
|-----------|------------|---------------|
| PH DPA (RA 10173) | Consent, breach notice ≤72h, DPO | Consent module, breach runbook, DPO assignment |
| DepEd Records | Permanent academic retention | Archive schema + R2 immutable storage |
| FERPA (best practice) | Student confidentiality | Scoped RBAC & ownership rules |
| COPPA (best practice) | Parental consent <13 | Enrollment parental gate |
| GDPR (best practice) | Access / Erasure / Portability | Export + deletion endpoints (lawful exceptions) |

### 4. Operational Compliance (Highlights)
- Data Retention: grades/transcripts (permanent); quiz/attendance (5y); logs (1–2y); tokens (session lifetime).
- Access & Identity: RBAC roles; PBAC planned; MFA (admins/teachers) future.
- Security Ops: Serilog structured logs; dependency review cycle; key rotation service.
- Incident & Continuity: Breach protocol; restore drill (planned automation).
- Policies: AUP, Academic Integrity, Vendor Mgmt, Accessibility (WCAG 2.1), Privacy, Retention.

### 5. Data Handling Rules
- Encryption: TLS enforced; at-rest by provider.
- Deletion: Logical + physical; statutory exclusions preserved.
- Portability: CSV/PDF export per verified request.
- Backups: Daily incremental; weekly full; quarterly restore test (pending automation).

### 6. Compliance Checklists (Summarized)
Tracked via project board labels: `compliance`, `security`, `privacy`; each maps to verifiable control artifact.

### 7. Enforcement Addendum
Automation must NOT: leak secrets, remove auth, bypass logging/validation, store PII outside approved stores, weaken security headers.

---

## 8. Gaps (Current Implementation vs Goals)
| Area | Gap | Planned Action |
|------|-----|---------------|
| RLS Policies | Tables currently unrestricted | Add ownership column + RLS migration |
| Permissions | `perm` claims not enforced in policies | Add permission policies + tests |
| Auditing | Basic Serilog only | Add Sentry/Datadog + security channel enrichment |
| Privacy APIs | Erasure/export endpoints missing | Implement endpoints + governance linkage |
| Backup Restore Test | Manual | Automate restore verification in CI job |
| Key Rotation Auditing | Rotation implemented (filesystem) lacking audit trail export | Add rotation history log & integrity check |

### Recently Closed Gaps
- Students API Versioning (now `/api/v1/students`).
- JWT Key Rotation (persistent file-based key ring + rotation service + JWKS).
- Refresh Token Replay Family Revoke.

### New Implemented Security Enhancements
- Persistent RSA key ring with scheduled rotation & JWKS endpoint.
- Replay family revoke on token reuse.
- Fine-grained auth rate limits.
- Versioned Students API.

---

## AI Agent Module Creation Pattern (example `Library`)
(Unchanged.)

---

## Example commands & packages (explicit)
(Unchanged.)

---

## Secret & Configuration Management (MANDATORY)
(Unchanged.)

---

## Enforcement
Enforces: rotation-on-use, bcrypt+pepper hashing, sliding & absolute session windows, family revoke on replay, RSA key rotation with JWKS, rate limiting, antiforgery readiness.

---

## References (implementers / agents)
Add: OWASP ASVS (Session Management), NIST 800-63B, JWT BCP, Supabase Auth docs.

---

*End of [RULES.md](http://rules.md/)*
