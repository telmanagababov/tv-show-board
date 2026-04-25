/**
 * TVMaze API service layer.
 *
 * The single place in the app that talks HTTP to https://api.tvmaze.com.
 * Returns raw `TvMaze*` shapes from `./tvmaze.types`.
 */

import { ApiError } from './tvmaze-errors'
import type { TvMazeShow, TvMazeShowWithEmbeds, TvMazeSearchResult } from './tvmaze-types'

const BASE_URL = 'https://api.tvmaze.com'

/**
 * Fetch one page of shows from the TVMaze index.
 * Each page returns ~250 shows. `page` is zero-indexed.
 */
export function getShows(page = 0): Promise<TvMazeShow[]> {
  return tvmazeRequest<TvMazeShow[]>('/shows', { page })
}

/**
 * Fetch a single show with cast and episodes embedded in one round-trip.
 * Used by the show detail page.
 */
export function getShowWithDetails(id: number): Promise<TvMazeShowWithEmbeds> {
  return tvmazeRequest<TvMazeShowWithEmbeds>(`/shows/${id}`, {
    'embed[]': ['cast', 'episodes'],
  })
}

/**
 * Search shows by name. Returns up to 10 results, each wrapping a show
 * together with the search engine's relevance score.
 */
export function searchShows(query: string): Promise<TvMazeSearchResult[]> {
  return tvmazeRequest<TvMazeSearchResult[]>('/search/shows', { q: query })
}

/**
 * Make a request to the TVMaze API.
 * @param path - The path to the API endpoint.
 * @param searchParams - The search parameters to add to the URL.
 * @returns The response from the API.
 */
async function tvmazeRequest<T>(
  path: string,
  searchParams?: Record<string, string | number | string[]>,
): Promise<T> {
  const url = new URL(path, BASE_URL)
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        value.forEach((item) => url.searchParams.append(key, item))
      } else {
        url.searchParams.set(key, String(value))
      }
    }
  }
  const response = await fetch(url)
  if (!response.ok) {
    throw new ApiError(
      `TVMaze request failed: ${response.status} ${response.statusText}`,
      response.status,
      url.toString(),
    )
  }
  return (await response.json()) as T
}
