<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const capturedError = ref<Error | null>(null)

onErrorCaptured((err) => {
  capturedError.value = err instanceof Error ? err : new Error(String(err))
  return false
})
</script>

<template>
  <div
    v-if="capturedError"
    class="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center"
    data-testid="app-render-error"
  >
    <p class="text-danger font-semibold">{{ t('errors.generic') }}</p>
    <button
      class="bg-brand hover:bg-brand-hover rounded px-4 py-2 font-semibold text-white transition-colors duration-200"
      @click="capturedError = null"
    >
      {{ t('common.retry') }}
    </button>
  </div>

  <slot v-else />
</template>
