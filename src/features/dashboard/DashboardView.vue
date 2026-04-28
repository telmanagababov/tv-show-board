<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import './i18n'

import { useShowsStore } from './stores/shows.store'
import GenreSection from './components/GenreSection.vue'
import { ErrorState, EmptyState, LoadingIndicator } from '@/shared/components'

const { t } = useI18n()
const store = useShowsStore()

onMounted(() => store.fetchShows())
</script>

<template>
  <div class="p-8 pb-20" data-testid="dashboard">
    <!-- Title -->
    <h1 class="text-brand mb-12 text-4xl font-bold" data-testid="dashboard-title">
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
        class="bg-brand hover:bg-brand-hover h-9 rounded px-6 text-sm font-semibold text-white transition-colors duration-200"
        data-testid="dashboard-load-more"
        @click="store.fetchMoreShows()"
      >
        {{ t('dashboard.loadMore') }}
      </button>
    </div>
  </div>
</template>
