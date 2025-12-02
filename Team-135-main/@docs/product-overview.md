# Product Overview

## Mission & Promise
Homebase is a voice-forward, geospatial assistant that keeps people experiencing homelessness safe, informed, and connected to services in the moments they ask for help. The platform must work offline-tolerant kiosks, borrowed phones, and outreach tablets with the same clarity and trust.

## Target Personas
- **Crisis Seeker**: Someone facing immediate safety or medical issues who needs one-tap escalation to a human responder.
- **Essential Needs Planner**: An individual seeking nearby shelter beds, hot meals, showers, or veterinary care within walking distance.
- **Outreach Navigator**: Case workers and city staff who rely on accurate resource data and analytics to coordinate interventions.

## Experience Pillars
1. **Immediate Trust** – Interfaces reduce cognitive load, support multiple languages, and signal when humans are being alerted.
2. **Context Awareness** – Geolocated resources, weather-aware alerts, and remembered accessibility settings tailor recommendations.
3. **Operational Reliability** – Daily data refreshes, redundant dispatch notifications, and edge validation ensure accuracy even during outages.

## End-to-End Journey
1. **Entry**: Users land on `/` and declare urgency via "Get Help Now" (emergency) or "Find Daily Essentials" (resource exploration).
2. **Emergency Stream**: `/emergency` captures voice, transcribes requests, and routes them to Supabase Edge Functions that either trigger 911 webhooks or outreach workflows.
3. **Resource Stream**: `/resources` launches curated categories (shelter, food, hygiene, medical, pet services) that in future iterations consume the `resource-finder` API for live listings.
4. **Map Context**: `/map` overlays geospatial guidance on top of the resource data, presenting trust badges, hours, and CTA buttons.
5. **Preferences & Analytics**: `get-settings`, `update-settings`, and `log-usage` record accessibility choices and anonymized engagement to continuously improve service quality.

## Success Indicators
- **Response Confidence**: >95% of emergency submissions receive a responder classification (<30 seconds) and, when dangerous, a dispatched webhook.
- **Resource Freshness**: Nightly imports yield <24h old verification timestamps for top shelters and meal sites.
- **Accessibility Adoption**: At least 60% of repeat users have stored settings (language, contrast, font) retrieved via `get-settings`.
- **Operational Visibility**: Analytics dashboards backed by `usage_logs` highlight peak modules, enabling targeted content/infra improvements.

Treat these goals as the north star for all technical and design decisions detailed in the remaining documents.
