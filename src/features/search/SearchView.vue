<script setup lang="ts">
import { useI18n } from 'vue-i18n'

import { useSearchStore } from './stores/search.store'
import ShowCard from '@/shared/components/ShowCard.vue'
import LoadingIndicator from '@/shared/components/LoadingIndicator.vue'
import ErrorState from '@/shared/components/ErrorState.vue'
import EmptyState from '@/shared/components/EmptyState.vue'
import './i18n'

const { t } = useI18n()
const store = useSearchStore()
</script>

<template>
  <main class="bg-bg text-fg min-h-screen px-6 py-8 md:px-12">
    <h1 class="mb-8 text-2xl font-bold md:text-3xl" data-testid="search-heading">
      <template v-if="store.hasQuery">{{ t('search.resultsFor', { query: store.query }) }}</template>
      <template v-else>{{ t('search.placeholder') }}</template>
    </h1>

    <LoadingIndicator v-if="store.loading" size="lg" :message="t('search.loading')" data-testid="search-loading" />

    <ErrorState v-else-if="store.error" :message="t(store.error)" data-testid="search-error" @retry="store.retry()" />

    <EmptyState
      v-else-if="store.hasQuery && !store.shows.length"
      :message="t('search.noResults', { query: store.query })"
      data-testid="search-empty"
    />

    <ul
      v-else-if="store.shows.length"
      class="flex flex-wrap gap-4"
      role="list"
      :aria-label="t('search.resultsFor', { query: store.query })"
      data-testid="search-results"
    >
      <li v-for="show in store.shows" :key="show.id" data-testid="search-result-item">
        <ShowCard :show="show" />
      </li>
    </ul>
  </main>
</template>
