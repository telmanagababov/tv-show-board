<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <button
    type="button"
    class="text-brand hover:text-brand-hover focus-visible:outline-brand w-fit cursor-pointer text-sm font-medium underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-2"
    data-testid="back-button"
    @click="router.back()"
  >
    ← {{ t('common.back') }}
  </button>
</template>
