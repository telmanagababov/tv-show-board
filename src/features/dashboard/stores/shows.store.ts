/**
 * Shows store — central state for the dashboard feature.
 *
 * Responsibilities:
 *  - fetch shows in parallel buckets of pages (load-more pattern)
 *  - expose a computed genre map: genre → shows sorted by rating (desc)
 *  - track loading / error / pagination state
 */

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { getShows, toErrorKey, ApiError } from '@/shared/api'
import type { ShowSummary } from '@/shared/types'

export const useShowsStore = defineStore('shows', () => {
  /** How many pages to fetch in one load-more batch. */
  const PAGES_PER_BATCH = 5

  /** Flat list of every show loaded so far (across all fetched buckets). */
  const shows = ref<ShowSummary[]>([])
  /** True while a bucket fetch is in flight. */
  const loading = ref(false)
  /** i18n key of the last error, or null when the last fetch succeeded. */
  const error = ref<string | null>(null)
  /** First page of the next batch to fetch. */
  const nextPage = ref(0)
  /** False once a batch returns fewer pages than requested (end of index). */
  const hasMore = ref(true)

  /**
   * Shows grouped by genre, each group sorted by rating descending.
   */
  const showsByGenre = computed<Map<string, ShowSummary[]>>(() => {
    const showsMap = new Map<string, ShowSummary[]>()
    shows.value.forEach((show) => {
      show.genres.forEach((genre) => {
        const showsByGenre = showsMap.get(genre) ?? []
        showsByGenre.push(show)
        showsMap.set(genre, showsByGenre)
      })
    })
    showsMap.forEach((showsByGenre) => {
      showsByGenre.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    })
    return showsMap
  })

  /** Genre names in alphabetical order */
  const genres = computed<string[]>(() => Array.from(showsByGenre.value.keys()).toSorted())

  /**
   * Fetches the first batch only when the store is empty.
   */
  async function fetchShows(): Promise<void> {
    if (shows.value.length > 0) return
    await fetchMoreShows()
  }

  /**
   * Fetches the next batch of shows.
   */
  async function fetchMoreShows(): Promise<void> {
    if (loading.value || !hasMore.value) return

    loading.value = true
    error.value = null

    try {
      const { fulfilled, rejected, failed } = await fetchShowPages(nextPage.value, PAGES_PER_BATCH)
      if (fulfilled.length > 0) {
        shows.value = [...shows.value, ...fulfilled.flatMap(({ value }) => value)]
        nextPage.value += PAGES_PER_BATCH
      } else if (failed.length > 0) {
        error.value = toErrorKey(failed[0]!.reason)
      }
      hasMore.value = !rejected.some(({ reason }) => isAllPagesLoaded(reason))
    } catch (err) {
      error.value = toErrorKey(err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetches a batch of `pagesLength` pages of shows starting from `startPage`.
   */
  async function fetchShowPages(
    startPage: number,
    pagesLength: number,
  ): Promise<{
    fulfilled: PromiseFulfilledResult<ShowSummary[]>[]
    rejected: PromiseRejectedResult[]
    failed: PromiseRejectedResult[]
  }> {
    const pageIds = Array.from({ length: pagesLength }, (_, i) => startPage + i)
    const pagesBatch = await Promise.allSettled(pageIds.map((pageId) => getShows(pageId)))

    const fulfilled = pagesBatch.filter((result) => result.status === 'fulfilled')
    const rejected = pagesBatch.filter((result) => result.status === 'rejected')
    const failed = rejected.filter(({ reason }) => !isAllPagesLoaded(reason))

    return { fulfilled, rejected, failed }
  }

  /**
   * Checks if all pages are loaded (no more pages to fetch).
   */
  function isAllPagesLoaded(reason: PromiseRejectedResult['reason']): boolean {
    return reason instanceof ApiError && reason.status === 404
  }

  return { shows, loading, error, hasMore, showsByGenre, genres, fetchShows, fetchMoreShows, PAGES_PER_BATCH }
})
