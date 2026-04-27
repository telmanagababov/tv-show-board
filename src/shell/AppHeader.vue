<script setup lang="ts">
import { ref, watch } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { RouteNames, SEARCH_QUERY_KEY } from '@/shared/constants/route-names'
import LogoBadge from '@/shell/LogoBadge.vue'
import IconSearch from '@/shared/icons/IconSearch.vue'
import IconClose from '@/shared/icons/IconClose.vue'
import './i18n'

const { t } = useI18n()
const router = useRouter()
const activeRoute = useRoute()

const searchQuery = ref((activeRoute.query[SEARCH_QUERY_KEY] as string) ?? '')

/**
 * Keeps the input in sync with the URL query parameter.
 */
watch(
  () => activeRoute.query[SEARCH_QUERY_KEY],
  (query) => (searchQuery.value = (query as string) ?? ''),
)

/**
 * Updates the search query in the URL.
 * If the query is empty, navigates to the dashboard.
 * Otherwise, if the current route is the SEARCH route, uses replace to update the query.
 * Otherwise, uses push to add a new history entry to the SEARCH route.
 */
function updateSearch(): void {
  const queryValue = searchQuery.value.trim()
  if (!queryValue) {
    router.push({ name: RouteNames.DASHBOARD })
  } else if (activeRoute.name === RouteNames.SEARCH) {
    router.replace({ name: RouteNames.SEARCH, query: { [SEARCH_QUERY_KEY]: queryValue } })
  } else {
    router.push({ name: RouteNames.SEARCH, query: { [SEARCH_QUERY_KEY]: queryValue } })
  }
}

/**
 * Clears the search query and navigates to the dashboard.
 */
function clearSearch(): void {
  searchQuery.value = ''
  router.push({ name: RouteNames.DASHBOARD })
}
</script>

<template>
  <header
    class="bg-brand-dark/95 sticky top-0 z-50 border-b border-white/15 backdrop-blur-sm"
    role="banner"
    data-testid="app-header"
  >
    <div class="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6">
      <!-- Logo -->
      <RouterLink
        :to="{ name: RouteNames.DASHBOARD }"
        class="flex shrink-0 items-center gap-2 text-white focus-visible:rounded focus-visible:outline-white"
        :aria-label="t('shell.header.logoAriaLabel')"
        data-testid="header-logo-link"
      >
        <LogoBadge class="size-7" />
        <span class="text-base font-semibold tracking-wide">TV Board</span>
      </RouterLink>

      <!-- Search bar -->
      <form role="search" class="flex flex-1 items-center" data-testid="search-form" @submit.prevent="updateSearch">
        <label for="global-search" class="sr-only">{{ t('shell.header.searchLabel') }}</label>

        <div class="relative flex w-full items-center">
          <IconSearch class="pointer-events-none absolute left-3 size-4 text-white/75" />

          <!-- Search input -->
          <input
            id="global-search"
            v-model="searchQuery"
            type="search"
            :placeholder="t('shell.header.searchPlaceholder')"
            autocomplete="off"
            data-testid="search-input"
            class="focus:border-accent focus:ring-accent/40 h-9 w-full rounded-full border border-white/60 bg-white/10 pr-10 pl-9 text-sm text-white placeholder-white/70 transition outline-none focus:bg-white/20 focus:ring-2"
            @input="updateSearch"
            @keydown.escape="clearSearch"
          />

          <!-- Clear button -->
          <button
            v-if="searchQuery"
            type="button"
            class="absolute right-3 flex size-5 cursor-pointer items-center justify-center rounded-full text-white/75 transition hover:text-white focus-visible:outline focus-visible:outline-white"
            :aria-label="t('shell.header.clearSearchAriaLabel')"
            data-testid="search-clear-btn"
            @click="clearSearch"
          >
            <IconClose class="size-3.5" />
          </button>
        </div>
      </form>
    </div>
  </header>
</template>
