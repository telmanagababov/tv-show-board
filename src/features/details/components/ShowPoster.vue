<script setup lang="ts">
import { IconNoArtwork } from '@/shared/icons'
import type { ShowImage } from '@/shared/types'

defineProps<{
  image: ShowImage | null
  name: string
}>()
</script>

<template>
  <div class="bg-surface-hover aspect-2/3 w-full overflow-hidden rounded-xl shadow-md">
    <img
      v-if="image"
      :src="image.original"
      :alt="name"
      class="size-full object-cover"
      decoding="async"
      data-testid="details-poster"
    />
    <div
      v-else
      class="text-fg-subtle flex size-full items-center justify-center"
      aria-hidden="true"
      data-testid="details-poster-fallback"
    >
      <IconNoArtwork class="size-16 opacity-40" />
    </div>
  </div>
</template>
