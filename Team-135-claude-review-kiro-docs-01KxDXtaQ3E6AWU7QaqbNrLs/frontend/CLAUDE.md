# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

"Home Base" - A distress relief mobile web application for people experiencing homelessness. The app helps users quickly find emergency assistance and daily essentials (shelter, food, hygiene, medical care, pet-friendly services).

## Technology Stack

- **Framework**: Next.js 16.0.3 with React 19.2.0
- **Styling**: Tailwind CSS v4 with custom theme variables
- **UI Components**: shadcn/ui (New York style) with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **TypeScript**: Strict mode enabled
- **Analytics**: Vercel Analytics

## Common Commands

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production (TypeScript errors are ignored via next.config.mjs)
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## Architecture

### App Structure (Next.js App Router)

- `app/page.tsx` - Home page with two main CTAs: "Get Help Now" (emergency) and "Find Daily Essentials" (resources)
- `app/emergency/page.tsx` - Emergency assistance page
- `app/resources/page.tsx` - Resource category selection (Shelter, Food, Hygiene, Medical, Pets)
- `app/resources/[category]/page.tsx` - Individual resource category pages
- `app/map/page.tsx` - Map view for location-based services
- `app/layout.tsx` - Root layout with metadata and analytics
- `app/globals.css` - Global styles with custom CSS variables for theming

### Component Organization

- `components/ui/` - shadcn/ui components (Button, Card, Dialog, etc.)
- `components/client-layout.tsx` - Client-side wrapper with ThemeProvider and Navigation
- `components/navigation.tsx` - Bottom navigation bar with accessibility features (Voice, Text/Visual, Language, Contrast toggle)
- `components/theme-provider.tsx` - Theme context provider

### Path Aliases

Configured in `tsconfig.json` and `components.json`:
- `@/*` maps to project root
- `@/components` - Components directory
- `@/lib` - Utilities (e.g., `@/lib/utils` for cn() helper)
- `@/hooks` - Custom React hooks
- `@/components/ui` - UI components

### Theme System

Custom color scheme using OKLCH colors:
- **Navy** (`#1a1d2e`) - Primary background
- **Sage Green** (`#7a9278`) - Secondary actions, resource cards
- **Coral Red** (`#d4554f`) - Emergency/danger alerts
- Supports light/dark mode via `light` class and custom Tailwind variants
- CSS variables defined in `app/globals.css` with `@custom-variant` for theme switching

### shadcn/ui Configuration

- Style: "new-york"
- Icon library: lucide-react
- Base color: neutral
- Uses CSS variables for theming
- Components can be added via `npx shadcn@latest add [component]`

## Important Configuration Notes

1. **TypeScript Build Errors Ignored**: `next.config.mjs` has `typescript.ignoreBuildErrors: true` - be cautious about type safety
2. **Image Optimization Disabled**: `images.unoptimized: true` in Next.js config
3. **Strict Mode**: TypeScript strict mode is enabled
4. **Target Audience**: UI is designed for accessibility with large buttons, high contrast, and planned voice/language features

## Development Guidelines

- The app uses client components for interactivity (note `'use client'` directives)
- Navigation is fixed at bottom for mobile-first design
- Color classes often use arbitrary values for the custom theme (e.g., `bg-[#1a1d2e]`)
- Light mode styling uses the `light:` variant prefix
