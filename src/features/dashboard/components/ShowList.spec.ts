import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import ShowList from './ShowList.vue'
import { RouteNames } from '@/shared/constants/route-names'
import type { ShowSummary } from '@/shared/types/show'
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

  it('shows the empty state and hides the list when shows is empty', () => {
    wrapper = mountList([])

    expect(wrapper.find(locators.list).exists()).toBe(false)
    expect(wrapper.find(locators.empty).exists()).toBe(true)
  })

  it('shows a translated empty message', () => {
    wrapper = mountList([])

    expect(wrapper.find(locators.empty).text()).toBe('dashboard.showList.empty')
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

  function mountList(shows: ShowSummary[]) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/details/:id', name: RouteNames.DETAILS, component: { template: '<div />' } },
      ],
    })
    const i18n = createI18n({
      legacy: false,
      locale: 'en',
      missingWarn: false,
      fallbackWarn: false,
    })
    return mount(ShowList, {
      props: { shows },
      global: { plugins: [router, i18n] },
    })
  }
})
