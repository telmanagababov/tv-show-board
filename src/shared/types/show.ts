/**
 * Domain types for the show concept.
 *
 * Shaped for the app's consumers (stores, components, views), not for any
 * external provider. The mapper from raw API shapes to these types lives in
 * `shared/api/tvmaze-mappers.ts`.
 *
 * Architecture rule: this file MUST NOT import from `shared/api/`.
 */

/**
 * Lifecycle status, collapsed from the wider vocabulary external APIs use.
 *
 * - `running`  — currently airing
 * - `ended`    — concluded, no future episodes
 * - `upcoming` — announced but not yet aired
 */
export type ShowStatus = 'running' | 'ended' | 'upcoming'

/** Two pre-sized variants of one artwork. `null` parents mean "no artwork". */
export interface ShowImage {
  medium: string
  original: string
}

/** Lightweight show shape for cards, lists, search results and dashboard rows. */
export interface ShowSummary {
  id: number
  name: string
  /** Empty array (never `null`) when the show has no genres. */
  genres: string[]
  /** 0–10. `null` means "no rating yet" — render as "—", not as 0. */
  rating: number | null
  /** Raw HTML. Sanitize with DOMPurify before `v-html`. */
  summaryHtml: string
  /** Plain-text fallback for cards, meta tags, truncation. */
  summaryText: string
  /** `null` when the show has no artwork — call site decides the fallback. */
  image: ShowImage | null
  premieredYear: number | null
  status: ShowStatus
  language: string | null
  /** Network or web channel name, whichever the show uses. */
  network: string | null
}

/** One actor's portrayal of one character. Flattened from the API's nested envelope. */
export interface CastMember {
  personId: number
  personName: string
  personImage: ShowImage | null
  characterId: number
  characterName: string
  /** Voice-only role (animation, narration). */
  voice: boolean
  /** Person plays themselves (talk show host, contestant). */
  self: boolean
}

/** Full image asset attached to a show — poster, background, banner, ... */
export interface ShowGalleryImage {
  id: number
  /** Open set: 'poster' | 'background' | 'banner' | 'typography' | ... */
  type: string
  /** True for the show's primary image of this `type`. */
  main: boolean
  original: { url: string; width: number; height: number }
  medium: { url: string; width: number; height: number } | null
}

/**
 * Recurring broadcast slot. Empty `time` and `days` mean "all episodes drop
 * at once" (typical for streaming releases).
 */
export interface ShowSchedule {
  /** "HH:mm" or "" when no fixed time. */
  time: string
  /** "Monday" .. "Sunday". Empty array for all-at-once releases. */
  days: string[]
}

/**
 * Full show shape for the detail page. Strict superset of `ShowSummary` so
 * any consumer that can render a card can also render a detail page.
 */
export interface ShowDetails extends ShowSummary {
  officialSite: string | null
  schedule: ShowSchedule
  cast: CastMember[]
  images: ShowGalleryImage[]
}
