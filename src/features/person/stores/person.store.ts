/**
 * Person detail store — state for the person page.
 *
 * Responsibilities:
 *  - fetch a single person (with show credits) by ID
 *  - cache results in memory so navigating back skips the network round-trip
 *  - track loading / error state
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getPersonDetails, toErrorKey } from '@/shared/api'
import type { PersonDetails } from '@/shared/types'

export const usePersonStore = defineStore('person', () => {
  const person = ref<PersonDetails | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const cache = new Map<number, PersonDetails>()

  /**
   * Load the details for the person with the given ID.
   * If the details are already cached, the cached value is returned synchronously.
   */
  async function fetchPersonDetails(id: number): Promise<void> {
    if (loading.value) return
    if (cache.has(id)) return restorePersonDetails(id)

    loading.value = true
    error.value = null
    person.value = null

    try {
      const fetched = await getPersonDetails(id)
      cache.set(id, fetched)
      person.value = fetched
    } catch (err) {
      error.value = toErrorKey(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Restore person details from the cache.
   */
  function restorePersonDetails(id: number): void {
    const cached = cache.get(id)
    if (cached) {
      person.value = cached
    }
  }

  /**
   * Clear the current person details without touching the cache (e.g. on route leave).
   */
  function clearPersonDetails(): void {
    person.value = null
    error.value = null
  }

  return { person, loading, error, fetchPersonDetails, clearPersonDetails }
})
