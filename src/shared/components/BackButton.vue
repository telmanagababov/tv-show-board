<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const router = useRouter()
</script>

<template>
  <a
    class="text-brand hover:text-brand-hover w-fit text-sm font-medium underline-offset-4 hover:underline"
    data-testid="back-button"
    href="#"
    @click.prevent="router.back()"
  >
    ← {{ t('common.back') }}
  </a>
</template>
