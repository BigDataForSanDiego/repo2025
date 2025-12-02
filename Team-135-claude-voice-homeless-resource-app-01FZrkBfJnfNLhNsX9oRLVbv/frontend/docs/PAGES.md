# Page Experience Documentation

## Home (/)
**Current experience**: A two-option landing screen that asks “What do you need right now?” and routes visitors either to immediate emergency help or to resource discovery. The page uses large tappable cards with iconography tailored to a dark, high-contrast palette, making it approachable on mobile. There is no contextual messaging beyond the two CTAs, so the intent is clarity over depth.

**Improve it by**:
- Introducing a lightweight onboarding banner that summarizes what the assistant can do, easing uncertainty for first-time visitors.
- Personalizing the CTA ordering and copy based on inferred urgency (e.g., location, time of day, prior selections) to reduce decision friction.
- Adding secondary shortcuts (“Find nearest safe parking”, “Hear today’s shelters”) or voice prompt hints that preview downstream capabilities.
- Providing an accessibility toolbar (language switcher, large text toggle) surfaced here rather than burying it in subpages.

## Emergency (/emergency)
**Current experience**: A single-screen voice interaction mock. Users tap a “Press for Help” button that animates ripples, toggles a listening state, and eventually displays a hardcoded transcription. A greeting chip acknowledges the user by name. The footer exposes quick actions (Call 911 placeholder, text mode, language) but none are wired to real services.

**Improve it by**:
- Connecting the microphone control to actual speech-to-text, with streaming feedback and reliability indicators (network strength, last sync).
- Offering a scripted fallback (“Switch to text mode”) plus multi-lingual prompts with real translation support.
- Automatically triaging the transcript into actionable intents (shelter, medical, safety) and presenting next steps (call counselor, open map) inline.
- Surfacing geolocation consent + emergency reference numbers at the top to shorten the path to human responders.

## Resources Overview (/resources)
**Current experience**: A grid of five category cards (Shelter, Food, Hygiene, Medical, Pet-friendly) with short descriptions that link to stub subpages. The design is consistent with the home palette and reinforces the idea of equal-weight resource types.

**Improve it by**:
- Prioritizing categories dynamically based on community alerts (e.g., extreme weather shifts Shelter to the top with a badge).
- Adding quick filters (“Open now”, “Accepts pets”) so users can tailor the directory before drilling down.
- Displaying a “recently viewed” or “recommended for you” strip backed by anonymized usage history.
- Including offline-friendly tips (nearest 24/7 hotline) for users with weak connectivity.

## Shelter (/resources/shelter)
**Current experience**: Static placeholder text stating “Finding nearby shelter resources…” without listings, filters, or navigation beyond the back button.

**Improve it by**:
- Rendering a prioritized list of shelters with trust badges, capacity indicators, and arrival instructions.
- Allowing users to filter by requirements (families, LGBTQ+, pet-friendly) and set alerts when beds open.
- Embedding micro-maps or walking directions directly inside each card, with offline fallback SMS instructions.
- Providing contextual safety info (check-in hours, documentation needed, on-site services) to reduce surprises on arrival.

## Food (/resources/food)
**Current experience**: Identical structure to the Shelter page with placeholder copy promising nearby food resources.

**Improve it by**:
- Listing meal sites by serving window, dietary options, and verification date, emphasizing “open now” cues.
- Highlighting mobile meal vans or pop-up programs with live status updates from community partners.
- Adding nutrition guidance or links to SNAP/WIC enrollment support for longer-term planning.
- Letting users bookmark favorite locations and receive push/SMS reminders prior to meal times.

## Hygiene (/resources/hygiene)
**Current experience**: Placeholder text referencing hygiene resources.

**Improve it by**:
- Cataloging showers, laundry services, and hygiene kit pick-up spots with accessibility notes (ADA showers, gender-neutral stalls).
- Tracking amenities (towel availability, soap provided) and wait-time estimates crowdsourced from recent visitors.
- Offering instructions for using public facilities safely, including what ID is required and operational rules.
- Suggesting paired services (e.g., “Laundry + job readiness clinic across the street”) to maximize each trip.

## Medical (/resources/medical)
**Current experience**: Placeholder text referencing medical resources.

**Improve it by**:
- Segmenting by care type (urgent, chronic, mental health) and clearly labeling whether walk-ins are accepted.
- Integrating telehealth options (“Talk to a nurse now”) to cover gaps when clinics are closed.
- Displaying transportation assistance (bus routes, vouchers) and insurance requirements front and center.
- Embedding crisis-specific strips (heat illness, overdose response kits) triggered by local alerts.

## Pet-Friendly (/resources/pets)
**Current experience**: Placeholder text referencing pet-friendly resources.

**Improve it by**:
- Mapping shelters, vets, and supply pantries that accept or serve companion animals, including vaccination requirements.
- Featuring foster or boarding programs for situations where pets cannot stay onsite, plus contact workflows.
- Publishing guidance on paperwork, microchipping, and low-cost vet days to reduce barriers for pet owners.
- Creating a pairing mechanism (“travel buddy” volunteers) who can accompany users with animals to appointments.

## Map (/map)
**Current experience**: A static gradient backdrop with decorative map pins and an overlay card describing “Hope Shelter.” The card hints at verification status, hours, pet friendliness, and includes a “Talk to someone” button, but the map is non-interactive and data is hardcoded.

**Improve it by**:
- Embedding a live geospatial view (Mapbox, Esri, Google) that pulls verified resources, capacity, and hazards in real time.
- Supporting layered filters (shelters, clinics, cooling centers) and heat-map overlays for outreach teams.
- Adding turn-by-turn directions, multi-stop trip planning, and offline caching so routes persist without connectivity.
- Enabling live chat or VOIP calls from the card CTA, with queue estimates and multilingual support baked in.
