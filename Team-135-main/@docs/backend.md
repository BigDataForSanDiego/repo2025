# Backend Delivery Guide

## Stack & Directory Layout
- **Supabase Project** (`backend/`): houses configuration (`supabase/config.toml`), Edge Functions (`supabase/functions`), database migrations (`supabase/migrations`), and docs for setup/deployment.
- **Runtime**: PostgreSQL 15 with PostGIS, pg_cron, pg_net extensions; Edge Functions run on Deno 1.37+ with ES modules.
- **Tooling**: Supabase CLI powers local development (`npm start`, `supabase functions serve`), schema pushes, and migrations.

## Data Model Snapshot
| Table | Purpose | Notes |
| --- | --- | --- |
| `emergency_requests` | Stores emergency submissions with GPS, transcripts, status | Trigger in `006_emergency_trigger.sql` pings 911 webhook when `is_danger=true` |
| `resources` | Canonical list of shelters, food programs, clinics, hygiene sites | Maintains `verified_on`, `pet_friendly`, generated PostGIS geography column |
| `programs` | Informational content by category/language | Supports `voice_enabled` flag for accessibility |
| `user_settings` | Per-user accessibility preferences | Keys: voice, text, language, contrast, font size |
| `outreach_contacts` | Partners who handle non-danger requests | Future queueing for SMS/email |
| `usage_logs` & `voice_logs` | Analytics for module hits + voice quality | Location rounded for privacy |
| `scheduled_job_logs` | Tracks pg_cron executions | Populated by `log_scheduled_job` helper |

## Edge Function Catalog
- **`emergency-handler`**: Validates emergency payloads, inserts into `emergency_requests`, and classifies responder type (`911` vs `outreach`).
- **`911-dispatch`**: Formats webhook payloads and POSTs to `911_WEBHOOK_URL`; invoked via trigger for dangerous events.
- **`resource-finder`**: Accepts `lat/lng` query params, filters by type/pet/open flags, and runs PostGIS distance calculations.
- **`update-resources`**: Nightly ETL that ingests County + Clean & Safe APIs, transforms records, and upserts into `resources` (with statistics logging).
- **`info-handler`**: Returns multilingual program catalog filtered by `language`, `category`, and `voice_enabled` query params.
- **`get-settings` / `update-settings`**: Fetch and upsert accessibility preferences per `user_id` with strict validation.
- **`log-usage`**: Records anonymized analytics events with rounded coordinates and module classification.

Shared helpers in `_shared/errors.ts` and `_shared/validation.ts` centralize HTTP method checks, response envelopes, and field validation (UUID, language codes, lat/lng, etc.). Always import from these modules when building new functions to keep logging and error semantics uniform.

## Automation & Integrations
- **PostGIS Enablement (002)**: Adds generated geography column and ensures queries use SRID 4326 for accuracy; `003_create_indexes.sql` builds GiST indexes for speed.
- **Row-Level Security (004)**: Applies policies aligning with Supabase auth to contain sensitive rows.
- **Cron Scheduling (007)**: `pg_cron` + `pg_net` automatically invoke `update-resources` at 02:00 UTC daily; `scheduled_job_logs` capture status.
- **Data Seeding (005 & 008)**: Provide realistic resources and program records for demo environments.
- **Analytics Tables (009)**: Expand tracking for module usage and outreach metrics.

## Environment & Secrets
Set these in the Supabase dashboard (and `.env` for local CLI sessions):
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- `911_WEBHOOK_URL`
- `COUNTY_API_URL`, `CLEAN_SAFE_URL`
- `app.settings.supabase_url` & `app.settings.service_role_key` (for pg_cron HTTP calls)

Rotate keys quarterly, monitor pg_cron logs, and ensure webhook endpoints enforce mutual TLS or shared secrets to keep emergency data secure.
