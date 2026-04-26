<script setup lang="ts">
import { useRoute } from 'vue-router'
import { SEARCH_QUERY_KEY } from '@/shared/constants/route-names'

const route = useRoute()
</script>

<template>
  <main class="bg-bg text-fg min-h-screen p-8">
    <h1 class="text-3xl font-bold" data-testid="search-heading">Search</h1>
    <p class="text-fg-muted mt-4" data-testid="search-query">Query: {{ route.query[SEARCH_QUERY_KEY] || '(empty)' }}</p>
  </main>
</template>
