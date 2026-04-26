/**
 * Show detail store — state for the detail page.
 *
 * Responsibilities:
 *  - fetch a single show (with cast + gallery) by ID
 *  - cache results in memory so navigating back skips the network round-trip
 *  - track loading / error state
 */

import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getShowDetails } from '@/shared/api/shows-api'
import { toErrorKey } from '@/shared/utils/to-error-key'
import type { ShowDetails } from '@/shared/types/show'

export const useShowDetailsStore = defineStore('showDetails', () => {
  /** The currently displayed show, or null before the first fetch completes. */
  const details = ref<ShowDetails | null>(null)
  /** True while a show is in flight. */
  const loading = ref(false)
  /** i18n key of the last error, or null when the last fetch succeeded. */
  const error = ref<string | null>(null)
  /** In-memory cache: show ID → ShowDetails. */
  const cache = new Map<number, ShowDetails>()

  /**
   * Load the details for the show with the given ID.
   * If the details are already cached, the cached value is returned synchronously
   */
  async function fetchDetails(id: number): Promise<void> {
    if (loading.value) return
    if (cache.has(id)) return restoreDetails(id)

    loading.value = true
    error.value = null
    details.value = null

    try {
      const fetchedDetails = await getShowDetails(id)
      cache.set(id, fetchedDetails)
      details.value = fetchedDetails
    } catch (err) {
      error.value = toErrorKey(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Restore details from the cache.
   */
  function restoreDetails(id: number): void {
    const cachedDetails = cache.get(id)
    if (cachedDetails) {
      details.value = cachedDetails
      return
    }
  }

  /**
   * Clear the current details without touching the cache (e.g. on route leave).
   */
  function clearDetails(): void {
    details.value = null
    error.value = null
  }

  return { details, loading, error, fetchDetails, clearDetails }
})
