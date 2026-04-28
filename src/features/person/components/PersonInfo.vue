<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { PersonDetails } from '@/shared/types'

const { t } = useI18n()

defineProps<{ person: PersonDetails }>()
</script>

<template>
  <div class="flex flex-col gap-3">
    <h1 class="text-fg text-2xl font-bold sm:text-3xl" data-testid="person-name">
      {{ person.name }}
    </h1>

    <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm" data-testid="person-meta">
      <template v-if="person.birthday">
        <dt class="text-fg-subtle font-medium">{{ t('person.birthday') }}</dt>
        <dd class="text-fg-muted" data-testid="person-birthday">{{ person.birthday }}</dd>
      </template>
      <template v-if="person.deathday">
        <dt class="text-fg-subtle font-medium">{{ t('person.deathday') }}</dt>
        <dd class="text-fg-muted" data-testid="person-deathday">{{ person.deathday }}</dd>
      </template>
      <template v-if="person.gender">
        <dt class="text-fg-subtle font-medium">{{ t('person.gender') }}</dt>
        <dd class="text-fg-muted" data-testid="person-gender">{{ person.gender }}</dd>
      </template>
      <template v-if="person.country">
        <dt class="text-fg-subtle font-medium">{{ t('person.country') }}</dt>
        <dd class="text-fg-muted" data-testid="person-country">{{ person.country }}</dd>
      </template>
    </dl>
  </div>
</template>
