# Operations & Release Playbook

## Local Environment Checklist
1. **Install toolchains**: Node 20+, pnpm 9+, Supabase CLI (`npm install -g supabase`).
2. **Frontend setup**: `cd frontend && pnpm install && pnpm dev` to boot the kiosk UI at `http://localhost:3000`.
3. **Backend setup**: `cd backend && cp .env.example .env && supabase start` to launch Postgres, Functions, and Studio locally.
4. **Database migrations**: Run `supabase db reset` for a clean slate or `supabase db push` after editing SQL files.

## Daily Developer Workflow
- Sync dependencies, run `pnpm lint`, and, once data APIs connect, add smoke tests for critical flows.
- Use Supabase CLI logs to watch Edge Functions during development: `supabase functions serve --no-verify-jwt` for local testing.
- Document manual QA steps in every PR (emergency flow, resource cards, theme toggles) until automated suites exist.

## Build & Deployment Commands
| Layer | Command | Purpose |
| --- | --- | --- |
| Frontend | `pnpm build` | Validates Next.js routes, TypeScript, and Tailwind config before deploy |
| Frontend | `pnpm start` | Serves production build locally for smoke testing |
| Backend | `supabase functions deploy <name>` | Pushes a single Edge Function to the Supabase project |
| Backend | `npm run db:push` | Applies SQL migrations to the remote database |
| Backend | `npm run functions:deploy` | Batch deploys all functions |

## Release Checklist
1. Confirm `pnpm lint`, `pnpm build`, and manual QA all pass.
2. Ensure migrations are committed and versioned; never edit historical migrations—add a new numbered file.
3. Deploy Edge Functions before or alongside schema updates they depend on.
4. Verify cron jobs (`SELECT * FROM cron.job;`) after any deployment touching scheduled tasks.
5. Capture screenshots or screen recordings for product stakeholders, especially when IA or accessibility affordances change.

## Incident & Runbook Notes
- **Emergency Path Failure**: Check Supabase logs for `emergency-handler` errors, confirm `emergency_requests` inserts, then inspect `pg_trigger` logs for 911 dispatch. Keep fallback SMS/phone contacts documented.
- **Resource Drift**: Review `scheduled_job_logs` and rerun `supabase functions invoke update-resources` manually with service role key if nightly ETL fails.
- **Settings Sync Issues**: Validate `user_settings` rows exist for sample UUIDs and that clients pass valid ISO language codes and font sizes.
- **Map Data Latency**: Inspect `resources` for stale `verified_on` values; if outdated, confirm external API credentials and rerun ETL.

## Observability Roadmap
- Wire Supabase logs into a centralized tool (Logflare, Axiom) for retention beyond default windows.
- Add uptime checks for the deployed kiosk frontends and `resource-finder` endpoint.
- Publish a lightweight dashboard (Metabase/Supabase UI) showing emergency volume, response split, and top resource searches for weekly reviews.
