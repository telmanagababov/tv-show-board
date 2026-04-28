<script setup lang="ts">
import { computed, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import './i18n'

import { useShowDetailsStore } from './stores/show-detail.store'
import BackButton from '@/shared/components/BackButton.vue'
import LoadingIndicator from '@/shared/components/LoadingIndicator.vue'
import ErrorState from '@/shared/components/ErrorState.vue'
import ShowPoster from './components/ShowPoster.vue'
import ShowInfo from './components/ShowInfo.vue'
import ShowSummary from './components/ShowSummary.vue'
import ShowCast from './components/ShowCast.vue'

const { t } = useI18n()
const store = useShowDetailsStore()
const props = defineProps<{ id: string }>()
const details = computed(() => store.details)

/**
 * Watch the route parameter `id` and fetch the show details when it changes.
 */
watch(
  () => props.id,
  (id) => store.fetchDetails(Number(id)),
  { immediate: true },
)
/**
 * Clear the store when the component is unmounted.
 */
onUnmounted(() => store.clearDetails())
</script>

<template>
  <div class="bg-bg text-fg min-h-screen">
    <!-- Back button -->
    <div class="mx-auto max-w-5xl px-6 pt-6">
      <BackButton />
    </div>

    <!-- Loading state -->
    <div v-if="store.loading" class="flex min-h-[60vh] items-center justify-center" data-testid="details-loading">
      <LoadingIndicator size="lg" />
    </div>

    <!-- Error state -->
    <div v-else-if="store.error" class="mx-auto max-w-5xl px-6 py-16" data-testid="details-error">
      <ErrorState :message="t(store.error)" @retry="store.fetchDetails(Number(props.id))" />
    </div>

    <!-- Show details -->
    <article v-else-if="details" class="mx-auto max-w-5xl px-6 py-8" data-testid="details-content">
      <div class="flex flex-col gap-8 sm:flex-row sm:items-start">
        <div class="shrink-0 sm:w-52 md:w-64">
          <ShowPoster :image="details.image" :name="details.name" />
        </div>
        <ShowInfo :show="details" />
      </div>

      <ShowSummary v-if="details.summaryHtml" :summary-html="details.summaryHtml" />
      <ShowCast v-if="details.cast.length" :cast="details.cast" />
    </article>
  </div>
</template>
