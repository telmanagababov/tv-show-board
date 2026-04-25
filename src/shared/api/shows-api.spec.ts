import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./tvmaze-api')

import { getShowDetails, getShows, searchShows } from './shows-api'
import * as tvmazeApi from './tvmaze-api'
import type { TvMazeSearchResult, TvMazeShow, TvMazeShowWithEmbeds } from './tvmaze-types'

describe('shows-api (façade)', () => {
  beforeEach(() => {
    vi.mocked(tvmazeApi.getShows).mockReset()
    vi.mocked(tvmazeApi.getShowWithDetails).mockReset()
    vi.mocked(tvmazeApi.searchShows).mockReset()
  })

  describe('getShows', () => {
    it('forwards the page and maps each entry to a ShowSummary', async () => {
      vi.mocked(tvmazeApi.getShows).mockResolvedValueOnce([
        makeRawShow({ id: 1, name: 'A' }),
        makeRawShow({ id: 2, name: 'B' }),
      ])

      const result = await getShows(2)

      expect(tvmazeApi.getShows).toHaveBeenCalledWith(2)
      expect(result.map((s) => s.id)).toEqual([1, 2])
      // Boundary check — raw API noise must not leak through.
      expect(result[0]).not.toHaveProperty('_links')
      expect(result[0]).not.toHaveProperty('weight')
    })

    it('defaults to page 0', async () => {
      vi.mocked(tvmazeApi.getShows).mockResolvedValueOnce([])

      await getShows()

      expect(tvmazeApi.getShows).toHaveBeenCalledWith(0)
    })
  })

  describe('getShowDetails', () => {
    it('forwards the id and maps to a ShowDetails', async () => {
      const raw: TvMazeShowWithEmbeds = {
        ...makeRawShow({ id: 42 }),
        _embedded: { cast: [], images: [] },
      }
      vi.mocked(tvmazeApi.getShowWithDetails).mockResolvedValueOnce(raw)

      const result = await getShowDetails(42)

      expect(tvmazeApi.getShowWithDetails).toHaveBeenCalledWith(42)
      expect(result.id).toBe(42)
      expect(result.cast).toEqual([])
      expect(result.images).toEqual([])
    })
  })

  describe('searchShows', () => {
    it('unwraps the score envelope and returns a flat ShowSummary[]', async () => {
      const envelopes: TvMazeSearchResult[] = [
        { score: 0.9, show: makeRawShow({ id: 1, name: 'A' }) },
        { score: 0.5, show: makeRawShow({ id: 2, name: 'B' }) },
      ]
      vi.mocked(tvmazeApi.searchShows).mockResolvedValueOnce(envelopes)

      const result = await searchShows('a')

      expect(tvmazeApi.searchShows).toHaveBeenCalledWith('a')
      expect(result.map((s) => s.id)).toEqual([1, 2])
      // Score is intentionally dropped at the boundary.
      expect(result[0]).not.toHaveProperty('score')
    })
  })
})

function makeRawShow(overrides: Partial<TvMazeShow> = {}): TvMazeShow {
  return {
    id: 1,
    url: '',
    name: 'Show',
    type: 'Scripted',
    language: 'English',
    genres: [],
    status: 'Ended',
    runtime: null,
    averageRuntime: null,
    premiered: null,
    ended: null,
    officialSite: null,
    schedule: { time: '', days: [] },
    rating: { average: null },
    weight: 0,
    network: null,
    webChannel: null,
    dvdCountry: null,
    externals: { tvrage: null, thetvdb: null, imdb: null },
    image: null,
    summary: null,
    updated: 0,
    _links: { self: { href: '' } },
    ...overrides,
  }
}
