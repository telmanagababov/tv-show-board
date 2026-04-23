# Tech Stack

## Core

| Concern          | Choice                      | Rationale                                                                 |
| ---------------- | --------------------------- | ------------------------------------------------------------------------- |
| Framework        | Vue 3 (Composition API)     | Required by task; Composition API is the modern standard                  |
| Language         | TypeScript                  | Type safety, better DX, catches bugs at compile time                      |
| State Management | Pinia                       | Official Vue store — simple, modular, TypeScript-first                    |
| Routing          | Vue Router 4                | Official router for Vue 3; supports lazy loading, route guards            |
| Build Tool       | Vite                        | Default for Vue, near-instant HMR, zero-config                           |
| Scaffolding      | create-vue                  | Official Vue scaffolder — sets up Vite, TS, Pinia, Router, Vitest in one |

## Styling

| Concern    | Choice               | Rationale                                                    |
| ---------- | -------------------- | ------------------------------------------------------------ |
| CSS        | Tailwind CSS 4       | Utility-first, fast prototyping, great responsive primitives |
| Scoped CSS | Vue scoped styles    | Component-level style isolation where Tailwind isn't enough  |
| Theming    | CSS custom properties | Dark/light mode toggle via class strategy                    |

## HTTP & API

| Concern  | Choice                         | Rationale                                            |
| -------- | ------------------------------ | ---------------------------------------------------- |
| HTTP     | Native `fetch` (thin wrapper)  | Minimal dependencies, easy to understand and test    |
| API      | TVMaze API (tvmaze.com/api)    | Required by task — free, no auth, REST              |

## Testing

| Concern   | Choice     | Rationale                                          |
| --------- | ---------- | -------------------------------------------------- |
| Unit      | Vitest     | Native Vite integration, fast, Jest-compatible API |
| Component | Vue Test Utils + Vitest | Official component testing library      |
| E2E       | Playwright | Cross-browser, reliable, great DX                  |

## Code Quality

| Concern    | Choice            | Rationale                          |
| ---------- | ----------------- | ---------------------------------- |
| Linting    | ESLint            | Standard Vue + TS rules            |
| Formatting | Prettier          | Consistent code style              |

## Bonus Integrations

| Feature         | Approach                                  |
| --------------- | ----------------------------------------- |
| Theme Toggle    | Dark/light mode with Tailwind dark class  |
| AI Integration  | OpenAI API — "Similar shows" suggestions  |
