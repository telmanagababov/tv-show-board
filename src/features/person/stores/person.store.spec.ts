import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { usePersonStore } from './person.store'
import { ApiError } from '@/shared/api/tvmaze-errors'
import type { PersonDetails } from '@/shared/types/person'
import { getPersonDetails } from '@/shared/api/shows-api'

vi.mock('@/shared/api/shows-api', () => ({
  getPersonDetails: vi.fn<() => Promise<PersonDetails>>(),
}))

describe('usePersonStore', () => {
  const mockGetPersonDetails = vi.mocked(getPersonDetails)
  const personDetails: PersonDetails = {
    id: 99,
    name: 'Person Name',
    image: { medium: 'https://example.com/bc-med.jpg', original: 'https://example.com/bc.jpg' },
    birthday: '1956-03-07',
    deathday: null,
    gender: 'Male',
    country: 'United States of America',
    showCredits: [],
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    mockGetPersonDetails.mockReset()
  })

  describe('initial state', () => {
    it('starts with person = null', () => {
      expect(usePersonStore().person).toBeNull()
    })

    it('starts with loading = false', () => {
      expect(usePersonStore().loading).toBe(false)
    })

    it('starts with error = null', () => {
      expect(usePersonStore().error).toBeNull()
    })
  })

  describe('fetchPerson', () => {
    it('populates person after a successful fetch', async () => {
      mockGetPersonDetails.mockResolvedValue(personDetails)
      const store = usePersonStore()
      await store.fetchPersonDetails(99)

      expect(store.person).toStrictEqual(personDetails)
    })

    it('clears error at the start of a new fetch', async () => {
      mockGetPersonDetails.mockResolvedValue(personDetails)
      const store = usePersonStore()
      store.error = 'errors.generic'
      await store.fetchPersonDetails(99)

      expect(store.error).toBeNull()
    })

    it('sets loading = false after the fetch completes', async () => {
      mockGetPersonDetails.mockResolvedValue(personDetails)
      const store = usePersonStore()
      await store.fetchPersonDetails(99)

      expect(store.loading).toBe(false)
    })
  })

  describe('fetchPerson — error handling', () => {
    it('sets errors.notFound key for a 404', async () => {
      mockGetPersonDetails.mockRejectedValue(new ApiError('Not Found', 404, '/people/999'))
      const store = usePersonStore()
      await store.fetchPersonDetails(999)

      expect(store.error).toBe('errors.notFound')
    })

    it('sets errors.network key for a server error', async () => {
      mockGetPersonDetails.mockRejectedValue(new ApiError('Server Error', 500, '/people/1'))
      const store = usePersonStore()
      await store.fetchPersonDetails(1)

      expect(store.error).toBe('errors.network')
    })

    it('sets errors.generic for an unexpected error', async () => {
      mockGetPersonDetails.mockRejectedValue(new Error('Unexpected'))
      const store = usePersonStore()
      await store.fetchPersonDetails(1)

      expect(store.error).toBe('errors.generic')
    })

    it('sets person = null when the fetch fails', async () => {
      mockGetPersonDetails.mockRejectedValue(new ApiError('Not Found', 404, '/people/999'))
      const store = usePersonStore()
      await store.fetchPersonDetails(999)

      expect(store.person).toBeNull()
    })
  })

  describe('caching', () => {
    it('does not re-fetch a person that is already cached', async () => {
      mockGetPersonDetails.mockResolvedValue(personDetails)
      const store = usePersonStore()
      await store.fetchPersonDetails(99)
      await store.fetchPersonDetails(99)

      expect(mockGetPersonDetails).toHaveBeenCalledTimes(1)
    })

    it('returns the cached person immediately (loading stays false)', async () => {
      mockGetPersonDetails.mockResolvedValue(personDetails)
      const store = usePersonStore()
      await store.fetchPersonDetails(99)

      const loadingDuringCacheHit: boolean[] = []
      mockGetPersonDetails.mockImplementation(async () => {
        loadingDuringCacheHit.push(store.loading)
        return personDetails
      })
      await store.fetchPersonDetails(99)

      expect(loadingDuringCacheHit).toHaveLength(0)
      expect(store.loading).toBe(false)
    })

    it('fetches a different person separately', async () => {
      const other: PersonDetails = { ...personDetails, id: 42, name: 'Aaron Paul' }
      mockGetPersonDetails.mockResolvedValueOnce(personDetails).mockResolvedValueOnce(other)
      const store = usePersonStore()
      await store.fetchPersonDetails(99)
      await store.fetchPersonDetails(42)

      expect(mockGetPersonDetails).toHaveBeenCalledTimes(2)
      expect(store.person).toStrictEqual(other)
    })
  })

  describe('clearPerson', () => {
    it('resets person to null', async () => {
      mockGetPersonDetails.mockResolvedValue(personDetails)
      const store = usePersonStore()
      await store.fetchPersonDetails(99)
      store.clearPersonDetails()

      expect(store.person).toBeNull()
    })

    it('resets error to null', () => {
      const store = usePersonStore()
      store.error = 'errors.generic'
      store.clearPersonDetails()

      expect(store.error).toBeNull()
    })

    it('does not clear the cache — re-fetch after clear uses cache', async () => {
      mockGetPersonDetails.mockResolvedValue(personDetails)
      const store = usePersonStore()
      await store.fetchPersonDetails(99)
      store.clearPersonDetails()
      await store.fetchPersonDetails(99)

      expect(mockGetPersonDetails).toHaveBeenCalledTimes(1)
    })
  })
})
