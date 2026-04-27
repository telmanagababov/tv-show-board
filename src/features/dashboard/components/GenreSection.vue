<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import '../i18n'
import type { ShowSummary } from '@/shared/types/show'
import { useGenreLabel } from '@/shared/composables/useGenreLabel'
import ShowList from './ShowList.vue'

const props = defineProps<{
  genre: string
  shows: ShowSummary[]
}>()

const { t } = useI18n()
const { translateGenre } = useGenreLabel()

const genre = computed(() => translateGenre(props.genre))
const ariaLabel = computed(() => t('dashboard.genreSection.ariaLabel', { genre: genre.value }))
</script>

<template>
  <section :aria-label="ariaLabel" class="flex flex-col gap-3" data-testid="genre-section">
    <h2 class="text-brand text-lg font-bold tracking-tight" data-testid="genre-section-heading">
      {{ genre }}
    </h2>

    <ShowList :shows="shows" :label="ariaLabel" :genre="genre" />
  </section>
</template>
