<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import AppHeader from '@/shell/AppHeader.vue'
import { DomIds, RouteNames } from '@/shared/constants'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()
</script>

<template>
  <div class="bg-bg text-fg flex min-h-screen flex-col">
    <!-- Skip links -->
    <a
      :href="`#${DomIds.MAIN_CONTENT}`"
      class="focus:bg-brand-dark sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-100 focus:rounded focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
    >
      {{ t('app.skipLinks.mainContent') }}
    </a>
    <a
      v-if="route.name === RouteNames.DASHBOARD"
      :href="`#${DomIds.LOAD_MORE_ACTION}`"
      class="focus:bg-brand-dark sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-36 focus:z-100 focus:rounded focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
    >
      {{ t('app.skipLinks.loadMoreAction') }}
    </a>

    <AppHeader data-testid="app-header" />

    <main :id="DomIds.MAIN_CONTENT" class="flex-1 focus:outline-none" tabindex="-1" data-testid="app-main-content">
      <RouterView />
    </main>
  </div>
</template>
