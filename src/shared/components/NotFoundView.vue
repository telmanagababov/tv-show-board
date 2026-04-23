<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="bg-bg text-fg flex min-h-screen flex-col items-center justify-center p-8">
    <h1 class="text-6xl font-bold">404</h1>
    <p class="text-fg-muted mt-4">This page doesn't exist.</p>
    <RouterLink to="/" class="text-brand mt-6 underline"> Back to dashboard </RouterLink>
  </main>
</template>
