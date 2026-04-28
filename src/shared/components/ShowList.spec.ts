import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import ShowList from './ShowList.vue'
import { RouteNames } from '@/shared/constants'
import type { ShowSummary } from '@/shared/types'
import { createI18n } from 'vue-i18n'

describe('ShowList', () => {
  const locators = {
    list: '[data-testid="show-list"]',
    items: '[data-testid="show-list-item"]',
    empty: '[data-testid="show-list-empty"]',
    card: '[data-testid="show-card"]',
  } as const

  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountList(makeShows(3))
  })

  it('renders a scrollable list when shows are provided', () => {
    expect(wrapper.find(locators.list).exists()).toBe(true)
    expect(wrapper.find(locators.empty).exists()).toBe(false)
  })

  it('renders one ShowCard per show', () => {
    expect(wrapper.findAll(locators.card)).toHaveLength(3)
  })

  it('shows the empty state when shows is empty and emptyText is provided', () => {
    wrapper = mountList([], 'No shows available.')

    expect(wrapper.find(locators.list).exists()).toBe(false)
    expect(wrapper.find(locators.empty).exists()).toBe(true)
  })

  it('renders the emptyText prop content', () => {
    wrapper = mountList([], 'No shows available.')

    expect(wrapper.find(locators.empty).text()).toBe('No shows available.')
  })

  it('hides the empty state when shows is empty but no emptyText is provided', () => {
    wrapper = mountList([])

    expect(wrapper.find(locators.list).exists()).toBe(false)
    expect(wrapper.find(locators.empty).exists()).toBe(false)
  })

  function makeShow(id: number): ShowSummary {
    return {
      id,
      name: `Show ${id}`,
      genres: ['Drama'],
      rating: 8.0,
      summaryHtml: '',
      summaryText: '',
      image: null,
      premieredYear: 2020,
      status: 'running',
      language: 'English',
      network: 'HBO',
    }
  }

  function makeShows(count: number): ShowSummary[] {
    return Array.from({ length: count }, (_, i) => makeShow(i + 1))
  }

  function mountList(shows: ShowSummary[], emptyText?: string) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/details/:id', name: RouteNames.DETAILS, component: { template: '<div />' } },
      ],
    })
    const i18n = createI18n({ legacy: false, locale: 'en', missingWarn: false, fallbackWarn: false })
    return mount(ShowList, {
      props: { shows, emptyText },
      global: { plugins: [router, i18n] },
    })
  }
})
