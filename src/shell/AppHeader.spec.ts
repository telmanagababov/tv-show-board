import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import AppHeader from './AppHeader.vue'
import { RouteNames, SEARCH_QUERY_KEY } from '@/shared/constants/route-names'

describe('AppHeader', () => {
  const locators = {
    header: '[data-testid="app-header"]',
    logoLink: '[data-testid="header-logo-link"]',
    searchForm: '[data-testid="search-form"]',
    searchInput: '[data-testid="search-input"]',
    clearBtn: '[data-testid="search-clear-btn"]',
  } as const

  let view: VueWrapper
  let router: ReturnType<typeof createRouter>

  beforeEach(async () => {
    const header = await mountHeader('/')
    view = header.view
    router = header.router
  })

  it('renders the header landmark', () => {
    expect(view.find(locators.header).exists()).toBe(true)
  })

  it('renders a logo link', () => {
    expect(view.find(locators.logoLink).exists()).toBe(true)
  })

  it('renders the search input', () => {
    expect(view.find(locators.searchInput).exists()).toBe(true)
  })

  it('does not show the clear button when the input is empty', () => {
    expect(view.find(locators.clearBtn).exists()).toBe(false)
  })

  it('pushes to the search route on the first keystroke from a non-search page', async () => {
    const pushSpy = vi.spyOn(router, 'push')

    await typeInSearch(view, 'breaking')

    expect(pushSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: RouteNames.SEARCH,
        query: { [SEARCH_QUERY_KEY]: 'breaking' },
      }),
    )
    expect(router.currentRoute.value.name).toBe(RouteNames.SEARCH)
  })

  it('replaces the route on subsequent keystrokes while on the search page', async () => {
    const { view, router } = await mountHeader(`/search?${SEARCH_QUERY_KEY}=bat`)
    const replaceSpy = vi.spyOn(router, 'replace')

    await typeInSearch(view, 'batman')

    expect(replaceSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: RouteNames.SEARCH,
        query: { [SEARCH_QUERY_KEY]: 'batman' },
      }),
    )
  })

  it('navigates to the dashboard without a query when the input is emptied on the search page', async () => {
    const { view, router } = await mountHeader(`/search?${SEARCH_QUERY_KEY}=batman`)
    const replaceSpy = vi.spyOn(router, 'push')

    await typeInSearch(view, '')

    expect(replaceSpy).toHaveBeenCalledWith(expect.objectContaining({ name: RouteNames.DASHBOARD }))
    expect(router.currentRoute.value.query[SEARCH_QUERY_KEY]).toBeUndefined()
  })

  it('shows the clear button when the input has text', async () => {
    await view.find(locators.searchInput).setValue('lost')
    expect(view.find(locators.clearBtn).exists()).toBe(true)
  })

  it('hard-clears: navigates to dashboard when the clear button is clicked', async () => {
    await typeInSearch(view, 'lost')
    await view.find(locators.clearBtn).trigger('click')
    await flushPromises()

    expect(view.find<HTMLInputElement>(locators.searchInput).element.value).toBe('')
    expect(router.currentRoute.value.name).toBe(RouteNames.DASHBOARD)
  })

  it('hard-clears: navigates to dashboard on Escape', async () => {
    await typeInSearch(view, 'dexter')
    await view.find(locators.searchInput).trigger('keydown', { key: 'Escape' })
    await flushPromises()

    expect(view.find<HTMLInputElement>(locators.searchInput).element.value).toBe('')
    expect(router.currentRoute.value.name).toBe(RouteNames.DASHBOARD)
  })

  it('pre-fills the input from the URL query param on mount', async () => {
    const { view } = await mountHeader(`/search?${SEARCH_QUERY_KEY}=sopranos`)
    expect(view.find<HTMLInputElement>(locators.searchInput).element.value).toBe('sopranos')
  })

  it('syncs the input when the route query changes externally', async () => {
    await router.push(`/search?${SEARCH_QUERY_KEY}=wire`)
    await view.vm.$nextTick()

    expect(view.find<HTMLInputElement>(locators.searchInput).element.value).toBe('wire')
  })

  it('clears the input when navigating away from search', async () => {
    await typeInSearch(view, 'lost')
    await router.push('/')
    await view.vm.$nextTick()

    expect(view.find<HTMLInputElement>(locators.searchInput).element.value).toBe('')
  })

  async function mountHeader(initialPath = '/') {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/search', name: RouteNames.SEARCH, component: { template: '<div />' } },
      ],
    })
    const view = mount(AppHeader, { global: { plugins: [router, i18n] } })
    await router.push(initialPath)
    return { view, router }
  }

  async function typeInSearch(view: VueWrapper, text: string) {
    await view.find(locators.searchInput).setValue(text)
    await flushPromises()
  }
})
