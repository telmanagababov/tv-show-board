import { describe, expect, it } from 'vitest'

import { mapPersonDetails, mapShowDetails, mapShowSummary, mapStatus } from './tvmaze-mappers'
import type {
  TvMazeCastCredit,
  TvMazeCastMember,
  TvMazeCharacter,
  TvMazePerson,
  TvMazeShow,
  TvMazeShowImage,
  TvMazeShowWithEmbeds,
} from './tvmaze-types'

describe('tvmaze mappers', () => {
  describe('mapShowSummary', () => {
    it('maps the happy-path fields directly', () => {
      const api = makeTvMazeShow()

      expect(mapShowSummary(api)).toEqual({
        id: 1,
        name: 'Breaking Bad',
        genres: ['Drama', 'Crime'],
        rating: 9.3,
        summaryHtml: '<p>A high school chemistry teacher.</p>',
        summaryText: 'A high school chemistry teacher.',
        image: { medium: 'med.jpg', original: 'orig.jpg' },
        premieredYear: 2008,
        status: 'ended',
        language: 'English',
        network: 'AMC',
      })
    })

    it('preserves nullability for fields where "missing" is meaningful UX', () => {
      const api = makeTvMazeShow({
        rating: { average: null },
        image: null,
        summary: null,
        premiered: null,
        language: null,
        network: null,
        webChannel: null,
      })

      const show = mapShowSummary(api)

      expect(show.rating).toBeNull()
      expect(show.image).toBeNull()
      expect(show.summaryHtml).toBe('')
      expect(show.summaryText).toBe('')
      expect(show.premieredYear).toBeNull()
      expect(show.language).toBeNull()
      expect(show.network).toBeNull()
    })

    it('falls back to webChannel name when no broadcast network is set', () => {
      const api = makeTvMazeShow({
        network: null,
        webChannel: { id: 5, name: 'Netflix', country: null, officialSite: null },
      })

      expect(mapShowSummary(api).network).toBe('Netflix')
    })

    it('returns a fresh genres array (does not alias the API object)', () => {
      const api = makeTvMazeShow({ genres: ['Drama'] })
      const show = mapShowSummary(api)

      expect(show.genres).not.toBe(api.genres)
      expect(show.genres).toEqual(['Drama'])
    })

    it('drops fields that are not part of the domain shape', () => {
      const show = mapShowSummary(makeTvMazeShow())

      expect(show).not.toHaveProperty('_links')
      expect(show).not.toHaveProperty('weight')
      expect(show).not.toHaveProperty('externals')
      expect(show).not.toHaveProperty('updated')
    })
  })

  describe('mapShowDetails', () => {
    it('extends the summary with details + maps embedded cast and images', () => {
      const api: TvMazeShowWithEmbeds = {
        ...makeTvMazeShow({ officialSite: 'https://breakingbad.com' }),
        _embedded: {
          cast: [makeCastMember()],
          images: [makeShowImage()],
        },
      }

      const show = mapShowDetails(api)

      expect(show.id).toBe(1)
      expect(show.officialSite).toBe('https://breakingbad.com')
      expect(show.schedule).toEqual({ time: '22:00', days: ['Sunday'] })
      expect(show.cast).toEqual([
        {
          personId: 100,
          personName: 'Person Name',
          personImage: { medium: 'p-med.jpg', original: 'p-orig.jpg' },
          characterId: 200,
          characterName: 'Character Name',
          voice: false,
          self: false,
        },
      ])
      expect(show.images).toEqual([
        {
          id: 300,
          type: 'poster',
          main: true,
          original: { url: 'orig.jpg', width: 1000, height: 1500 },
          medium: { url: 'med.jpg', width: 200, height: 300 },
        },
      ])
    })

    it('uses empty arrays when no cast or images are embedded', () => {
      const api: TvMazeShowWithEmbeds = makeTvMazeShow()
      const show = mapShowDetails(api)

      expect(show.cast).toEqual([])
      expect(show.images).toEqual([])
    })

    it('returns a fresh days array (does not alias the API object)', () => {
      const api: TvMazeShowWithEmbeds = makeTvMazeShow()
      const show = mapShowDetails(api)

      expect(show.schedule.days).not.toBe(api.schedule.days)
    })

    describe('cast deduplication', () => {
      it('deduplicates cast members with the same person id', () => {
        const api: TvMazeShowWithEmbeds = {
          ...makeTvMazeShow(),
          _embedded: {
            cast: [makeCastMember(), makeCastMember({ character: makeCharacter({ id: 201, name: 'Second Role' }) })],
            images: [],
          },
        }

        const show = mapShowDetails(api)

        expect(show.cast).toHaveLength(1)
        expect(show.cast[0]!.personId).toBe(100)
      })

      it('joins character names when the same actor plays multiple roles', () => {
        const api: TvMazeShowWithEmbeds = {
          ...makeTvMazeShow(),
          _embedded: {
            cast: [
              makeCastMember({ character: makeCharacter({ id: 200, name: 'Role A' }) }),
              makeCastMember({ character: makeCharacter({ id: 201, name: 'Role B' }) }),
              makeCastMember({ character: makeCharacter({ id: 202, name: 'Role C' }) }),
            ],
            images: [],
          },
        }

        const show = mapShowDetails(api)

        expect(show.cast[0]!.characterName).toBe('Role A, Role B, Role C')
      })

      it('does not modify the source API objects', () => {
        const first = makeCastMember({ character: makeCharacter({ id: 200, name: 'Role A' }) })
        const second = makeCastMember({ character: makeCharacter({ id: 201, name: 'Role B' }) })
        const api: TvMazeShowWithEmbeds = {
          ...makeTvMazeShow(),
          _embedded: { cast: [first, second], images: [] },
        }

        const [castMember] = mapShowDetails(api).cast

        expect(castMember!.characterName).toBe('Role A, Role B')
      })

      it('keeps single-role actors unchanged', () => {
        const api: TvMazeShowWithEmbeds = {
          ...makeTvMazeShow(),
          _embedded: {
            cast: [makeCastMember()],
            images: [],
          },
        }

        const show = mapShowDetails(api)

        expect(show.cast[0]!.characterName).toBe('Character Name')
      })
    })
  })

  describe('mapPersonDetails', () => {
    it('maps core person fields', () => {
      const person = makeTvMazePerson()
      const result = mapPersonDetails(person, [])

      expect(result.id).toBe(99)
      expect(result.name).toBe('Person Name')
      expect(result.birthday).toBe('1956-03-07')
      expect(result.deathday).toBeNull()
      expect(result.gender).toBe('Male')
      expect(result.country).toBe('United States of America')
      expect(result.image).toEqual({ medium: 'p-med.jpg', original: 'p-orig.jpg' })
    })

    it('maps show credits from embedded shows', () => {
      const result = mapPersonDetails(makeTvMazePerson(), [makeCastCredit()])

      expect(result.showCredits).toHaveLength(1)
      expect(result.showCredits[0]!.id).toBe(1)
      expect(result.showCredits[0]!.name).toBe('Breaking Bad')
    })

    it('filters out credits whose embedded show is missing', () => {
      const creditWithoutShow: TvMazeCastCredit = {
        self: false,
        voice: false,
        _links: { show: { href: '' }, character: { href: '' } },
      }
      const result = mapPersonDetails(makeTvMazePerson(), [creditWithoutShow, makeCastCredit()])

      expect(result.showCredits).toHaveLength(1)
    })

    it('returns null image when the person has no photo', () => {
      const result = mapPersonDetails(makeTvMazePerson({ image: null }), [])

      expect(result.image).toBeNull()
    })

    it('returns null country when the person has no country', () => {
      const result = mapPersonDetails(makeTvMazePerson({ country: null }), [])

      expect(result.country).toBeNull()
    })
  })

  describe('mapStatus', () => {
    it.each([
      ['Running', 'running'],
      ['Ended', 'ended'],
      ['To Be Determined', 'upcoming'],
      ['In Development', 'upcoming'],
    ] as const)('maps "%s" to "%s"', (input, expected) => {
      expect(mapStatus(input)).toBe(expected)
    })
  })
})

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeTvMazeShow(overrides: Partial<TvMazeShow> = {}): TvMazeShow {
  return {
    id: 1,
    url: 'https://www.tvmaze.com/shows/1/breaking-bad',
    name: 'Breaking Bad',
    type: 'Scripted',
    language: 'English',
    genres: ['Drama', 'Crime'],
    status: 'Ended',
    runtime: 60,
    averageRuntime: 60,
    premiered: '2008-01-20',
    ended: '2013-09-29',
    officialSite: null,
    schedule: { time: '22:00', days: ['Sunday'] },
    rating: { average: 9.3 },
    weight: 100,
    network: { id: 20, name: 'AMC', country: null, officialSite: null },
    webChannel: null,
    dvdCountry: null,
    externals: { tvrage: null, thetvdb: null, imdb: null },
    image: { medium: 'med.jpg', original: 'orig.jpg' },
    summary: '<p>A high school chemistry teacher.</p>',
    updated: 0,
    _links: { self: { href: 'x' } },
    ...overrides,
  }
}

function makeCharacter(overrides: Partial<TvMazeCharacter> = {}): TvMazeCharacter {
  return {
    id: 200,
    url: '',
    name: 'Character Name',
    image: null,
    _links: { self: { href: '' } },
    ...overrides,
  }
}

function makeCastMember(overrides: Partial<TvMazeCastMember> = {}): TvMazeCastMember {
  return {
    person: {
      id: 100,
      url: '',
      name: 'Person Name',
      country: null,
      birthday: null,
      deathday: null,
      gender: null,
      image: { medium: 'p-med.jpg', original: 'p-orig.jpg' },
      updated: 0,
      _links: { self: { href: '' } },
    },
    character: {
      id: 200,
      url: '',
      name: 'Character Name',
      image: null,
      _links: { self: { href: '' } },
    },
    self: false,
    voice: false,
    ...overrides,
  }
}

function makeShowImage(): TvMazeShowImage {
  return {
    id: 300,
    type: 'poster',
    main: true,
    resolutions: {
      original: { url: 'orig.jpg', width: 1000, height: 1500 },
      medium: { url: 'med.jpg', width: 200, height: 300 },
    },
  }
}

function makeTvMazePerson(overrides: Partial<TvMazePerson> = {}): TvMazePerson {
  return {
    id: 99,
    url: 'https://www.tvmaze.com/people/99/person-name',
    name: 'Person Name',
    country: { name: 'United States of America', code: 'US', timezone: 'America/New_York' },
    birthday: '1956-03-07',
    deathday: null,
    gender: 'Male',
    image: { medium: 'p-med.jpg', original: 'p-orig.jpg' },
    updated: 0,
    _links: { self: { href: '' } },
    ...overrides,
  }
}

function makeCastCredit(): TvMazeCastCredit {
  return {
    self: false,
    voice: false,
    _links: { show: { href: '' }, character: { href: '' } },
    _embedded: { show: makeTvMazeShow() },
  }
}
