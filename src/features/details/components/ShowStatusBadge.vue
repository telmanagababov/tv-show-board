<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ShowStatus } from '@/shared/types'

const { t } = useI18n()
const props = defineProps<{ status: ShowStatus }>()

/**
 * Maps the domain status value to a translated display label.
 */
const statusLabel = computed((): string => {
  switch (props.status) {
    case 'running':
      return t('details.statusRunning')
    case 'ended':
      return t('details.statusEnded')
    case 'upcoming':
      return t('details.statusUpcoming')
    default:
      return props.status
  }
})
</script>

<template>
  <span class="border-border bg-surface rounded-md border px-2.5 py-1 text-sm font-medium" data-testid="details-status">
    {{ statusLabel }}
  </span>
</template>
