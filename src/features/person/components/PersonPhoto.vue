<script setup lang="ts">
import { IconNoArtwork } from '@/shared/icons'
import type { ShowImage } from '@/shared/types'

defineProps<{ image: ShowImage | null; name: string }>()
</script>

<template>
  <div class="bg-surface-hover aspect-2/3 w-full overflow-hidden rounded-xl">
    <img
      v-if="image"
      :src="image.original"
      :alt="name"
      class="size-full object-cover object-top"
      decoding="async"
      data-testid="person-photo"
    />
    <div
      v-else
      class="text-fg-subtle flex size-full items-center justify-center"
      aria-hidden="true"
      data-testid="person-photo-fallback"
    >
      <IconNoArtwork class="size-12 opacity-40" />
    </div>
  </div>
</template>
