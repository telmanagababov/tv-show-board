import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import GenreSection from './GenreSection.vue'
import { RouteNames } from '@/shared/constants'
import type { ShowSummary } from '@/shared/types'

describe('GenreSection', () => {
  const locators = {
    section: '[data-testid="genre-section"]',
    heading: '[data-testid="genre-section-heading"]',
    list: '[data-testid="show-list"]',
    empty: '[data-testid="show-list-empty"]',
  } as const

  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountSection('Drama', makeShows(3))
  })

  it('renders the section element', () => {
    expect(wrapper.find(locators.section).exists()).toBe(true)
  })

  it('displays the translated genre name in the heading', () => {
    expect(wrapper.find(locators.heading).text()).toBe('Drama')
  })

  it('translates Science-Fiction to the human-readable label in the heading', () => {
    wrapper = mountSection('Science-Fiction', makeShows(1))

    expect(wrapper.find(locators.heading).text()).toBe('Science Fiction')
  })

  it('sets aria-label on the section using the translated genre name', () => {
    const label = wrapper.find(locators.section).attributes('aria-label')

    expect(label).toBe('Drama shows')
  })

  it('forwards the same aria-label to the ShowList', () => {
    const listLabel = wrapper.find(locators.list).attributes('aria-label')

    expect(listLabel).toBe('Drama shows')
  })

  it('renders the ShowList when shows are provided', () => {
    expect(wrapper.find(locators.list).exists()).toBe(true)
    expect(wrapper.find(locators.empty).exists()).toBe(false)
  })

  it('renders the ShowList empty state when no shows are provided', () => {
    wrapper = mountSection('Drama', [])

    expect(wrapper.find(locators.list).exists()).toBe(false)
    expect(wrapper.find(locators.empty).exists()).toBe(true)
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

  function mountSection(genre: string, shows: ShowSummary[]) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/details/:id', name: RouteNames.DETAILS, component: { template: '<div />' } },
      ],
    })
    return mount(GenreSection, {
      props: { genre, shows },
      global: { plugins: [router, i18n] },
    })
  }
})
