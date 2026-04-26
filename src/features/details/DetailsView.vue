<script setup lang="ts">
const props = defineProps<{ id: string }>()
</script>

<template>
  <div class="bg-bg text-fg min-h-screen p-8">
    <h1 class="text-3xl font-bold" data-testid="details-heading">
      Details for show #{{ props.id }}
    </h1>
    <p class="text-fg-muted mt-4" data-testid="details-coming-soon">Details coming soon.</p>
  </div>
</template>
