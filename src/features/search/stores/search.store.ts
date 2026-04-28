/**
 * Search store — state for the search feature.
 *
 * Responsibilities:
 *  - watch the URL's search query parameter and debounce API calls
 *  - expose search results and loading / error state
 */

import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { defineStore } from 'pinia'
import { searchShows, toErrorKey } from '@/shared/api'
import { SEARCH_QUERY_KEY } from '@/shared/constants'
import type { ShowSummary } from '@/shared/types'

export const useSearchStore = defineStore('search', () => {
  const DEBOUNCE_MS = 300

  const route = useRoute()
  const shows = ref<ShowSummary[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const query = computed(() => (route.query[SEARCH_QUERY_KEY] as string | undefined) ?? '')
  const hasQuery = computed(() => query.value.trim().length > 0)

  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  /**
   * Watch the URL's query param. Fires immediately on store creation so a
   * direct navigation to /search?q=batman triggers a fetch
   */
  watch(
    query,
    (value) => {
      clearTimeout(debounceTimer)
      if (value.trim()) {
        debounceTimer = setTimeout(() => performSearch(value.trim()), DEBOUNCE_MS)
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
  async function performSearch(value: string): Promise<void> {
    loading.value = true
    error.value = null
    try {
      shows.value = await searchShows(value)
    } catch (err) {
      error.value = toErrorKey(err)
      shows.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Re-runs the current query.
   */
  function retry(): void {
    if (hasQuery.value) {
      performSearch(query.value.trim())
    }
  }

  return { shows, loading, error, query, hasQuery, retry, DEBOUNCE_MS }
})
