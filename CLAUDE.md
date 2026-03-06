# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

OpenRouter API Keys Dashboard — a Next.js 16 + React 19 client-side app for managing OpenRouter API keys with usage tracking, key CRUD operations, and auto-refresh.

## Commands

```bash
pnpm dev        # Dev server on http://localhost:3000
pnpm build      # Production build
pnpm start      # Start production server
pnpm lint       # ESLint (v9, Next.js core web vitals + TypeScript)
```

No test framework is configured.

## Architecture

**Client-side only** — no backend. The app communicates directly with the OpenRouter API (`https://openrouter.ai/api/v1/keys`) using a management API key stored in localStorage (fallback: `NEXT_PUBLIC_OPENROUTER_MGMT_KEY` env var).

### Key layers

- **`src/app/`** — Next.js App Router. Single page (`page.tsx`) that switches between `LandingPage` (auth) and `Dashboard` based on API key presence.
- **`src/components/`** — Feature components (`Dashboard`, `KeysTable`, `SummaryCards`, `CreditsBars`, dialog components for create/edit/delete).
- **`src/components/ui/`** — Shadcn-style primitives wrapping `@base-ui/react` v1, styled with Tailwind CSS v4. Configured via `components.json` (base-nova style, zinc theme).
- **`src/lib/openrouter.ts`** — API client: `listKeys`, `createKey`, `updateKey`, `deleteKey` using native `fetch` with Bearer auth.
- **`src/lib/storage.ts`** — localStorage wrapper for the management API key.
- **`src/lib/utils.ts`** — `cn()` helper (clsx + tailwind-merge).

### Data flow

`Dashboard.tsx` is the central orchestrator — owns all state (keys array, loading, error, search, pagination offset, dialog visibility), handles auto-refresh (30s interval), and passes data/callbacks down to presentational children.

### Styling

- Tailwind CSS v4 via `@tailwindcss/postcss` (no tailwind.config file)
- Dark mode forced (`className="dark"` on html element)
- Geist font family
- Path alias: `@/*` → `./src/*`
