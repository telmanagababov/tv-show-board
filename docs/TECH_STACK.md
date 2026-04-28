# Tech Stack

## Core

| Concern              | Choice                  | Rationale                                                                |
| -------------------- | ----------------------- | ------------------------------------------------------------------------ |
| Framework            | Vue 3 (Composition API) | Required by task; Composition API is the modern standard                 |
| Language             | TypeScript              | Type safety, better DX, catches bugs at compile time                     |
| State Management     | Pinia                   | Official Vue store — simple, modular, TypeScript-first                   |
| Routing              | Vue Router 4            | Official router for Vue 3; supports lazy loading, route guards           |
| Build Tool           | Vite                    | Default for Vue, near-instant HMR, zero-config                           |
| Scaffolding          | create-vue              | Official Vue scaffolder — sets up Vite, TS, Pinia, Router, Vitest in one |
| Internationalization | vue-i18n                | Official Vue i18n plugin; supports multiple locales and message formats  |

## Styling

| Concern        | Choice                      | Rationale                                                    |
| -------------- | --------------------------- | ------------------------------------------------------------ |
| CSS            | Tailwind CSS 4              | Utility-first, fast prototyping, great responsive primitives |
| Scoped CSS     | Vue scoped styles           | Component-level style isolation where Tailwind isn't enough  |
| Theming        | CSS custom properties       | Dark/light mode toggle via Tailwind `dark` class strategy    |
| Class Ordering | prettier-plugin-tailwindcss | Automatic Tailwind class sorting enforced at format time     |

## HTTP & API

| Concern | Choice                        | Rationale                                         |
| ------- | ----------------------------- | ------------------------------------------------- |
| HTTP    | Native `fetch` (thin wrapper) | Minimal dependencies, easy to understand and test |
| API     | TVMaze API (tvmaze.com/api)   | Required by task — free, no auth, REST            |

## Security

| Concern         | Choice    | Rationale                                                   |
| --------------- | --------- | ----------------------------------------------------------- |
| HTML Sanitizing | DOMPurify | Sanitizes TVMaze HTML descriptions to prevent XSS injection |

## Testing

| Concern   | Choice                  | Rationale                                          |
| --------- | ----------------------- | -------------------------------------------------- |
| Unit      | Vitest                  | Native Vite integration, fast, Jest-compatible API |
| Component | Vue Test Utils + Vitest | Official component testing library                 |
| DOM Env   | jsdom                   | Browser-like DOM environment for unit tests        |
| Coverage  | @vitest/coverage-v8     | V8-based coverage reports integrated with Vitest   |
| E2E       | Playwright              | Cross-browser, reliable, great DX                  |

## Code Quality

| Concern    | Choice   | Rationale                                              |
| ---------- | -------- | ------------------------------------------------------ |
| Linting    | oxlint   | Fast Rust-based linter; runs first for speed           |
| Linting    | ESLint   | Extended Vue + TS rules on top of oxlint               |
| Formatting | Prettier | Consistent code style; integrated with Tailwind plugin |

## Dev Tools

| Concern      | Choice                   | Rationale                                        |
| ------------ | ------------------------ | ------------------------------------------------ |
| Vue DevTools | vite-plugin-vue-devtools | In-browser Vue DevTools panel during development |
