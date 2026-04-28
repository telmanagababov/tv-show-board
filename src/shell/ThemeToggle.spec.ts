import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, type Pinia } from 'pinia'

import { i18n } from '@/shared/i18n'
import { useThemeStore } from '@/shared/stores/theme.store'
import ThemeToggle from './ThemeToggle.vue'

describe('ThemeToggle', () => {
  const locators = {
    button: '[data-testid="theme-toggle"]',
  } as const

  let pinia: Pinia
  let view: VueWrapper

  beforeEach(() => {
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
    localStorage.clear()
    document.documentElement.classList.remove('dark')
    pinia = createPinia()
    view = mount(ThemeToggle, { global: { plugins: [pinia, i18n] } })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders the toggle button', () => {
    expect(view.find(locators.button).exists()).toBe(true)
  })

  it('renders an SVG icon', () => {
    expect(view.find(`${locators.button} svg`).exists()).toBe(true)
  })

  it('labels the button "Switch to dark mode" when currently in light mode', () => {
    expect(view.find(locators.button).attributes('aria-label')).toContain('dark')
  })

  it('labels the button "Switch to light mode" when currently in dark mode', async () => {
    useThemeStore(pinia).toggleTheme()
    await view.vm.$nextTick()
    expect(view.find(locators.button).attributes('aria-label')).toContain('light')
  })

  it('calls toggleTheme on the store when clicked', async () => {
    const store = useThemeStore(pinia)
    const spy = vi.spyOn(store, 'toggleTheme')
    await view.find(locators.button).trigger('click')
    expect(spy).toHaveBeenCalledOnce()
  })

  it('sets theme to "dark" in the store after clicking from light mode', async () => {
    const store = useThemeStore(pinia)
    await view.find(locators.button).trigger('click')
    expect(store.theme).toBe('dark')
  })

  it('sets theme to "light" in the store after clicking from dark mode', async () => {
    const store = useThemeStore(pinia)
    store.toggleTheme()
    await view.vm.$nextTick()
    await view.find(locators.button).trigger('click')
    expect(store.theme).toBe('light')
  })
})
