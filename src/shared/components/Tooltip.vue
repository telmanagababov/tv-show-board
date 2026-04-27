<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'ShowsTooltip' })
defineProps<{ text: string }>()

const triggerRef = ref<HTMLElement | null>(null)
const visible = ref(false)
const style = ref<{ top: string; left: string }>({ top: '0px', left: '0px' })

function show() {
  if (triggerRef.value) {
    const refBox = triggerRef.value.getBoundingClientRect()
    style.value = {
      top: `${refBox.bottom + 5}px`,
      left: `${refBox.left}px`,
    }
    visible.value = true
  }
}
function hide() {
  visible.value = false
}
</script>

<template>
  <div ref="triggerRef" data-testid="tooltip-trigger" @mouseenter="show" @mouseleave="hide">
    <slot />
  </div>

  <Teleport to="body">
    <div
      v-if="visible"
      :style="style"
      class="bg-fg text-bg pointer-events-none fixed z-50 max-w-48 rounded-md px-2 py-1.5 text-xs leading-snug shadow-lg"
      role="tooltip"
      data-testid="tooltip-popup"
    >
      {{ text }}
    </div>
  </Teleport>
</template>
