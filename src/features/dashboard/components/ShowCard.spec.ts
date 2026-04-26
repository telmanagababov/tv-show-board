import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import ShowCard from './ShowCard.vue'
import { RouteNames } from '@/shared/constants/route-names'
import type { ShowSummary } from '@/shared/types/show'

describe('ShowCard', () => {
  const locators = {
    card: '[data-testid="show-card"]',
    previewImage: '[data-testid="show-card-preview-image"]',
    previewImageFallback: '[data-testid="show-card-preview-image-fallback"]',
    rating: '[data-testid="show-card-rating"]',
    title: '[data-testid="show-card-title"]',
    year: '[data-testid="show-card-year"]',
  } as const

  let wrapper: VueWrapper

  beforeEach(() => {
    wrapper = mountCard(makeShow())
  })

  it('renders the card as a link to the detail page', () => {
    expect(wrapper.find(locators.card).attributes('href')).toBe('/details/1')
  })

  it('renders the poster image when artwork is available', () => {
    expect(wrapper.find(locators.previewImage).exists()).toBe(true)
    expect(wrapper.find(locators.previewImage).attributes('src')).toBe('https://example.com/bb.jpg')
    expect(wrapper.find(locators.previewImageFallback).exists()).toBe(false)
  })

  it('renders the fallback placeholder when there is no image', () => {
    wrapper = mountCard(makeShow({ image: null }))

    expect(wrapper.find(locators.previewImage).exists()).toBe(false)
    expect(wrapper.find(locators.previewImageFallback).exists()).toBe(true)
  })

  it('displays the numeric rating when the show is rated', () => {
    expect(wrapper.find(locators.rating).text()).toBe('9.5')
  })

  it('displays an em-dash when the show has no rating', () => {
    wrapper = mountCard(makeShow({ rating: null }))

    expect(wrapper.find(locators.rating).text()).toBe('—')
  })

  it('renders the show title', () => {
    expect(wrapper.find(locators.title).text()).toBe('Breaking Bad')
  })

  it('renders the premiered year when present', () => {
    expect(wrapper.find(locators.year).text()).toBe('2008')
  })

  it('omits the year element when premieredYear is null', () => {
    wrapper = mountCard(makeShow({ premieredYear: null }))

    expect(wrapper.find(locators.year).exists()).toBe(false)
  })

  it('includes an accessible aria-label with the show name and rating', () => {
    expect(wrapper.find(locators.card).attributes('aria-label')).toBe('Breaking Bad, rated 9.5')
  })

  it('shows "rated —" in the aria-label when there is no rating', () => {
    wrapper = mountCard(makeShow({ name: 'Some Show', rating: null }))

    expect(wrapper.find(locators.card).attributes('aria-label')).toBe('Some Show, rated —')
  })

  function makeShow(overrides: Partial<ShowSummary> = {}): ShowSummary {
    return {
      id: 1,
      name: 'Breaking Bad',
      genres: ['Drama', 'Crime'],
      rating: 9.5,
      summaryHtml: '<p>A chemistry teacher turns drug lord.</p>',
      summaryText: 'A chemistry teacher turns drug lord.',
      image: { medium: 'https://example.com/bb.jpg', original: 'https://example.com/bb-orig.jpg' },
      premieredYear: 2008,
      status: 'ended',
      language: 'English',
      network: 'AMC',
      ...overrides,
    }
  }

  function mountCard(show: ShowSummary) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/details/:id', name: RouteNames.DETAILS, component: { template: '<div />' } },
      ],
    })
    return mount(ShowCard, {
      props: { show },
      global: { plugins: [router] },
    })
  }
})
