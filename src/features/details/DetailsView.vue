<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <main class="bg-bg text-fg min-h-screen p-8">
    <h1 class="text-3xl font-bold">Details for show #{{ route.params.id }}</h1>
    <p class="text-fg-muted mt-4">Details coming soon.</p>
  </main>
</template>
