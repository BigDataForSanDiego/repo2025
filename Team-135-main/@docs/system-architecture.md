# System Architecture

## Platform Layers
- **Client Experience**: A Next.js 16 (App Router) frontend deployed to Vercel (or any Node 20+ host) delivering kiosk-first layouts, Tailwind-tuned theming, and a shared `ClientLayout` that injects nav controls plus analytics beacons.
- **Edge/API Layer**: Supabase Edge Functions (Deno) provide purpose-built endpoints for emergencies, resource discovery, settings, information, and telemetry. Shared modules (`_shared/errors.ts`, `_shared/validation.ts`) guarantee consistent input hardening.
- **Data Layer**: Supabase Postgres 15 with PostGIS, pg_cron, and pg_net extensions powers spatial queries, scheduled ETL, and webhook fan-out. Tables span `emergency_requests`, `resources`, `programs`, `user_settings`, `outreach_contacts`, analytics logs, and scheduled job telemetry.

## Critical Data Flows
1. **Emergency Escalation**
   - `/emergency` invokes `emergency-handler` with location + context.
   - Records are persisted in `emergency_requests`; Postgres triggers forward high-risk events to `911-dispatch`, which posts to `911_WEBHOOK_URL`.
   - Outreach cases query `outreach_contacts` for soft handoff suggestions.
2. **Resource Discovery**
   - The kiosk will call `resource-finder` with `lat`, `lng`, and optional filters. The function runs PostGIS distance queries, returning trust-ranked cards for the UI or map to render.
   - Nightly, `update-resources` ingests County and Clean & Safe APIs to refresh `resources`, updating `verified_on` to inform UI badges.
3. **Information & Learning**
   - `/resources/*` and educational modules query `info-handler` for localized program content filtered by language, category, and voice availability.
4. **Preference Persistence**
   - `get-settings` and `update-settings` round-trip per-user accessibility preferences, allowing seamless experience continuity between kiosks.
5. **Analytics Loop**
   - `log-usage` anonymizes module hits and coarse location data, writing to `usage_logs` for decision support.

## Deployment Topology
- **Frontend Hosting**: Designed for Vercel with edge caching, but portable to any Node server as long as environment variables for Supabase and analytics are set.
- **Supabase Project**: Houses the Postgres instance, Row-Level Security rules, Edge Functions, and secrets. Local development relies on `supabase start` within `/backend`.
- **Scheduled Automation**: `pg_cron` triggers nightly resource refreshes via `trigger_resource_update`, which leverages `pg_net` to call the Edge Function even if the CLI is offline.

## Security & Compliance Considerations
- Service role keys fuel server-side functions; kiosk clients should only use anon keys.
- Emergency data stores PII—limit access via RLS policies (see migration `004_setup_rls.sql`) and rotate `911_WEBHOOK_URL` secrets frequently.
- Location data is rounded for analytics, and voice transcripts should be scrubbed before long-term retention (future improvement).

This architecture intentionally keeps compute close to data for resiliency while allowing the kiosk UI to remain lightweight and cacheable.
