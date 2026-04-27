<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div class="py-16 text-center">
    <p class="text-fg-muted" data-testid="empty-state-message">{{ message }}</p>
  </div>
</template>
