<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import './i18n'

const { t } = useI18n()
</script>

<template>
  <main class="bg-bg text-fg min-h-screen p-8">
    <h1 class="text-brand text-4xl font-bold" data-testid="dashboard-title">
      {{ t('common.appName') }}
    </h1>
    <p class="text-fg-muted mt-4" data-testid="dashboard-subtitle">
      {{ t('dashboard.subtitle') }}
    </p>
    <p class="text-fg-muted mt-4" data-testid="dashboard-empty">
      {{ t('dashboard.empty') }}
    </p>
  </main>
</template>
