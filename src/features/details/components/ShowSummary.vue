<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DOMPurify from 'dompurify'

const { t } = useI18n()
const props = defineProps<{ summaryHtml: string }>()

const summaryHtml = computed(() => DOMPurify.sanitize(props.summaryHtml))
</script>

<template>
  <section class="mt-10" data-testid="details-summary-section">
    <h2 class="text-fg mb-3 text-xl font-semibold">{{ t('details.summary') }}</h2>
    <!-- eslint-disable vue/no-v-html -->
    <div
      class="text-fg-muted leading-relaxed [&_p]:mb-3 [&_p:last-child]:mb-0"
      data-testid="details-summary"
      v-html="summaryHtml"
    />
    <!-- eslint-enable vue/no-v-html -->
  </section>
</template>
