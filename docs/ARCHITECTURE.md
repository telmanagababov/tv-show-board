# Architecture

## Project Structure — Feature-Based (Domain-Driven)

Each feature owns its components, stores, composables, and types. Shared/cross-cutting code lives under `shared/`.

```
src/
├── app/                          # App shell
│   ├── App.vue                   # Root component — layout, router-view
│   ├── main.ts                   # Entry point — create app, register plugins
│   └── router/
│       └── index.ts              # Route definitions (lazy-loaded)
│
├── features/
│   ├── dashboard/                # Genre dashboard (home page)
│   │   ├── components/
│   │   │   ├── GenreSection.vue  # Genre heading + horizontal show list
│   │   │   └── ShowList.vue      # Horizontal scrollable row of ShowCards
│   │   ├── stores/
│   │   │   └── dashboardStore.ts # Fetches shows, groups by genre, sorts by rating
│   │   └── DashboardView.vue     # Route-level page
│   │
│   ├── show-detail/              # Individual show page
│   │   ├── components/
│   │   │   ├── ShowInfo.vue      # Title, summary, schedule, network
│   │   │   ├── CastList.vue      # Cast members grid
│   │   │   └── SimilarShows.vue  # AI-powered suggestions
│   │   └── ShowDetailView.vue    # Route-level page
│   │
│   ├── search/                   # Search feature
│   │   ├── components/
│   │   │   └── SearchResults.vue # Results grid
│   │   ├── stores/
│   │   │   └── searchStore.ts    # Search query state, debounced API calls
│   │   └── SearchView.vue        # Route-level page
│   │
│   └── theme/                    # Dark/light mode toggle
│       ├── components/
│       │   └── ThemeToggle.vue
│       ├── composables/
│       │   └── useTheme.ts       # Theme state, localStorage persistence
│       └── stores/
│           └── themeStore.ts
│
├── shared/                       # Cross-cutting, reusable code
│   ├── components/
│   │   ├── AppHeader.vue         # Logo, nav, search bar, theme toggle
│   │   ├── AppFooter.vue
│   │   ├── ShowCard.vue          # Reusable show card (used by dashboard + search)
│   │   ├── StarRating.vue        # Visual rating display
│   │   └── SkeletonLoader.vue    # Loading placeholder
│   ├── composables/
│   │   ├── useDebounce.ts
│   │   └── useIntersectionObserver.ts
│   ├── services/
│   │   └── tvmazeApi.ts          # All TVMaze HTTP calls
│   ├── types/
│   │   └── show.ts               # TVMaze API response interfaces
│   └── utils/
│       └── formatters.ts         # Date formatting, HTML stripping, etc.
│
├── assets/                       # Static assets
│   └── styles/
│       └── main.css              # Tailwind directives, global resets
│
└── env.d.ts                      # Vite environment type declarations
```

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
