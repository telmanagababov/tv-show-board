<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppHeader from '@/shell/AppHeader.vue'
import { DomIds, RouteNames } from '@/shared/constants'
import { OfflineBanner, RenderErrorBoundary } from '@/shared/components'
import { useOnlineState } from '@/shared/composables'

const { t } = useI18n()
const activeRoute = useRoute()
const { isOnline } = useOnlineState()
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
      v-if="activeRoute.name === RouteNames.DASHBOARD"
      :href="`#${DomIds.LOAD_MORE_ACTION}`"
      class="focus:bg-brand-dark sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-36 focus:z-100 focus:rounded focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
    >
      {{ t('app.skipLinks.loadMoreAction') }}
    </a>

    <!-- Network offline banner -->
    <OfflineBanner v-if="!isOnline" />

    <!-- App header -->
    <AppHeader data-testid="app-header" />

    <!-- Main content -->
    <main :id="DomIds.MAIN_CONTENT" class="flex-1" data-testid="app-main-content">
      <RenderErrorBoundary>
        <RouterView v-slot="{ Component, route }">
          <keep-alive v-if="route.meta.keepAlive">
            <component :is="Component" />
          </keep-alive>
          <component :is="Component" v-else />
        </RouterView>
      </RenderErrorBoundary>
    </main>
  </div>
</template>
