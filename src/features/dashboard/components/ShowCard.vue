<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { RouteNames } from '@/shared/constants/route-names'
import type { ShowSummary } from '@/shared/types/show'
import IconNoArtwork from '@/shared/icons/IconNoArtwork.vue'

const props = defineProps<{ show: ShowSummary }>()

const previewImage = computed(() => props.show.image?.medium ?? null)
const isRated = computed(() => props.show.rating !== null)
const ratingLabel = computed(() => (isRated.value ? props.show.rating!.toFixed(1) : '—'))
</script>

<template>
  <RouterLink
    :to="{ name: RouteNames.DETAILS, params: { id: show.id } }"
    class="group border-border bg-surface focus-visible:outline-brand relative flex w-36 shrink-0 flex-col overflow-hidden rounded-xl border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 sm:w-40"
    :aria-label="`${show.name}, rated ${ratingLabel}`"
    data-testid="show-card"
  >
    <!-- Preview image -->
    <div class="bg-surface-hover relative aspect-2/3 w-full overflow-hidden">
      <img
        v-if="previewImage"
        :src="previewImage"
        :alt="`${show.name} preview image`"
        class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        data-testid="show-card-preview-image"
      />
      <!-- Preview image fallback -->
      <div
        v-else
        class="text-fg-subtle flex size-full items-center justify-center"
        aria-hidden="true"
        data-testid="show-card-preview-image-fallback"
      >
        <IconNoArtwork class="size-10 opacity-40" />
      </div>

      <!-- Rating badge -->
      <span
        class="absolute top-1.5 right-1.5 rounded-md px-1.5 py-0.5 text-xs leading-none font-bold tabular-nums"
        :class="isRated ? 'bg-accent text-fg' : 'bg-surface/80 text-fg-muted'"
        data-testid="show-card-rating"
      >
        {{ ratingLabel }}
      </span>
    </div>

    <!-- Title and year -->
    <div class="flex flex-col gap-0.5 px-2 py-2">
      <p class="text-fg line-clamp-2 text-xs leading-snug font-semibold" data-testid="show-card-title">
        {{ show.name }}
      </p>
      <p v-if="show.premieredYear" class="text-fg-subtle text-[10px]" data-testid="show-card-year">
        {{ show.premieredYear }}
      </p>
    </div>
  </RouterLink>
</template>
