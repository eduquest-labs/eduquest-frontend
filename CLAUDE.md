# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

Frontend for **EduQuest**, a learning-gamification PWA built to support a classroom experiment at Universitas Pendidikan Indonesia (UPI). It talks to a separate Laravel API (`../eduquest-backend`) backed by MySQL. Two roles use it: `dosen` (lecturer — full authoring/monitoring/analytics, real email+password login) and `siswa` (student — joins via class code + name only, no password, auto-provisioned account). Don't design a unified auth flow — the two roles' login UX is intentionally different.

Product/domain context (DB schema, business rules like final-submission locking and anonymized exports) lives in project memory, not in this repo. Check `PRD Project/` at the repo root (`PRD_Platform_Gamifikasi_Pembelajaran.pdf`, `schema.sql`) for authoritative requirements before building a feature.

**Current state**: scaffolding is in place (providers, services layer, stores, testing setup) but no feature routes/components have been built yet beyond the default `app/page.tsx`. The conventions below are the target architecture for everything built from here.

## Commands

```bash
npm run dev       # start dev server (http://localhost:3000)
npm run build     # production build
npm run start     # run production build
npm run lint      # eslint (flat config, eslint-config-next core-web-vitals + typescript)
npm run test      # vitest (unit/integration/component)
npm run test:e2e  # playwright (E2E)
```

Run a single Vitest file: `npx vitest run path/to/file.test.ts`. Run a single Playwright spec: `npx playwright test tests/e2e/foo.spec.ts`.

## Stack

- Next.js 16 (App Router), React 19, TypeScript (strict mode)
- Tailwind CSS v4 (via `@tailwindcss/postcss`, no `tailwind.config` file — config lives in `@theme {}` inside `app/globals.css`)
- **HeroUI v3** (`@heroui/react`) — primary UI component library. Imported via `@import "@heroui/styles"` in `app/globals.css`; there is **no** `HeroUIProvider` in v3.
- **framer-motion** — animation
- **next-themes** — dark/light mode, configured with `attribute="data-theme"` in `app/providers.tsx`
- **Zustand** — global UI state only (not server data)
- **TanStack Query v5** — server state management
- **axios** — HTTP client (single instance in `services/client.ts`)
- **Zod** — validation for user input, URL params, storage data
- **lucide-react** — icons
- Path alias `@/*` maps to the repo root (not `src/` — this project keeps `app/`, `components/`, `services/`, etc. at the top level)

## Folder structure

```
app/
├── layout.tsx            # root layout: fonts, metadata, Providers wrapper
├── providers.tsx         # client: ThemeProvider + QueryProvider
├── globals.css           # Tailwind @theme, HeroUI import, CSS tokens
└── page.tsx              # not yet replaced with real routes/route groups
components/
├── base/
│   ├── layout/           # app shell components (not yet created)
│   ├── shared/           # generic cross-domain components (not yet created)
│   └── icons/            # SVG icon components + AppLogo (not yet created)
└── [domain]/             # one folder per feature domain, e.g. quiz/, leaderboard/ (not yet created)
config/
├── site.config.ts        # siteConfig, pageMetadata
└── constants.ts          # SCREAMING_SNAKE_CASE constants grouped by domain
hooks/
├── queries/               # TanStack Query hooks (useQuery), index.ts re-exports all
└── mutations/             # TanStack Mutation hooks (useMutation), index.ts re-exports all
lib/
├── utils.ts               # cn()
├── validations.ts         # Zod schemas
├── query-client.ts        # createQueryClient() factory — used by both server and client
└── contracts/             # raw API response shapes, snake_case (not yet created)
providers/
└── query-provider.tsx     # QueryClientProvider + ReactQueryDevtools
services/
├── client.ts              # single axios instance — interceptors already wired
├── endpoints.ts           # all API URLs — the only place URLs are written
├── token-store.ts         # getToken / setToken / clearToken (in-memory)
├── modules/               # async functions per domain (not yet created)
└── adapters/               # snake_case → camelCase transforms (not yet created)
stores/
└── ui.store.ts            # sidebarOpen, setSidebarOpen, toggleSidebar
types/
├── common.types.ts        # ApiResponse<T>, Pagination, PaginatedResponse<T>
└── index.ts               # re-exports all type files
test/                      # Vitest + RTL + MSW (non-E2E)
├── setup.ts
├── msw/{server.ts, handlers/}
└── helpers/render.tsx     # renderWithProviders()
tests/                     # Playwright E2E only
├── e2e/                   # not yet created
└── page-objects/BasePage.ts
```

`components/[domain]/`, `services/modules/`, `services/adapters/`, `lib/contracts/`, and `tests/e2e/` don't exist yet — create them following the existing layer conventions when the first feature domain is built (see **Alur implementasi domain baru** below).

## Testing stack

- **Vitest + React Testing Library + MSW** — unit, integration, component tests, config in `vitest.config.ts` / `test/setup.ts`
- **Playwright + Page Object Model** — E2E, config in `playwright.config.ts`

```
test/
├── setup.ts                 # global test setup (jest-dom matchers)
├── msw/
│   ├── server.ts            # setupServer() for Vitest
│   └── handlers/             # MSW handlers, one file per domain, re-exported from index.ts
└── helpers/
    └── render.tsx            # renderWithProviders() — wraps QueryClientProvider, use instead of manual setup

tests/                        # root-level — Playwright E2E only
├── e2e/
│   └── [feature].spec.ts
└── page-objects/
    ├── BasePage.ts           # shared actions (goto, waitForLoad)
    └── [Feature]Page.ts      # POM per feature
```

Write tests in this order once a feature is built: adapter → service → hook → component → E2E. Adapters are pure functions and need no mocking; services/hooks are tested against MSW handlers, not live network calls. Test behavior, not implementation — don't assert on internal function names. Never import `data/` fixtures (if added later) into tests; use MSW handler-local fixtures instead.

## Architecture: data flow

Every piece of server data flows through the same layered pipeline, in order:

```
API
 └── services/client.ts          # single axios instance — auth header injection, 401 → redirect to login
      └── services/endpoints.ts  # URL registry — the only place URLs are written
           └── services/modules/ # async functions — fetch & return raw API response, no hooks
                └── services/adapters/ # pure functions — transform snake_case (Laravel) → camelCase (app types)
                     └── hooks/queries/ or hooks/mutations/ # TanStack Query hooks — { data, isLoading, error } / { mutate, isPending }
                          └── Component  # renders only, never calls services directly
```

Rules per layer:
- `services/endpoints.ts` — strings or functions returning strings, no logic.
- `services/modules/` — async functions only, no React hooks, one file per domain.
- `services/adapters/` — pure functions, no side effects. Only create a dedicated adapter file when the transform is non-trivial (5+ lines, reused across endpoints, or needs its own test) — inline a 1–2 field rename directly in the service function instead.
- `hooks/queries/` — React Query hooks. Use a query key factory per domain (`['domain', 'list' | 'detail', params] as const`).
- `hooks/mutations/` — mutation hooks; must `invalidateQueries` in `onSuccess`.
- Components never call `services/` or axios directly — always through a hook.
- Every folder re-exports its public API from an `index.ts`; import from the folder, not the file directly.

No SSR/prefetch pattern is used here — this is a research tool for one class, not a public product, so there's no SEO or first-paint requirement to justify the added complexity. Pages are Client Components (`"use client"`) that fetch with a plain `useQuery`/`useMutation` call; `QueryClientProvider` (already wired in `app/providers.tsx`) is enough. Don't reach for `createQueryClient()` inside a Server Component, `dehydrate`/`HydrationBoundary`, or `prefetchQuery` unless a specific page is later found to need it.

## Auth & tokens

- Token is held **in memory** via `services/token-store.ts` (`getToken`/`setToken`/`clearToken`) — not `localStorage`.
- The axios instance in `services/client.ts` auto-injects `Authorization: Bearer <token>` and redirects to `/auth/login` on a 401.

## Component placement

| Condition | Location |
|---|---|
| Small sub-component, used in one file only | Inline in that file, not exported |
| Used in 2+ files within the same domain | `components/[domain]/` |
| Used across 2+ different domains | `components/base/shared/` |

Naming reflects scope: `base/shared/` gets generic names (`StatusBadge`, `EmptyState`); `components/[domain]/` gets domain-prefixed names (`QuestionCard`, `LeaderboardTable`). Don't create `QuestionBadge` — create a generic `StatusBadge` configured from the domain layer. Components must not import across domains (`components/quiz` must not import from `components/leaderboard`).

## Loading & error state

Scope loading/error/empty state as granularly as possible — only the element that depends on the data, not the whole page or section.

```tsx
// Good — skeleton inline on the data-bearing element
<span>{isLoading ? <Skeleton className="h-8 w-24 rounded-md" /> : formatScore(score)}</span>

// Bad — hides everything else on the page too
if (isLoading) return <Spinner />;
```

Escalate scope only when necessary: single element → skeleton inline; list/table → skeleton rows; whole section failed → a `StateDisplay`-style component; unexpected crash → `error.tsx` route boundary (last resort).

## Styling

- No `tailwind.config.ts` — Tailwind v4 config lives in `@theme {}` inside `app/globals.css`.
- Prefer built-in Tailwind utility scale over arbitrary values when an equivalent exists (`max-w-48` not `max-w-[12rem]`).
- CSS custom properties in a `className` use the `(--token)` syntax, not `[var(--token)]`: `text-(--nav-fg)` not `text-[var(--nav-fg)]`. In a `style` prop, still use `style={{ background: 'var(--nav-bg)' }}`.
- Dark mode is driven by `next-themes` with `attribute="data-theme"` — write dark-mode overrides against `[data-theme="dark"]`.
- Mobile-first: unprefixed classes are the mobile default, breakpoint prefixes (`sm`, `md`, `lg`) style up from there — never write desktop-first with `max-*` prefixes.

## State management

- Zustand (`stores/`) is for UI state only (open/closed, active tab, modal) — never server data.
- Server data always goes through TanStack Query hooks, never into a Zustand store.
- Store file naming: `[name].store.ts`. Zustand v5 signature: `create<State>()((set) => ({ ... }))` (note the double call).

## Types & validation

- All exported types/interfaces live in `types/` (e.g. `types/quiz.types.ts`, re-exported from `types/index.ts`) — never exported from a component, adapter, store, or hook file.
- A component's own props interface may stay inline in the component file only if it is **not exported**.
- Zod schemas live in `lib/validations.ts`; use `z.infer<typeof schema>` as the type source instead of hand-writing a duplicate type.
- Zod is required for: form input, URL/search params, data read from `localStorage`/`sessionStorage`. Not needed for API responses (already normalized by the adapter layer) or component props (TypeScript covers that).

## Code style

- React components and hooks (`useXxx`) use `function` declarations, not arrow functions (better stack traces, hoistable). Callbacks and inline event handlers use arrow functions.
- `page.tsx`/`layout.tsx` use `export default function` (Next.js requirement); everything else uses named exports.
- Destructure props inline in the function signature with a type annotation — never access via `props.x`.
- Prefer `const`; only use `let` for a traditional `for` loop counter that must be reassigned.
- Import order: `"use client"` directive (if needed, above all imports) → React → external packages (alphabetical) → internal absolute (`@/...`) → relative imports.
- Naming: components `PascalCase.tsx`, hooks `useXxx.ts`, `[domain].types.ts`, `[domain].service.ts`, `[domain].adapter.ts`, Zustand stores `[name].store.ts`, exported props interfaces `[ComponentName]Props`.
- Constants (magic numbers, UI labels, style-to-status maps, storage keys) go in `config/constants.ts`, grouped by domain with comment separators, `SCREAMING_SNAKE_CASE`, and `as const` (use `satisfies` when the constant must conform to a type, to keep literal inference).

## Anti-patterns

- Exporting a type from anywhere other than `types/`.
- Writing a URL literal outside `services/endpoints.ts`, or creating a second axios instance outside `services/client.ts`.
- Calling a service function directly from a component instead of through a hook.
- Putting server data in a Zustand store.
- A dedicated adapter file for a 1–2 field rename — inline it in the service instead.
- `[var(--token)]` in a className instead of `(--token)`.
- Full-page spinners instead of granular skeletons.
- Building anything on the out-of-scope v1.0 list below without being asked explicitly.

## Adding a new feature domain

Order to follow when adding a new domain (example: `quiz`):

1. `types/quiz.types.ts` → re-export from `types/index.ts`
2. `lib/contracts/quiz.ts` (raw API shape, snake_case)
3. `services/endpoints.ts` — add the domain's endpoint keys
4. `services/adapters/quiz.adapter.ts` → re-export from adapters `index.ts`
5. `services/modules/quiz.service.ts` → re-export from modules `index.ts`
6. `hooks/queries/useQuiz.ts` → re-export from queries `index.ts`
7. `hooks/mutations/useQuizMutations.ts` → re-export from mutations `index.ts`
8. `components/quiz/` — domain UI components
9. `app/(route-group)/quiz/page.tsx` — the route (Server Component by default)

## PWA

- `public/manifest.json` — app name/icons/`display: standalone`, linked via `metadata.manifest` in `app/layout.tsx` (Next's built-in metadata API, not a manual `<link>` tag). `theme-color` is set via the `viewport` export in the same file.
- `public/sw.js` is **generated**, not source — never edit it directly. Its source of truth is `sw-src/sw.template.js`, and `scripts/generate-sw.js` stamps a fresh `CACHE_VERSION` (from `$SOURCE_COMMIT` in CI, or a timestamp locally) into `public/sw.js` on every `predev`/`prebuild`. `public/sw.js` is gitignored. Edit the template, not the generated file, when changing service worker behavior.
- The service worker caches the app shell only (`/`, `/offline`, manifest, icons) — it does **not** cache API responses or implement offline-first data sync. This is "PWA shell dasar" per the v1.0 scope, not full offline support.
- On navigation requests, a failed fetch falls back to the cached `/offline` page (`app/offline/page.tsx`) instead of the browser's default network-error screen — relevant because outdoor GPS challenges (jogging) are explicitly called out in the PRD as having weak-signal risk.
- Registered client-side by `app/service-worker-registration.tsx` (a no-render client component mounted in the root layout).
- `public/icons/icon-192.png`, `icon-512.png`, `icon-maskable-512.png` are placeholder icons (generated, plain "EQ" wordmark) — replace with real branding when available.

## Domain scope (v1.0)

Out of scope unless explicitly requested (reserved for a later phase): push notifications, full offline-first support (PWA shell only), broadcast announcements, advanced data filtering/segmentation, file/photo upload for task evidence, student profiles/avatars, moderation of submitted evidence.

Other rules that affect the frontend: a submitted attempt is locked server-side (`is_locked`) and cannot be edited — there is no "edit answer" UI path after submit. Real student names must never appear in research/export-facing views — those use `anonymous_id`. GPS/geolocation challenges use the browser Geolocation API directly, no third-party mapping SDK.

## Next.js version awareness

This project pins `next@16`, newer than most training data. Before relying on remembered Next.js behavior, check `node_modules/next/dist/docs/` for the installed version's actual docs, and watch for deprecation warnings in dev/build output.
