<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import '../i18n'
import type { ShowSummary } from '@/shared/types/show'
import ShowCard from './ShowCard.vue'

const { t } = useI18n()

defineProps<{
  shows: ShowSummary[]
  label?: string
  genre?: string
  showSentinel?: boolean
}>()
</script>

<template>
  <ul
    v-if="shows.length > 0"
    :aria-label="label"
    class="flex snap-x snap-mandatory list-none gap-3 overflow-x-auto scroll-smooth pb-3"
    data-testid="show-list"
  >
    <!-- Show cards -->
    <li v-for="show in shows" :key="show.id" class="shrink-0 snap-start" data-testid="show-list-item">
      <ShowCard :show="show" :genre="genre" />
    </li>

    <!-- Sentinel -->
    <li v-if="showSentinel" class="shrink-0 snap-start self-stretch" data-testid="show-list-sentinel">
      <div
        class="border-border text-fg-muted flex h-full w-36 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-3 py-4 text-center sm:w-40"
      >
        <span aria-hidden="true" class="text-lg leading-none">↓</span>
        <p class="text-xs font-medium">{{ t('dashboard.showSentinel.heading') }}</p>
        <p class="text-[10px] opacity-60">{{ t('dashboard.showSentinel.hint') }}</p>
      </div>
    </li>
  </ul>

  <p v-else class="text-fg-subtle text-sm italic" data-testid="show-list-empty">
    {{ t('dashboard.showList.empty') }}
  </p>
</template>
