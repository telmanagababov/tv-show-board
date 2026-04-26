<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppHeader from '@/shell/AppHeader.vue'
</script>

<template>
  <div class="bg-bg text-fg flex min-h-screen flex-col">
    <AppHeader data-testid="app-header" />

    <main class="flex-1" data-testid="app-main-content">
      <RouterView />
    </main>
  </div>
</template>
