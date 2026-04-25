/**
 * Domain-agnostic TypeScript utility types.
 *
 * Helpers added here must not depend on any feature, service, or API type.
 * If a helper would introduce such a dependency, it belongs elsewhere.
 */

/**
 * A union of string literals that still accepts any other string at runtime,
 * without TypeScript collapsing the literals away.
 *
 * Use when an external source (an API, user input, ...) returns a known
 * vocabulary plus the possibility of unknown values you still want to accept.
 *
 * @example
 *   type ShowType = LiteralUnion<'Scripted' | 'Reality'>;
 *   // Autocomplete suggests 'Scripted' and 'Reality',
 *   // but `'Miniseries'` is also assignable.
 */
export type LiteralUnion<T extends string> = T | (string & {})
