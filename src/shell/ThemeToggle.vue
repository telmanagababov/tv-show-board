<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useThemeStore } from '@/shared/stores'
import { IconSun, IconMoon } from '@/shared/icons'

const { t } = useI18n()
const store = useThemeStore()
</script>

<template>
  <button
    type="button"
    class="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white/80 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-white"
    :aria-label="store.theme === 'dark' ? t('shell.header.switchToLight') : t('shell.header.switchToDark')"
    data-testid="theme-toggle"
    @click="store.toggleTheme"
  >
    <IconSun v-if="store.theme === 'dark'" class="size-5" />
    <IconMoon v-else class="size-5" />
  </button>
</template>
