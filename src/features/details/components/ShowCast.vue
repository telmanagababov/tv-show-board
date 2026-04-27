<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import IconNoArtwork from '@/shared/icons/IconNoArtwork.vue'
import type { CastMember } from '@/shared/types/show'

const { t } = useI18n()

defineProps<{ cast: CastMember[] }>()
</script>

<template>
  <section class="mt-10" data-testid="details-cast-section">
    <h2 class="text-fg mb-4 text-xl font-semibold">{{ t('details.cast') }}</h2>
    <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4" data-testid="details-cast">
      <li
        v-for="member in cast"
        :key="member.personId"
        class="border-border bg-surface flex flex-col overflow-hidden rounded-xl border"
        data-testid="details-cast-member"
      >
        <div class="bg-surface-hover aspect-square w-full overflow-hidden">
          <img
            v-if="member.personImage"
            :src="member.personImage.medium"
            :alt="member.personName"
            class="size-full object-cover object-top"
            loading="lazy"
          />
          <div v-else class="text-fg-subtle flex size-full items-center justify-center" aria-hidden="true">
            <IconNoArtwork class="size-8 opacity-40" />
          </div>
        </div>
        <div class="px-3 py-2">
          <p class="text-fg truncate text-xs font-semibold">{{ member.personName }}</p>
          <p class="text-fg-muted truncate text-[10px]">{{ member.characterName }}</p>
        </div>
      </li>
    </ul>
  </section>
</template>
