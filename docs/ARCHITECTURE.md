# Architecture

## Project Structure — Feature-Based (Domain-Driven)

The `src/` tree has three top-level buckets with distinct responsibilities:

| Bucket       | Purpose                                          | Reused?           |
| ------------ | ------------------------------------------------ | ----------------- |
| `shell/`     | App frame: header, footer, 404, layout chrome    | Used **once**     |
| `features/`  | Domain capabilities: dashboard, details, search  | Used by router    |
| `shared/`    | Reusable building blocks: components, services   | Used **many**     |

```
src/
├── App.vue                       # Root component — layout, router-view
├── main.ts                       # Entry point — create app, register plugins
├── router/
│   └── index.ts                  # Route definitions (lazy-loaded)
│
├── shell/                        # App frame — used once, not reusable
│   ├── AppHeader.vue             # Logo, nav, search bar, theme toggle
│   ├── AppFooter.vue
│   └── NotFoundView.vue          # 404 catch-all page
│
├── features/                     # Domain features (user-facing capabilities with routes)
│   ├── dashboard/                # / — genre dashboard (home page)
│   │   ├── components/
│   │   │   ├── GenreSection.vue  # Genre heading + horizontal show list
│   │   │   └── ShowList.vue      # Horizontal scrollable row of ShowCards
│   │   ├── stores/
│   │   │   └── dashboardStore.ts # Fetches shows, groups by genre, sorts by rating
│   │   └── DashboardView.vue     # Route-level page
│   │
│   ├── details/                  # /show/:id — individual show page
│   │   ├── components/
│   │   │   ├── ShowInfo.vue      # Title, summary, schedule, network
│   │   │   ├── CastList.vue      # Cast members grid
│   │   │   └── SimilarShows.vue  # AI-powered suggestions
│   │   └── DetailsView.vue       # Route-level page
│   │
│   └── search/                   # /search — search feature
│       ├── components/
│       │   └── SearchResults.vue # Results grid
│       ├── stores/
│       │   └── searchStore.ts    # Search query state, debounced API calls
│       └── SearchView.vue        # Route-level page
│
├── shared/                       # Cross-cutting reusable code (no domain logic)
│   ├── components/
│   │   ├── ThemeToggle.vue       # Dark/light mode switch (used by AppHeader)
│   │   ├── ShowCard.vue          # Reusable show card (used by dashboard + search)
│   │   ├── StarRating.vue        # Visual rating display
│   │   └── SkeletonLoader.vue    # Loading placeholder
│   ├── composables/
│   │   ├── useTheme.ts           # Theme state, localStorage persistence
│   │   ├── useDebounce.ts
│   │   └── useIntersectionObserver.ts
│   ├── stores/
│   │   └── themeStore.ts         # App-wide UI preference (dark/light)
│   ├── services/
│   │   └── tvmazeApi.ts          # All TVMaze HTTP calls
│   ├── types/
│   │   └── show.ts               # TVMaze API response interfaces
│   └── utils/
│       └── formatters.ts         # Date formatting, HTML stripping, etc.
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
- `tvmazeApi.ts` → `shared/services/` (used by multiple feature stores)

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

### Naming Conventions
| Item              | Convention          | Example                  |
| ----------------- | ------------------- | ------------------------ |
| Components        | PascalCase          | `ShowCard.vue`           |
| Composables       | camelCase, `use*`   | `useDebounce.ts`         |
| Stores            | camelCase, `*Store` | `dashboardStore.ts`      |
| Types/Interfaces  | PascalCase          | `Show`, `SearchResult`   |
| Views (pages)     | PascalCase, `*View` | `DashboardView.vue`      |
| Directories       | kebab-case          | `show-detail/`           |

### Component Design
- **Props down, events up** — parent passes data via props, child communicates via `emit`
- **Single Responsibility** — one component does one thing well
- **Composables for logic** — extract stateful logic out of components into `use*.ts` files
- **Thin templates** — use `computed` properties instead of inline expressions
