/**
 * Search store — state for the search feature.
 *
 * Responsibilities:
 *  - watch the URL's search query parameter and debounce API calls
 *  - expose search results and loading / error state
 */

import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'
import { searchShows } from '@/shared/api/shows-api'
import { toErrorKey } from '@/shared/utils/to-error-key'
import { SEARCH_QUERY_KEY } from '@/shared/constants/route-names'
import type { ShowSummary } from '@/shared/types/show'

export const useSearchStore = defineStore('search', () => {
  const DEBOUNCE_MS = 300

  const route = useRoute()
  const shows = ref<ShowSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  /**
   * Watch the URL's query param. Fires immediately on store creation so a
   * direct navigation to /search?q=batman triggers a fetch
   */
  watch(
    () => (route.query[SEARCH_QUERY_KEY] as string | undefined) ?? '',
    (query) => {
      clearTimeout(debounceTimer)
      if (query.trim()) {
        debounceTimer = setTimeout(() => performSearch(query.trim()), DEBOUNCE_MS)
      } else {
        shows.value = []
        error.value = null
      }
    },
    { immediate: true },
  )

  /**
   * Performs a search for the given query and updates the shows state.
   */
  async function performSearch(query: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      shows.value = await searchShows(query)
    } catch (err) {
      error.value = toErrorKey(err)
      shows.value = []
    } finally {
      loading.value = false
    }
  }

  return { shows, loading, error, DEBOUNCE_MS }
})
