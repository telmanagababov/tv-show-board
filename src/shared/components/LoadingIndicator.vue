<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const props = withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg' }>(), { size: 'md' })

const sizeClass = computed(() => ({ sm: 'text-sm', md: 'text-base', lg: 'text-xl' })[props.size])
</script>

<template>
  <span :class="['text-brand font-medium', sizeClass]" role="status" aria-live="polite" data-testid="loading-indicator">
    {{ t('common.loading') }}
  </span>
</template>
