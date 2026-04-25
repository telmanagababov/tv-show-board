/**
 * Public API surface for show data — the app-facing façade.
 *
 * This module is the only one outside `shared/api/` that the rest of the app
 * should import for show data. It composes the raw TVMaze HTTP client with
 * the domain mappers, and returns domain types — never `TvMaze*` shapes.
 *
 * If a second source ever appears (a different provider, an AI endpoint,
 * a local cache), it is composed here.
 */

import {
  getShows as getRawShows,
  getShowWithDetails as getRawShowWithDetails,
  searchShows as searchRawShows,
} from './tvmaze-api'
import { mapShowDetails, mapShowSummary } from './tvmaze-mappers'

import type { ShowDetails, ShowSummary } from '@/shared/types/show'

/** One page (~250 entries) from the show index, mapped to domain types. */
export async function getShows(page = 0): Promise<ShowSummary[]> {
  const shows = await getRawShows(page)
  return shows.map(mapShowSummary)
}

/** A single show with cast and gallery images attached. */
export async function getShowDetails(id: number): Promise<ShowDetails> {
  const show = await getRawShowWithDetails(id)
  return mapShowDetails(show)
}

/**
 * Search by name. The relevance score is dropped intentionally — the API
 * returns results in score order already, and consumers haven't yet asked
 * for the raw value. Add it back as a separate field if a UI needs it.
 */
export async function searchShows(query: string): Promise<ShowSummary[]> {
  const results = await searchRawShows(query)
  return results.map((result) => mapShowSummary(result.show))
}
