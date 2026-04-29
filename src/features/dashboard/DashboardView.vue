<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import { useShowsStore } from './stores/shows.store'
import GenreSection from './components/GenreSection.vue'
import { ErrorState, EmptyState, LoadingIndicator } from '@/shared/components'
import { DomIds } from '@/shared/constants'

const { t } = useI18n()
const store = useShowsStore()

/**
 * Fetch the shows when the view mounts.
 */
onMounted(() => store.fetchShows())
</script>

<template>
  <div class="px-4 pt-4 pb-20 sm:px-6 sm:pt-6 lg:px-8 lg:pt-8" data-testid="dashboard">
    <!-- Title -->
    <h1 class="text-brand mb-6 text-2xl font-bold sm:mb-10 sm:text-4xl" data-testid="dashboard-title">
      {{ t('dashboard.title') }}
    </h1>

    <!-- Loading state -->
    <div
      v-if="store.loading && store.genres.length === 0"
      class="flex items-center justify-center py-24"
      data-testid="dashboard-loading"
    >
      <LoadingIndicator size="lg" />
    </div>

    <!-- Error state -->
    <ErrorState
      v-else-if="store.error && store.genres.length === 0"
      :message="t(store.error)"
      data-testid="dashboard-error"
      @retry="store.fetchShows()"
    />

    <!-- Empty state -->
    <EmptyState v-else-if="store.genres.length === 0" :message="t('dashboard.empty')" data-testid="dashboard-empty" />

    <!-- Genre sections -->
    <div v-else class="flex flex-col gap-6" data-testid="dashboard-genres">
      <GenreSection
        v-for="genre in store.genres"
        :key="genre"
        :genre="genre"
        :shows="store.showsByGenre.get(genre)!"
        :show-sentinel="store.hasMore"
      />
    </div>

    <!-- Loading more bar -->
    <div
      v-if="store.genres.length > 0 && (store.hasMore || store.loading)"
      class="bg-bg/80 fixed inset-x-0 bottom-0 z-10 flex items-center justify-center gap-3 px-4 py-3 backdrop-blur-sm"
      data-testid="dashboard-pagination-bar"
    >
      <div v-if="store.loading" class="flex h-9 items-center" data-testid="dashboard-loading-more">
        <LoadingIndicator size="sm" />
      </div>
      <button
        v-else
        :id="DomIds.LOAD_MORE_ACTION"
        class="bg-brand hover:bg-brand-hover h-9 rounded px-6 text-sm font-semibold text-white transition-colors duration-200 focus-visible:outline focus-visible:outline-white"
        data-testid="dashboard-load-more"
        @click="store.fetchMoreShows()"
      >
        {{ t('dashboard.loadMore') }}
      </button>
    </div>
  </div>
</template>
