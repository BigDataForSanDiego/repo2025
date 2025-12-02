# Frontend Delivery Guide

## Tech Stack at a Glance
- **Framework**: Next.js 16 App Router with React 19, TypeScript strict mode, and `next/font` for Geist type.
- **Styling**: Tailwind CSS 4, `tw-animate-css`, and design tokens defined in `styles/globals.css` sourced through CSS custom properties.
- **UI Kit**: `components/ui` mirrors shadcn primitives, while bespoke layout primitives live in `components/client-layout.tsx`, `navigation.tsx`, and `theme-provider.tsx`.
- **State & Theming**: Lightweight React hooks with a `ThemeProvider` that syncs light/dark preference to `localStorage` and toggles the `.light` root class.
- **Analytics**: `@vercel/analytics` auto-injected via `app/layout.tsx` keeps privacy-preserving usage stats.

## Directory Map
- `app/` routes include `page.tsx` (landing), `emergency`, `resources` (with nested category folders), and `map`. Use these directories for colocated layouts, loading states, and metadata definitions.
- `components/` stores shared UI, nav controls, and theme context. Keep new interactive molecules here for reusability.
- `hooks/` contains portable logic like `use-mobile` and `use-toast`; centralize new kiosk-specific hooks alongside them.
- `lib/utils.ts` houses helpers (class mergers, formatters, geospatial math) that should avoid React imports.
- `public/` and `images/` store static assets referenced by metadata icons and backgrounds.

## Interaction Patterns
- **ClientLayout**: Wraps every screen with the navigation rail that exposes voice, text, language, and contrast toggles. Update it when accessibility affordances evolve.
- **Navigation Buttons**: Currently placeholders for voice/text toggles—wire them to Supabase settings APIs and surface state with clear icons.
- **Page Layouts**: Each route honors a max-width column that centers content on kiosks yet remains responsive for mobile demos; maintain this for consistent ergonomics.

## Accessibility & Internationalization
- Default theme is high-contrast dark with `.light` overrides. Strive for WCAG AA color ratios when adjusting tokens in `styles/globals.css`.
- Font sizes are tuned for kiosk readability; use rem-based sizing and respect stored `font_size` once settings sync is alive.
- Prepare to translate static copy by wrapping strings in a thin localization layer before hooking to Supabase `language_pref` responses.

## Performance & Observability
- Pages are largely static; leverage Next.js Server Components when data hooks in to keep bundles tiny. Client Components should be opt-in and declared via `'use client'` directives.
- Validate UI flows manually until automated testing lands; log manual QA steps in PRs.
- Use the built-in ESLint (`pnpm lint`) to guard against runtime errors, a11y issues, and Tailwind misuse.

## Upcoming Enhancements
1. Bind `/emergency` to actual microphone APIs plus streaming captions.
2. Replace placeholder category pages with live data from `resource-finder` and inline filters.
3. Embed the interactive map view inside `/map` using Mapbox GL or Google Maps, wired to Supabase data.
4. Persist theme and language toggles via `get-settings`/`update-settings` for cross-device continuity.

Follow this guide when adding new routes, components, or UX flows to keep the kiosk experience coherent and resilient.
