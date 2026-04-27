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
}>()
</script>

<template>
  <ul
    v-if="shows.length > 0"
    :aria-label="label"
    class="flex snap-x snap-mandatory list-none gap-3 overflow-x-auto scroll-smooth pb-3"
    data-testid="show-list"
  >
    <li v-for="show in shows" :key="show.id" class="shrink-0 snap-start" data-testid="show-list-item">
      <ShowCard :show="show" :genre="genre" />
    </li>
  </ul>

  <p v-else class="text-fg-subtle text-sm italic" data-testid="show-list-empty">
    {{ t('dashboard.showList.empty') }}
  </p>
</template>
