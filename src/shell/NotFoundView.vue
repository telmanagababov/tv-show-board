<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import './i18n'

const { t } = useI18n()
</script>

<template>
  <main class="bg-bg text-fg flex min-h-screen flex-col items-center justify-center p-8">
    <h1 class="text-6xl font-bold" data-testid="not-found-heading">{{ t('shell.notFound.heading') }}</h1>
    <p class="text-fg-muted mt-4" data-testid="not-found-message">{{ t('shell.notFound.message') }}</p>
    <RouterLink to="/" class="text-brand mt-6 underline" data-testid="not-found-link">{{ t('shell.notFound.backLink') }}</RouterLink>
  </main>
</template>
