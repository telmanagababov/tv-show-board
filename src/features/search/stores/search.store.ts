/**
 * Search store — state for the search feature.
 *
 * Responsibilities:
 *  - hold the current search query
 *  - debounce API calls so we don't fire on every keystroke
 *  - expose search results and loading / error state
 */

import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { searchShows } from '@/shared/api/shows-api'
import { toErrorKey } from '@/shared/utils/to-error-key'
import type { ShowSummary } from '@/shared/types/show'

export const useSearchStore = defineStore('search', () => {
  /** Milliseconds to wait after the last keystroke before hitting the API. */
  const DEBOUNCE_MS = 300

  /** The current search query */
  const query = ref('')
  /** Latest search results */
  const shows = ref<ShowSummary[]>([])
  /** True while a search is in flight. */
  const loading = ref(false)
  /** i18n key of the last error, or null when idle or the last search succeeded. */
  const error = ref<string | null>(null)

  /** search debounce timer */
  let debounceTimer: ReturnType<typeof setTimeout> | undefined = undefined

  /**
   * Watch the query and trigger a debounced search automatically.
   * An empty / whitespace query clears results immediately without an API call.
   */
  watch(query, (value) => {
    if (value.trim()) {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => performSearch(value), DEBOUNCE_MS)
    } else {
      clearSearch()
    }
  })

  /**
   * Performs a search for the given query.
   * Sets loading to true, clears error, and fetches results.
   * If the search fails, sets error and clears results.
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

  /**
   * Programmatic alternative to setting `query` directly.
   * Useful when the caller wants a single call-site rather than a v-model binding.
   */
  function setQuery(newQuery: string): void {
    query.value = newQuery
  }

  /** Clear the query, results, and any in-flight debounce. */
  function clearSearch(): void {
    clearTimeout(debounceTimer)
    debounceTimer = undefined
    query.value = ''
    shows.value = []
    error.value = null
  }

  return { query, shows, loading, error, setQuery, clearSearch, DEBOUNCE_MS }
})
