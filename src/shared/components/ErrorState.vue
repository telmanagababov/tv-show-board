<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ message: string }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <div class="flex flex-col items-center gap-4 py-16">
    <p class="text-danger text-center" data-testid="error-state-message">{{ message }}</p>
    <button
      class="bg-brand hover:bg-brand-hover rounded px-4 py-2 font-semibold text-white transition-colors duration-200"
      data-testid="retry-button"
      @click="$emit('retry')"
    >
      {{ t('common.retry') }}
    </button>
  </div>
</template>
