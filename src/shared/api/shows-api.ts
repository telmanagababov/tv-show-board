/**
 * Public API surface for show data — the app-facing façade.
 */

import type { ShowDetails, ShowSummary } from '@/shared/types/show'
import type { PersonDetails } from '@/shared/types/person'

import {
  getShows as tvMazeGetShows,
  getShowWithDetails as tvMazeGetShowWithDetails,
  getPerson as tvMazeGetPerson,
  getPersonCastCredits as tvMazeGetPersonCastCredits,
  searchShows as tvMazeSearchShows,
} from './tvmaze-api'
import { mapPersonDetails, mapShowDetails, mapShowSummary } from './tvmaze-mappers'

/** One page (~250 entries) from the show index, mapped to domain types. */
export async function getShows(page = 0): Promise<ShowSummary[]> {
  const shows = await tvMazeGetShows(page)
  return shows.map(mapShowSummary)
}

/** A single show with cast and gallery images attached. */
export async function getShowDetails(id: number): Promise<ShowDetails> {
  const show = await tvMazeGetShowWithDetails(id)
  return mapShowDetails(show)
}

/**
 * Search by name. The relevance score is dropped intentionally — the API
 * returns results in score order already, and consumers haven't yet asked
 * for the raw value. Add it back as a separate field if a UI needs it.
 */
export async function searchShows(query: string): Promise<ShowSummary[]> {
  const results = await tvMazeSearchShows(query)
  return results.map((result) => mapShowSummary(result.show))
}

/**
 * A single person with their full show-credit list.
 */
export async function getPersonDetails(id: number): Promise<PersonDetails> {
  const [person, credits] = await Promise.all([tvMazeGetPerson(id), tvMazeGetPersonCastCredits(id)])
  return mapPersonDetails(person, credits)
}
