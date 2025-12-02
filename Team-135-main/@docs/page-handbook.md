# Page Experience Handbook

## Home (`/`)
**Current State**: Presents two hero CTAs—"Get Help Now" and "Find Daily Essentials"—against a dark, calming background. It prioritizes clarity and quick thumb-sized actions but offers little onboarding context.
**Opportunities**:
- Add a short mission statement or progress indicator so first-time users know what to expect.
- Dynamically emphasize the CTA most relevant to current conditions (e.g., heat advisories prioritizing shelter).
- Introduce multilingual toggles and voice hints directly on this screen to avoid burying accessibility affordances.

## Emergency (`/emergency`)
**Current State**: Simulates a large press-and-hold microphone interaction with ripples, greeting chip, and placeholder footer controls for text mode, languages, and 911 dialing.
**Opportunities**:
- Connect to real speech-to-text services, showing streaming captions, retry guidance, and connection strength.
- Auto-triage transcripts into intents (shelter, medical, safety) and present contextual next steps alongside the transcription card.
- Make footer quick actions functional: language cycling, text-only fallback, and direct-calling with disclaimers.

## Resources Hub (`/resources`)
**Current State**: Grid of five cards (shelter, food, hygiene, medical, pet services) that route to stub detail pages. Visual hierarchy is balanced but static.
**Opportunities**:
- Reorder categories automatically based on local alerts or personalized history.
- Highlight data freshness and availability ("5 open shelters right now") before navigating deeper.
- Provide quick filters or chips ("Open Now", "Allows Pets") to reduce subsequent taps.

## Category Detail Pages (`/resources/{shelter|food|hygiene|medical|pets}`)
**Current State**: Each page only displays a heading and a "Finding nearby..." placeholder, signaling planned dynamic content.
**Opportunities**:
- Inject lists from `resource-finder` with trust indicators, capacity, directions, and call buttons.
- Offer proximity sorting, map previews, and save/share mechanics for outreach staff.
- Surface contextual education (e.g., "What to bring" for shelters, "Documents needed" for clinics).

## Map (`/map`)
**Current State**: Static gradient background with dummy pins and an overlay card describing "Hope Shelter" plus verification and hours badges.
**Opportunities**:
- Replace the placeholder with an actual tile map (Mapbox/Esri) layered with Supabase `resources` results.
- Add filter chips for resource types, hazard overlays, and distance rings for quick spatial reasoning.
- Allow deep-linking from resource cards to turn-by-turn navigation or contact options.

Use this handbook as the canonical reference when collaborating with design, data, or outreach partners on UX improvements.
