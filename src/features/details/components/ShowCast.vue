<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PersonCard from './PersonCard.vue'
import type { CastMember } from '@/shared/types'

const { t } = useI18n()

defineProps<{ cast: CastMember[] }>()
</script>

<template>
  <section class="mt-10" data-testid="details-cast-section">
    <h2 class="text-fg mb-4 text-xl font-semibold">{{ t('details.cast') }}</h2>
    <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4" data-testid="details-cast">
      <li v-for="member in cast" :key="member.personId" data-testid="details-cast-member">
        <PersonCard :member="member" />
      </li>
    </ul>
  </section>
</template>
