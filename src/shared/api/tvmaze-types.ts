/**
 * Raw TVMaze API response types.
 *
 * These mirror the JSON returned by https://api.tvmaze.com as closely as
 * possible. They are the contract between the API service layer and consumers.
 */

import type { LiteralUnion } from '@/shared/types/utility'

// ---------------------------------------------------------------------------
// Building blocks
// ---------------------------------------------------------------------------

export interface TvMazeImage {
  medium: string
  original: string
}

export interface TvMazeRating {
  /** 0–10, one decimal. `null` for shows with no rating yet. */
  average: number | null
}

export interface TvMazeCountry {
  name: string
  code: string
  timezone: string
}

export interface TvMazeNetwork {
  id: number
  name: string
  country: TvMazeCountry | null
  officialSite: string | null
}

/**
 * Streaming platforms (Netflix, HBO Max, ...). Same shape as TvMazeNetwork
 * in practice, but kept as a distinct type so call-sites stay self-documenting.
 */
export type TvMazeWebChannel = TvMazeNetwork

export interface TvMazeSchedule {
  /** "HH:mm" or "" when the show has no fixed time (e.g. streaming drops). */
  time: string
  /** Empty array for shows that release all episodes at once. */
  days: TvMazeScheduleDay[]
}

export interface TvMazeExternals {
  tvrage: number | null
  thetvdb: number | null
  imdb: string | null
}

// ---------------------------------------------------------------------------
// Closed-set string unions (validated against /shows?page=0 + docs)
// ---------------------------------------------------------------------------

/**
 * Lifecycle status reported by TVMaze.
 *
 * Sampled values: "Ended", "Running", "To Be Determined".
 * Docs additionally list "In Development". Closed set, no escape hatch.
 *
 * This is the API vocabulary. The domain may use a different set
 * (e.g. collapsing "To Be Determined" + "In Development" into "Upcoming").
 */
export type TvMazeShowStatus = 'Running' | 'Ended' | 'To Be Determined' | 'In Development'

/**
 * Show classification. Open via `LiteralUnion` because TVMaze occasionally
 * adds new entries; the literals keep autocomplete useful for the common cases.
 */
export type TvMazeShowType = LiteralUnion<
  | 'Scripted'
  | 'Reality'
  | 'Documentary'
  | 'Animation'
  | 'Talk Show'
  | 'Game Show'
  | 'Sports'
  | 'Variety'
  | 'Panel Show'
  | 'Award Show'
>

export type TvMazeScheduleDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday'

// ---------------------------------------------------------------------------
// Show
// ---------------------------------------------------------------------------

/**
 * Hyperlinks TVMaze attaches to most resources. `self` is always present;
 * the previous/next-episode links only appear when applicable.
 */
export interface TvMazeLinks {
  self: { href: string }
  previousepisode?: { href: string; name?: string }
  nextepisode?: { href: string; name?: string }
}

/**
 * Genres are an open-ended `string[]`. There is no `/genres` endpoint and no
 * server-side filter. Our curated display list lives in `shared/config/`
 * (added in a later step); shows whose genres are not in that list still
 * exist, they just don't appear on the dashboard.
 */
export interface TvMazeShow {
  id: number
  url: string
  name: string
  type: TvMazeShowType
  language: string | null
  genres: string[]
  status: TvMazeShowStatus
  /** Per-episode runtime in minutes. */
  runtime: number | null
  /** Average runtime across all aired episodes. */
  averageRuntime: number | null
  /** ISO date "YYYY-MM-DD". */
  premiered: string | null
  /** ISO date "YYYY-MM-DD"; null while the show is still running. */
  ended: string | null
  officialSite: string | null
  schedule: TvMazeSchedule
  rating: TvMazeRating
  /** TVMaze's internal popularity score (0–100). Useful as a tiebreaker. */
  weight: number
  /** Traditional TV network. Mutually exclusive in practice with webChannel. */
  network: TvMazeNetwork | null
  webChannel: TvMazeWebChannel | null
  dvdCountry: TvMazeCountry | null
  externals: TvMazeExternals
  image: TvMazeImage | null
  /** HTML string ("<p>...</p>"). Sanitize / strip before rendering. */
  summary: string | null
  /** Unix timestamp (seconds) of the last server-side update. */
  updated: number
  _links: TvMazeLinks
}

// ---------------------------------------------------------------------------
// Cast
// ---------------------------------------------------------------------------

export interface TvMazePerson {
  id: number
  url: string
  name: string
  country: TvMazeCountry | null
  /** ISO "YYYY-MM-DD". */
  birthday: string | null
  /** ISO "YYYY-MM-DD". */
  deathday: string | null
  gender: string | null
  image: TvMazeImage | null
  updated: number
  _links: { self: { href: string } }
}

export interface TvMazeCharacter {
  id: number
  url: string
  name: string
  image: TvMazeImage | null
  _links: { self: { href: string } }
}

export interface TvMazeCastMember {
  person: TvMazePerson
  character: TvMazeCharacter
  /** True when the person plays themselves (e.g. talk show host). */
  self: boolean
  /** True for voice-only roles (animation, narration). */
  voice: boolean
}

// ---------------------------------------------------------------------------
// Person cast credits (/people/:id/castcredits?embed=show)
// ---------------------------------------------------------------------------

/**
 * One credit entry from `/people/:id/castcredits`.
 * When fetched with `?embed=show`, `_embedded.show` is populated.
 */
export interface TvMazeCastCredit {
  self: boolean
  voice: boolean
  _links: {
    show: { href: string }
    character: { href: string }
  }
  _embedded?: {
    show: TvMazeShow
  }
}

// ---------------------------------------------------------------------------
// Embedded resources (?embed[]=cast&embed[]=images)
// ---------------------------------------------------------------------------

/**
 * `image_type` values seen so far: "poster", "background", "banner", "typography".
 * Left as `string` to stay forward-compatible.
 */
export interface TvMazeShowImage {
  id: number
  type: string
  main: boolean
  resolutions: {
    original: { url: string; width: number; height: number }
    medium?: { url: string; width: number; height: number }
  }
}

export interface TvMazeEmbeds {
  cast?: TvMazeCastMember[]
  images?: TvMazeShowImage[]
}

export interface TvMazeShowWithEmbeds extends TvMazeShow {
  _embedded?: TvMazeEmbeds
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

/**
 * Envelope returned by `/search/shows?q=...`. Note the wrapping object —
 * the show is nested under `.show`, not at the top level.
 */
export interface TvMazeSearchResult {
  /** Relevance score in [0, 1]. Higher = better match. */
  score: number
  show: TvMazeShow
}
