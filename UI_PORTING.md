# UI Porting Guide

This guide is the quickest way to bring this UI into another codebase without re-discovering the app structure by hand. It is written for both engineers and coding agents and is organized by porting order rather than by file tree.

Use this guide together with:
- [`README.md`](README.md) for local setup
- [`THEMING.md`](THEMING.md) for theme background
- [`components/dag/README.md`](components/dag/README.md) for the standalone DAG widget

## 1. Foundation And Dependencies

Start by recreating the runtime and styling foundation from [`package.json`](package.json).

Core shell dependencies:
- Next.js 15 and React 18
- TypeScript
- Tailwind CSS, `tailwindcss-animate`, `tailwind-merge`, `class-variance-authority`
- Radix UI primitives used through the local `components/ui` layer
- `lucide-react`
- `sonner` for toast notifications
- `@kyndryl-design/component-library` for client theming and shared design tokens

Feature-specific dependencies:
- `@copilotkit/react-core`, `@copilotkit/react-ui`, `@copilotkit/runtime`
- `reactflow` for workflow/DAG views
- `recharts` for dashboard charts
- `leaflet` and `react-leaflet` for map-based views
- `three`, `@react-three/fiber`, and `@react-three/drei` for 3D scenes
- `framer-motion` and `gsap` for motion
- `@carbon/icons-react` and `react-icons` for icon coverage

Environment and service assumptions are shown in [`env.local.example`](env.local.example):
- `NEXT_PUBLIC_API_GATEWAY_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_LETTA_URL`
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID`

Important: not every env variable is currently backed by a production-ready implementation. The current auth flow is local and mock-driven, and the Supabase client is still a placeholder in [`lib/supabase/client.ts`](lib/supabase/client.ts).

## 2. Global App Shell And Providers

Port the app bootstrap from [`app/layout.tsx`](app/layout.tsx) before moving individual screens.

What wraps the app:
- `app/globals.css` for Tailwind tokens, base colors, custom animations, and legacy map styles
- `Noto_Kufi_Arabic` font registration for the root body class
- `ResizeObserverErrorHandler` for noisy observer issues
- `CopilotKitProvider` for the `/api/copilotkit` runtime bridge
- `ClientThemeProvider` for Kyndryl client theme application
- `AuthProvider`
- `IncrementalityExperimentProvider`
- `KnowledgeGraphInstanceProvider`
- `ArtifactProvider`
- `ActionEffectsProvider`
- `WorkflowEventProvider`
- `Toaster`

Recommended porting order for the shell:
1. Copy global CSS and Tailwind config.
2. Recreate the root provider chain from [`app/layout.tsx`](app/layout.tsx).
3. Port the authenticated shell in [`components/cdp/layout/app-shell.tsx`](components/cdp/layout/app-shell.tsx).
4. Port route-level guards such as [`app/dashboard/layout.tsx`](app/dashboard/layout.tsx).

The authenticated shell is not just visual chrome. It also owns navigation grouping, breadcrumbs, banner state, persona-aware surfaces, workflow event hooks, artifact panels, and the embedded DAG/chat affordances. Treat it as core infrastructure, not an optional component.

## 3. Design System, Theme, And Shared Primitives

There are three styling layers to preserve.

### Kyndryl client theme

The dynamic client theme is applied on mount by [`components/ClientThemeProvider.tsx`](components/ClientThemeProvider.tsx) using `apply_client_theme(clientId)` from the Kyndryl component library.

Primary theme data lives in:
- [`public/palettes.json`](public/palettes.json)
- [`public/themes.json`](public/themes.json)

Porting note: [`app/layout.tsx`](app/layout.tsx) currently passes `clientId="cdp"`, but the checked-in theme files document `default`, `tvg`, and `otherclient` or `client-acme`. Treat that mismatch as a portability risk and resolve it in the target app before assuming theming will load correctly.

### Local design tokens and globals

[`app/globals.css`](app/globals.css) contains:
- Tailwind-compatible semantic tokens such as `--background`, `--primary`, and `--radius`
- Kyndryl extended palette variables
- icon color behavior for Lucide icons
- shared animation classes used by chat and dashboard views
- Leaflet-specific popup styling

### Shared primitives

The reusable UI layer lives in [`components/ui`](components/ui). This is the fastest reusable slice after the provider shell.

High-value primitives to port first:
- buttons, cards, badges, dialogs, dropdowns, tabs, tables, textarea, tooltip, toast, sheet, select, sidebar, breadcrumb
- `use-mobile` and `use-toast` helpers

The sidebar implementation in [`components/ui/sidebar.tsx`](components/ui/sidebar.tsx) is especially important because the main shell depends on its responsive and cookie-backed collapse behavior.

Visualization-specific colors are centralized in [`lib/visualization-theme.ts`](lib/visualization-theme.ts). Reuse that file when moving chart-heavy pages so the dashboards do not drift visually from the rest of the product.

## 4. Auth And Routing Expectations

The login entry route is [`app/page.tsx`](app/page.tsx). It redirects authenticated users to `/dashboard` and otherwise renders [`components/auth/login-form.tsx`](components/auth/login-form.tsx).

Current auth behavior is defined in [`lib/auth-context.tsx`](lib/auth-context.tsx):
- session state is stored in localStorage under `cdp_user`
- user validation comes from [`lib/mock-users.ts`](lib/mock-users.ts)
- role, persona, and permission-tier logic are part of the UI behavior
- logout clears local session state and client caches

Do not assume the app currently depends on live Supabase auth. The env file references Supabase, but the implemented auth experience is mock-user based. If the target codebase already has real auth, port the role and permission model first and then adapt the provider to the destination identity system.

Authenticated layouts commonly wrap pages with [`components/cdp/layout/app-shell.tsx`](components/cdp/layout/app-shell.tsx) and guard access with `useAuth()`.

## 5. Feature Inventory By Route Family

Use this inventory to decide what to port first.

### Core entry and shared shell
- `/` login
- `/signup`
- `/dashboard`
- `/control-tower`
- `/chat`
- `/chat/execution-preview`

### Data and platform routes
- `/udp/dashboard`
- `/udp/incrementality`
- `/dashboard/graph`
- `/dashboard/graphs`
- `/analytics`
- `/analytics/pending-review`
- `/analytics/confirmed-actions`
- `/customers`

### Commercial routes
- `/campaigns`
- `/audiences`
- `/mmm`
- `/reports`

### Demand routes
- `/demand/dashboard`
- `/demand/chat`
- `/demand/analytics`
- `/demand/audiences`
- `/demand/campaigns`
- `/demand/customers`
- `/demand/incrementality`
- `/demand/mmm`
- `/demand/nba`
- `/demand/reports`

### Risk routes
- `/risk/dashboard`
- `/risk/chat`
- `/risk/audit`
- `/risk/monitoring`
- `/risk/vendors`

Feature/component areas that back these routes:
- [`components/cdp`](components/cdp) for the main shell, chat, audit, dashboard, consent, workflow, and role-aware platform UI
- [`components/dashboard`](components/dashboard) for higher-level dashboard surfaces
- [`components/demand`](components/demand) for demand planning flows
- [`components/knowledge-graph`](components/knowledge-graph) for graph exploration and saved graph instances
- [`components/dag`](components/dag) for the workflow visualization
- [`components/risk`](components/risk) for risk workflows

## 6. Minimum Viable Port

If the destination codebase only needs the core experience, move the UI in this order:

1. Tailwind, global CSS, and shared `components/ui`
2. Root providers from [`app/layout.tsx`](app/layout.tsx)
3. `ClientThemeProvider` and the palette/theme files
4. Auth entry flow from [`app/page.tsx`](app/page.tsx), [`components/auth`](components/auth), and [`lib/auth-context.tsx`](lib/auth-context.tsx)
5. App shell from [`components/cdp/layout/app-shell.tsx`](components/cdp/layout/app-shell.tsx)
6. One dashboard route, preferably [`app/dashboard/page.tsx`](app/dashboard/page.tsx), to validate charts, navigation, badges, dialogs, and action flows
7. Advanced modules such as DAG, demand planning, knowledge graph, maps, risk, and 3D scenes

## 7. High-Risk Portability Areas

Watch these closely during migration:
- Provider coupling: several pages assume root context providers already exist
- Theme dependency: the Kyndryl theme loader and the checked-in theme IDs are not perfectly aligned
- Auth assumptions: current role behavior is real UI logic even though auth is mock-backed
- CopilotKit dependency: the shell assumes a working `/api/copilotkit` runtime
- Visualization packages: `reactflow`, `recharts`, `leaflet`, and `three` all introduce setup and styling requirements
- Local storage keys: `cdp_user`, `cdp_users`, and other persisted client state may need renaming in the target app
- Feature breadth: the repo spans multiple product domains, so decide early whether the target app needs only the shell plus one domain or the full platform

## 8. Porting Checklist

A successful port should make these questions easy to answer:
- What must be installed for the shell to render?
- Which providers must wrap the app before any feature page works?
- How are themes applied, and where do the palette values live?
- Which files define the reusable primitive UI layer?
- Which routes are highest-priority versus optional?

If the destination codebase can answer those questions and render the login flow, app shell, theme, and one dashboard route, the port is on solid footing.
