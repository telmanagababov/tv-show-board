<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { RouteNames } from '@/shared/constants'
import { IconNoArtwork } from '@/shared/icons'
import type { CastMember } from '@/shared/types'

defineProps<{ member: CastMember }>()
</script>

<template>
  <RouterLink
    :to="{ name: RouteNames.PERSON, params: { id: member.personId } }"
    class="group border-border bg-surface focus-visible:outline-brand flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2"
    data-testid="person-card"
  >
    <!-- Square photo -->
    <div class="bg-surface-hover aspect-square w-full overflow-hidden">
      <img
        v-if="member.personImage"
        :src="member.personImage.medium"
        :alt="member.personName"
        class="size-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
        loading="lazy"
        decoding="async"
        data-testid="person-card-photo"
      />
      <div
        v-else
        class="text-fg-subtle flex size-full items-center justify-center"
        aria-hidden="true"
        data-testid="person-card-photo-fallback"
      >
        <IconNoArtwork class="size-8 opacity-40" />
      </div>
    </div>

    <!-- Name + character -->
    <div class="px-3 py-2">
      <p class="text-fg truncate text-xs font-semibold" data-testid="person-card-name">
        {{ member.personName }}
      </p>
      <p class="text-fg-muted truncate text-[10px]" data-testid="person-card-character">
        {{ member.characterName }}
      </p>
    </div>
  </RouterLink>
</template>
