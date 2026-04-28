/**
 * Theme store — manages dark/light mode preference.
 *
 * Priority for the initial value (highest wins):
 *  1. Value saved in localStorage ('dark' | 'light')
 *  2. OS-level preference via `prefers-color-scheme: dark`
 *  3. Light mode (safe default)
 */

import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore('theme', () => {
  const STORAGE_KEY = 'tv-board:theme'
  const theme = ref(getDefaultTheme())

  watch(
    theme,
    (value) => {
      document.documentElement.classList.toggle('dark', value === 'dark')
      localStorage.setItem(STORAGE_KEY, value)
    },
    { immediate: true, flush: 'sync' },
  )

  /**
   * Gets the default theme.
   */
  function getDefaultTheme(): 'dark' | 'light' {
    const savedTheme = localStorage.getItem(STORAGE_KEY)
    if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme
    return window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light'
  }

  /**
   * Flips the current theme.
   */
  function toggleTheme(): void {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  return { theme, toggleTheme }
})
