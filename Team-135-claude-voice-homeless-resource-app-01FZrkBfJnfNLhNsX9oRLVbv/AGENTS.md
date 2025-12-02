# Repository Guidelines

## Project Structure & Module Organization
The product lives in `frontend/`, a Next.js 16 + Tailwind CSS app-router workspace that should be referenced through the `@/*` alias.
- `app/` contains the routed experiences (home, emergency, map, resources).
- `components/` holds reusable building blocks; `components/ui/` mirrors shadcn primitives, while `client-layout.tsx`, `navigation.tsx`, and `theme-provider.tsx` wire global concerns.
- `hooks/` and `lib/utils.ts` store shared logic, and static assets live in `public/`, `images/`, and `styles/globals.css`.

## Build, Test, and Development Commands
Run commands from `frontend/` and prefer pnpm (`pnpm-lock.yaml` is canonical):
- `pnpm install` — install dependencies (Node 20+).
- `pnpm dev` — run the local dev server on http://localhost:3000.
- `pnpm lint` — run Next.js + ESLint to catch type, accessibility, and Tailwind issues.
- `pnpm build` — compile the production bundle to surface regressions early.
- `pnpm start` — serve the `pnpm build` output for final smoke testing.

## Coding Style & Naming Conventions
TypeScript is strict with 2-space indentation. Favor small functional components, early returns, and descriptive prop names. Components stay PascalCase (`ResourceCard.tsx`), hooks follow `useX`, and utilities stay camelCase. Use Tailwind utilities from `styles/globals.css` and lean on `clsx`/`cva` helpers for conditional styling. Mark client components explicitly and skip deep relative paths.

## Testing Guidelines
Automated tests are not yet committed, so linting plus documented manual verification is required for every change. When you add coverage, follow Next.js defaults: colocate component tests as `*.test.tsx` (e.g., `components/__tests__/resource-card.test.tsx`) using Jest + Testing Library, and unit-test helpers in `lib/__tests__`. Document manual QA steps in your PR ("`pnpm dev`, run /emergency flow, verify toast") until CI is in place.

## Commit & Pull Request Guidelines
Recent history uses short, imperative subjects (e.g., `Add frontend application`). Keep summaries under ~50 characters, push review-ready commits, and use topic branches like `feature/safe-path-map`. Each PR should:
- Explain the change, link related issues via `Fixes #id`, and call out data or dependency impacts.
- Include screenshots or clips for UI updates plus manual QA notes and new env vars.
- Confirm `pnpm lint` and `pnpm build` in the description before requesting review.

## Environment & Security Notes
Store API keys and partner secrets in `frontend/.env.local` (ignored by git) and gate reads behind `process.env`. Use anonymized sample data and avoid committing PII, coordinates, or voice transcripts from real clients. When experimenting with new providers, guard code with feature flags or environment checks within `app/` routes.
