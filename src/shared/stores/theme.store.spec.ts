import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { useThemeStore } from './theme.store'

const STORAGE_KEY = 'tv-board:theme'

describe('useThemeStore', () => {
  beforeEach(() => {
    stubMatchMedia(false)
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('initial theme resolution', () => {
    it('defaults to "light" when no saved preference and OS prefers light', () => {
      expect(useThemeStore().theme).toBe('light')
    })

    it('defaults to "dark" when no saved preference and OS prefers dark', () => {
      stubMatchMedia(true)
      expect(useThemeStore().theme).toBe('dark')
    })

    it('uses saved "dark" preference over OS light preference', () => {
      localStorage.setItem(STORAGE_KEY, 'dark')
      expect(useThemeStore().theme).toBe('dark')
    })

    it('uses saved "light" preference over OS dark preference', () => {
      localStorage.setItem(STORAGE_KEY, 'light')
      stubMatchMedia(true)
      expect(useThemeStore().theme).toBe('light')
    })

    it('falls back to light when matchMedia is unavailable (e.g. in jsdom)', () => {
      vi.stubGlobal('matchMedia', undefined)
      expect(useThemeStore().theme).toBe('light')
    })
  })

  describe('toggleTheme', () => {
    it('switches theme from "light" to "dark"', () => {
      const store = useThemeStore()
      store.toggleTheme()
      expect(store.theme).toBe('dark')
    })

    it('switches theme from "dark" to "light"', () => {
      localStorage.setItem(STORAGE_KEY, 'dark')
      const store = useThemeStore()
      store.toggleTheme()
      expect(store.theme).toBe('light')
    })

    it('can be toggled multiple times correctly', () => {
      const store = useThemeStore()
      store.toggleTheme()
      store.toggleTheme()
      expect(store.theme).toBe('light')
    })
  })

  describe('DOM side effect: <html> class', () => {
    it('adds the dark class when the theme is "dark" on init', () => {
      localStorage.setItem(STORAGE_KEY, 'dark')
      useThemeStore()
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('does not add the dark class when the theme is "light" on init', () => {
      useThemeStore()
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })

    it('adds the dark class synchronously after toggling to dark', () => {
      const store = useThemeStore()
      store.toggleTheme()
      expect(document.documentElement.classList.contains('dark')).toBe(true)
    })

    it('removes the dark class synchronously after toggling back to light', () => {
      localStorage.setItem(STORAGE_KEY, 'dark')
      const store = useThemeStore()
      store.toggleTheme()
      expect(document.documentElement.classList.contains('dark')).toBe(false)
    })
  })

  describe('localStorage side effect', () => {
    it('writes "light" to localStorage on init when theme is light', () => {
      useThemeStore()
      expect(localStorage.getItem(STORAGE_KEY)).toBe('light')
    })

    it('writes "dark" to localStorage on init when theme is dark', () => {
      localStorage.setItem(STORAGE_KEY, 'dark')
      useThemeStore()
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
    })

    it('persists "dark" to localStorage after toggling to dark', () => {
      const store = useThemeStore()
      store.toggleTheme()
      expect(localStorage.getItem(STORAGE_KEY)).toBe('dark')
    })

    it('persists "light" to localStorage after toggling back to light', () => {
      localStorage.setItem(STORAGE_KEY, 'dark')
      const store = useThemeStore()
      store.toggleTheme()
      expect(localStorage.getItem(STORAGE_KEY)).toBe('light')
    })
  })

  function stubMatchMedia(prefersDark: boolean) {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: prefersDark }))
  }
})
