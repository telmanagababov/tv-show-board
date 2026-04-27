<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatRating } from '@/shared/utils/format-rating'
import { localizeDay, localizeTime } from '../utils/format-schedule'
import ShowStatusBadge from './ShowStatusBadge.vue'
import type { ShowDetails } from '@/shared/types/show'
import { useGenreLabel } from '@/shared/composables/useGenreLabel'

const { t, locale } = useI18n()
const { translateGenre } = useGenreLabel()
const props = defineProps<{ show: ShowDetails }>()

const rating = computed(() => formatRating(props.show.rating))
const schedule = computed(() => {
  const { days, time } = props.show.schedule
  const formattedDays = days.map((day) => localizeDay(day, locale.value)).join(', ')
  return formattedDays && time
    ? t('details.scheduleAt', { days: formattedDays, time: localizeTime(time, locale.value) })
    : formattedDays
})
const genres = computed(() => props.show.genres.map((genre) => translateGenre(genre)))
</script>

<template>
  <div class="flex flex-1 flex-col gap-4">
    <h1 class="text-3xl leading-tight font-bold" data-testid="details-title">
      {{ show.name }}
    </h1>

    <!-- Rating + status badges -->
    <div class="flex flex-wrap items-center gap-3">
      <span
        class="bg-accent text-fg rounded-md px-2.5 py-1 text-sm font-bold tabular-nums"
        data-testid="details-rating"
      >
        ★ {{ rating }}
      </span>
      <ShowStatusBadge :status="show.status" />
    </div>

    <!-- Metadata table -->
    <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm" data-testid="details-meta">
      <template v-if="show.premieredYear">
        <dt class="text-fg-muted font-medium">{{ t('details.premiered') }}</dt>
        <dd data-testid="details-premiered">{{ show.premieredYear }}</dd>
      </template>
      <template v-if="show.network">
        <dt class="text-fg-muted font-medium">{{ t('details.network') }}</dt>
        <dd data-testid="details-network">{{ show.network }}</dd>
      </template>
      <template v-if="show.language">
        <dt class="text-fg-muted font-medium">{{ t('details.language') }}</dt>
        <dd data-testid="details-language">{{ show.language }}</dd>
      </template>
      <template v-if="schedule">
        <dt class="text-fg-muted font-medium">{{ t('details.schedule') }}</dt>
        <dd data-testid="details-schedule">{{ schedule }}</dd>
      </template>
    </dl>

    <!-- Genre pills -->
    <div v-if="genres.length" class="flex flex-wrap gap-2" data-testid="details-genres">
      <span
        v-for="genre in genres"
        :key="genre"
        class="border-brand text-brand rounded-full border px-3 py-1 text-xs font-medium"
      >
        {{ genre }}
      </span>
    </div>

    <!-- Official site -->
    <a
      v-if="show.officialSite"
      :href="show.officialSite"
      target="_blank"
      rel="noopener noreferrer"
      class="text-brand hover:text-brand-hover w-fit text-sm font-medium underline-offset-4 hover:underline"
      data-testid="details-official-site"
    >
      {{ t('details.visitSite') }}<span class="sr-only"> — {{ show.name }}</span> ↗
    </a>
  </div>
</template>
