# Architecture

## Project Structure — Feature-Based (Domain-Driven)

The `src/` tree has three top-level buckets with distinct responsibilities:

| Bucket      | Purpose                                         | Reused?        |
| ----------- | ----------------------------------------------- | -------------- |
| `shell/`    | App frame: header, footer, 404, layout chrome   | Used **once**  |
| `features/` | Domain capabilities: dashboard, details, search | Used by router |
| `shared/`   | Reusable building blocks: components, services  | Used **many**  |

```
src/
├── App.vue                       # Root component — layout, router-view
├── main.ts                       # Entry point — create app, register plugins
├── routes.ts                     # Route definitions (lazy-loaded)
│
├── shell/                        # App frame — used once, not reusable
│
├── features/                     # Domain features (user-facing capabilities with routes)
│   ├── dashboard/                # / — genre dashboard (home page)
│   ├── details/                  # /show/:id — individual show page
│   └── search/                   # /search — search feature
│
├── shared/                       # Cross-cutting reusable code (no domain logic)
│   ├── api                       # External API clients + raw response types
│   ├── components
│   ├── composables
│   ├── i18n                      # vue-i18n setup + locale message files
│   ├── stores
│   ├── services                  # Local services (no network) — theme, storage, ...
│   ├── types                     # Domain types and generic utility types
│   └── utils
│
└── assets/
    └── main.css                  # Tailwind import, theme tokens, base styles
```

## Bucket Decision Guide

When deciding where a new file goes, ask in order:

1. **Is it the app's frame, used exactly once?** (header, footer, layout, 404)
   → `shell/`
2. **Does it represent a user-facing capability with its own route + domain logic?** (dashboard, search)
   → `features/<name>/`
3. **Is it a reusable building block used by 2+ places?** (ShowCard, useDebounce, tvmazeApi)
   → `shared/`

**Examples:**

- `AppHeader.vue` → `shell/` (one header, one place it's used)
- `SearchView.vue` → `features/search/` (route + domain)
- `ShowCard.vue` → `shared/components/` (used by dashboard, search, similar shows)
- `useTheme.ts` → `shared/composables/` (UI preference, used app-wide)
- `tvmaze-api.ts` → `shared/api/` (network client used by multiple feature stores)
- `themeService.ts` → `shared/services/` (local, non-network service)

## Design Principles

### Feature Encapsulation

Each feature folder is self-contained. If you delete `features/search/`, the rest of the app still compiles (minus the route). This makes features easy to reason about, refactor, and test in isolation.

### Shared vs Feature-Specific

A component/composable starts in its feature folder. If a second feature needs it, promote it to `shared/`. This prevents premature abstraction — only truly reusable code lives in `shared/`.

**Rule of thumb:** If it's used by 2+ features → `shared/`. If it's used by 1 feature → stays in that feature.

### Dependency Direction

```
features/* → shared/*    ✅  Features can import from shared
shared/*   → features/*  ❌  Shared must never import from features
features/a → features/b  ❌  Features should not import from each other
```

Cross-feature communication goes through Pinia stores or the router.

### API Boundary

`shared/api/` holds two layers, both prefixed by the provider name:

- **Vendor layer** — raw shapes and the HTTP client that produces them.
  Knows about URLs, status codes and the API's wire vocabulary.
  Currently: `tvmaze-types.ts`, `tvmaze-errors.ts`, `tvmaze-api.ts`.
- **Mapper layer** — pure `raw → domain` translation functions.
  Currently: `tvmaze-mappers.ts`.
- **Façade layer** — domain-named, vendor-agnostic public functions
  composed from the two above. Returns domain types only.
  Currently: `shows-api.ts`.

```
shows-api.ts ──► tvmaze-api.ts     ──► fetch
            └──► tvmaze-mappers.ts ──► shared/types/show.ts
```

To keep the boundary meaningful:

- **Outside `shared/api/`, only the façade modules (e.g. `shows-api.ts`)
  may be imported.** The `tvmaze-*` files are folder-private — treat them
  as implementation details of the façade.
- **Domain types in `shared/types/` MUST NOT import from `shared/api/`.**
  Duplicate the shape, don't reference it. The mapper layer is the only
  place where both worlds are visible.
- Features generally consume domain types and stores, not raw API types.
  Importing a `TvMaze*` type into a feature is a smell — it means the
  abstraction is leaking.
- A new provider (OMDb, an AI endpoint, a local cache) is added as another
  vendor + mapper pair. Composition happens inside the façade; consumers
  do not change.
- `shared/services/` is reserved for local services that don't make
  network calls (theme, storage, analytics, ...).

> The "façade-only" rule and the `shared/types/ ↛ shared/api/` rule are
> enforced by convention today. Mechanizing them via ESLint
> `no-restricted-imports` is tracked as **PLAN 4.8** (post-MVP). Until then,
> reviewers and `ARCHITECTURE.md` are the enforcement.

### Naming Conventions

| Item             | Convention          | Example                |
| ---------------- | ------------------- | ---------------------- |
| Components       | PascalCase          | `ShowCard.vue`         |
| Composables      | camelCase, `use*`   | `useDebounce.ts`       |
| Stores           | camelCase, `*Store` | `dashboardStore.ts`    |
| Types/Interfaces | PascalCase          | `Show`, `SearchResult` |
| Views (pages)    | PascalCase, `*View` | `DashboardView.vue`    |
| Directories      | kebab-case          | `show-detail/`         |

### Component Design

- **Props down, events up** — parent passes data via props, child communicates via `emit`
- **Single Responsibility** — one component does one thing well
- **Composables for logic** — extract stateful logic out of components into `use*.ts` files
- **Thin templates** — use `computed` properties instead of inline expressions

---

## Testing Conventions

Stack: **Vitest** + **`@vue/test-utils`**. Spec files live next to the file they test (`Foo.vue` → `Foo.spec.ts`).

### Component spec anatomy

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import { i18n } from '@/shared/i18n' // always provide the real i18n plugin
import MyComponent from './MyComponent.vue' // side-effect imports (i18n registration) run here

describe('MyComponent', () => {
  // 1. Locators object — maps semantic names to data-testid selectors.
  //    Defined once at the top of describe; never inline magic strings in assertions.
  const locators = {
    title: '[data-testid="my-title"]',
    subtitle: '[data-testid="my-subtitle"]',
  } as const

  // 2. Typed wrapper — VueWrapper<InstanceType<typeof Component>>
  let view: VueWrapper<InstanceType<typeof MyComponent>>

  // 3. beforeEach mounts fresh — avoids state leaking between tests
  beforeEach(() => {
    view = mount(MyComponent, {
      global: { plugins: [i18n] },
    })
  })

  it('...', () => {
    expect(view.find(locators.title).text()).toBeTruthy()
  })
})
```

### Rules

| Rule                                             | Rationale                                                                                                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`data-testid` attributes in templates**        | Decouple selectors from CSS classes and DOM structure. Tests survive style refactors.                                                                           |
| **`locators` object, typed `as const`**          | Single definition per spec — rename a testid in one place and the error points you to the test.                                                                 |
| **`VueWrapper<InstanceType<typeof Component>>`** | Full type for `view` — gives you typed access to component instance properties if needed.                                                                       |
| **`beforeEach` for mounting**                    | Guarantees a fresh wrapper for every test; no shared mutable state between `it` blocks.                                                                         |
| **Real `i18n` plugin, not a mock**               | Exercises actual message resolution. A missing key throws in dev (our `missing` handler) — the test fails loudly rather than silently returning the key string. |
| **`toBeTruthy()` for translated text**           | Asserts the element has content without hard-coding the English string. Survives copy changes without breaking tests.                                           |

### When to assert exact strings vs `toBeTruthy()`

- **`toBeTruthy()`** — use for i18n-translated user-visible text. Copy changes should not break unit tests.
- **Exact string** — use when the value is a domain constant (an ID, a URL, a computed value from test data) that must not drift.
