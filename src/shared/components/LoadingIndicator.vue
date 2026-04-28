<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = defineProps<{ size?: 'sm' | 'md' | 'lg'; message?: string }>()

const sizeClass = computed(() => ({ sm: 'text-sm', md: 'text-base', lg: 'text-xl' })[props.size ?? 'md'])
const loadingMessage = computed(() => props.message ?? t('common.loading'))
</script>

<template>
  <span :class="['text-brand font-medium', sizeClass]" role="status" aria-live="polite" data-testid="loading-indicator">
    {{ loadingMessage }}
  </span>
</template>
