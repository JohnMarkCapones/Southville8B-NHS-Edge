# Southville Mobile Structure Rules

These guidelines keep the React Native (Expo) codebase clean, maintainable, and consistent. Apply them to every new feature and refactor.

## Core Principles
- **Keep features cohesive:** Group files by domain/feature when they evolve beyond shared primitives; avoid dumping everything into generic folders.
- **Prefer composition over complexity:** Build small, testable components and hooks; compose them in screen-level containers.
- **Stay type-safe:** Use TypeScript types/interfaces/exported enums for every module boundary.
- **Single responsibility:** Each file should expose one primary concern (component, hook, service, constant set, etc.).
- **Document intent:** Add brief comments only when behavior is non-obvious; prefer clear naming first.

## Directory Expectations
- `app/`: Route hierarchy for expo-router. Each route/screen should own its local UI composition, local state, and child components that are not reusable elsewhere.
- `components/`: Truly shared UI. Sub-folders allowed by component family (`ui/`, primitives). Co-locate styles/helpers inside the component folder when used only there.
- `constants/`: App-wide configuration maps (themes, typography, env keys). Keep read-only exports.
- `hooks/`: Reusable logic that encapsulates stateful behavior across features (color scheme, theme, auth state helpers, etc.).
- `lib/`: Cross-cutting libraries (API clients, request utilities). Keep pure functions or service builders here.
- `services/`: Business logic that coordinates lib calls (e.g., authentication, caching). Each service should expose stateless functions or isolated classes.
- `assets/`: Static images, icons, fonts. Name assets descriptively; organize by domain when volume grows.
- `scripts/`: Tooling tasks (reset, lint helpers). Keep node scripts simple and documented.

## File Organisation Rules
- Keep route files (`app/**/*.tsx`) lean: move reusable UI/logic to `components/` or `hooks/`.
- When a screen needs multiple supporting files, create a local directory under `app/feature-name/` with an `index.tsx` entry point plus co-located helpers.
- Use `index.ts` barrels only when they improve ergonomics and do not hide module boundaries.
- Avoid deep nesting beyond three levels; reconsider the abstraction if a path grows unwieldy.

## Naming Conventions
- Components: `PascalCase` (`ProfileHeader.tsx`). Hooks: `useCamelCase`. Utility functions/constants: `camelCase`.
- Async functions end with descriptive verbs (`fetch`, `load`, `submit`).
- Files mirror default export names to simplify imports.
- Stick to kebab-case folders unless React conventions require parentheses for expo-router segments.

## Styling & Theming
- Centralize colors, spacing, typography in `constants/theme.ts` (extend with tokens, never hard-code magic numbers in components).
- Prefer `ThemedView`/`ThemedText` wrappers or theme-aware helpers to ensure system dark-mode support.
- When using StyleSheet, define styles at file bottom; for shared styles create reusable style helpers in `components/ui/`.

## Data & API Access
- All HTTP calls route through `lib/api-client.ts`. Avoid duplicating fetch logic in screens.
- Services encapsulate API usage (`services/auth.ts`) and expose domain-specific functions returning typed results.
- Handle errors centrally; propagate typed error objects that UI layers can safely render.

## State Management
- Keep screen state local unless multiple screens depend on it. When sharing state, implement a dedicated hook in `hooks/` (e.g., `useAuthSession`).
- Persisted/global state modules must document initialization and teardown requirements in the file header comment.

## Testing Expectations
- For logic-heavy modules, create matching test files under `__tests__` mirrors (e.g., `components/__tests__/parallax-scroll-view.test.tsx`).
- Prefer React Testing Library for components; mock services with lightweight fixtures.
- Ensure hooks/services expose deterministic behavior suitable for unit tests.

## Asset & Content Management
- Keep `assets/images` organized by domain (`/announcements`, `/profile`, etc.) once the count grows.
- Reference assets via `require` or centralized mapping exports to support bundler optimizations.
- Remove unused assets during feature cleanup to avoid bloated bundles.

## Dependency Hygiene
- Add dependencies only when needed; favour Expo/React Native built-ins first.
- Document any new dependency rationale in the PR description and, if long-lived, in `README.md` under a "Dependencies" section.
- Keep `package.json` scripts consistent; dry-run `expo-doctor` after major upgrades.

## Workflow Checklist
1. Sketch folder impact before coding; update this guide if the structure evolves.
2. Add or update TypeScript definitions with every new module.
3. Run lint/tests (`npm run lint`, `npm test` when available) before committing.
4. Document feature-level architectural decisions in `README.md` or a new ADR when significant.

Keep this document up to date whenever the structure or conventions change. Consistency now saves refactors later.
