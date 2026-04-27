import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import DetailsView from './DetailsView.vue'
import { RouteNames } from '@/shared/constants/route-names'
import { useShowDetailsStore } from './stores/show-detail.store'
import type { ShowDetails } from '@/shared/types/show'

vi.mock('./stores/show-detail.store', () => ({
  useShowDetailsStore: vi.fn(),
}))

describe('DetailsView', () => {
  const locators = {
    back: '[data-testid="details-back"]',
    loading: '[data-testid="details-loading"]',
    error: '[data-testid="details-error"]',
    errorMessage: '[data-testid="error-state-message"]',
    retryButton: '[data-testid="retry-button"]',
    content: '[data-testid="details-content"]',
    title: '[data-testid="details-title"]',
    rating: '[data-testid="details-rating"]',
    status: '[data-testid="details-status"]',
    network: '[data-testid="details-network"]',
    genres: '[data-testid="details-genres"]',
    summarySection: '[data-testid="details-summary-section"]',
    summary: '[data-testid="details-summary"]',
    castSection: '[data-testid="details-cast-section"]',
    castMember: '[data-testid="details-cast-member"]',
    poster: '[data-testid="details-poster"]',
    posterFallback: '[data-testid="details-poster-fallback"]',
    officialSite: '[data-testid="details-official-site"]',
    schedule: '[data-testid="details-schedule"]',
  } as const

  const mockUseShowDetailsStore = vi.mocked(useShowDetailsStore)
  let view: VueWrapper<InstanceType<typeof DetailsView>>

  beforeEach(() => {
    view = mountView(makeStore())
  })

  describe('loading state', () => {
    it('shows the loading indicator while fetching', () => {
      view = mountView(makeStore({ loading: true }))
      expect(view.find(locators.loading).exists()).toBe(true)
    })

    it('hides the content and error while loading', () => {
      view = mountView(makeStore({ loading: true }))
      expect(view.find(locators.content).exists()).toBe(false)
      expect(view.find(locators.error).exists()).toBe(false)
    })

    it('hides the loading indicator when not loading', () => {
      expect(view.find(locators.loading).exists()).toBe(false)
    })
  })

  // ── error state ────────────────────────────────────────────────────────────

  describe('error state', () => {
    it('shows the error block when the store has an error', () => {
      view = mountView(makeStore({ error: 'errors.network' }))
      expect(view.find(locators.error).exists()).toBe(true)
    })

    it('hides content and loading in the error state', () => {
      view = mountView(makeStore({ error: 'errors.network' }))
      expect(view.find(locators.content).exists()).toBe(false)
      expect(view.find(locators.loading).exists()).toBe(false)
    })

    it('renders a non-empty translated error message', () => {
      view = mountView(makeStore({ error: 'errors.network' }))
      expect(view.find(locators.errorMessage).text()).toBeTruthy()
    })

    it('calls fetchDetails again when the retry button is clicked', async () => {
      const store = makeStore({ error: 'errors.network' })
      view = mountView(store)
      await view.find(locators.retryButton).trigger('click')
      // 1st call: immediate watcher on mount; 2nd call: retry button
      expect(store.fetchDetails).toHaveBeenCalledTimes(2)
    })
  })

  // ── show content ───────────────────────────────────────────────────────────

  describe('show content', () => {
    it('renders the show title', () => {
      view = mountView(makeStore({ details: breakingBad }))
      expect(view.find(locators.title).text()).toBe('Breaking Bad')
    })

    it('renders the rating badge with the correct value', () => {
      view = mountView(makeStore({ details: breakingBad }))
      expect(view.find(locators.rating).text()).toContain('9.9')
    })

    it('renders the status badge', () => {
      view = mountView(makeStore({ details: breakingBad }))
      expect(view.find(locators.status).text()).toBeTruthy()
    })

    it('renders the network in the metadata table', () => {
      view = mountView(makeStore({ details: breakingBad }))
      expect(view.find(locators.network).text()).toBe('AMC')
    })

    it('renders genre pills', () => {
      view = mountView(makeStore({ details: breakingBad }))
      expect(view.find(locators.genres).exists()).toBe(true)
    })

    it('renders one pill per genre', () => {
      view = mountView(makeStore({ details: breakingBad }))
      const pills = view.find(locators.genres).findAll('span')
      expect(pills).toHaveLength(breakingBad.genres.length)
    })

    it('renders the schedule', () => {
      view = mountView(makeStore({ details: breakingBad }))
      const scheduleText = view.find(locators.schedule).text()
      const expectedTime = new Intl.DateTimeFormat('en', {
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(2000, 0, 1, 21, 0))
      expect(scheduleText).toContain('Sunday')
      expect(scheduleText).toContain(expectedTime)
    })

    it('renders the summary section when summaryHtml is present', () => {
      view = mountView(makeStore({ details: breakingBad }))
      expect(view.find(locators.summarySection).exists()).toBe(true)
    })

    it('hides the summary section when summaryHtml is empty', () => {
      view = mountView(makeStore({ details: { ...breakingBad, summaryHtml: '' } }))
      expect(view.find(locators.summarySection).exists()).toBe(false)
    })

    it('renders the poster image when available', () => {
      view = mountView(makeStore({ details: breakingBad }))
      expect(view.find(locators.poster).exists()).toBe(true)
      expect(view.find(locators.posterFallback).exists()).toBe(false)
    })

    it('renders the poster fallback when the show has no image', () => {
      view = mountView(makeStore({ details: { ...breakingBad, image: null } }))
      expect(view.find(locators.poster).exists()).toBe(false)
      expect(view.find(locators.posterFallback).exists()).toBe(true)
    })

    it('renders the official site link when present', () => {
      view = mountView(makeStore({ details: breakingBad }))
      expect(view.find(locators.officialSite).exists()).toBe(true)
    })

    it('hides the official site link when officialSite is null', () => {
      view = mountView(makeStore({ details: { ...breakingBad, officialSite: null } }))
      expect(view.find(locators.officialSite).exists()).toBe(false)
    })
  })

  describe('cast section', () => {
    it('renders one card per cast member', () => {
      view = mountView(makeStore({ details: showWithCast }))
      expect(view.findAll(locators.castMember)).toHaveLength(1)
    })

    it('hides the cast section when the cast array is empty', () => {
      view = mountView(makeStore({ details: breakingBad }))
      expect(view.find(locators.castSection).exists()).toBe(false)
    })
  })

  describe('data fetching', () => {
    it('calls fetchDetails with the numeric id on mount', () => {
      const store = makeStore()
      mountView(store, '42')
      expect(store.fetchDetails).toHaveBeenCalledWith(42)
    })

    it('calls fetchDetails again when the id prop changes', async () => {
      const store = makeStore()
      view = mountView(store, '42')
      await view.setProps({ id: '99' })
      expect(store.fetchDetails).toHaveBeenCalledWith(99)
    })
  })

  describe('back button', () => {
    it('is always visible', () => {
      expect(view.find(locators.back).exists()).toBe(true)
    })
  })

  const breakingBad: ShowDetails = {
    id: 169,
    name: 'Breaking Bad',
    genres: ['Drama', 'Crime', 'Thriller'],
    rating: 9.9,
    summaryHtml: '<p>Chemistry teacher turns drug lord.</p>',
    summaryText: 'Chemistry teacher turns drug lord.',
    image: { medium: 'https://example.com/bb-med.jpg', original: 'https://example.com/bb.jpg' },
    premieredYear: 2008,
    status: 'ended',
    language: 'English',
    network: 'AMC',
    officialSite: 'https://www.amc.com/shows/breaking-bad',
    schedule: { time: '21:00', days: ['Sunday'] },
    cast: [],
    images: [],
  }

  const showWithCast: ShowDetails = {
    ...breakingBad,
    cast: [
      {
        personId: 1,
        personName: 'Bryan Cranston',
        personImage: {
          medium: 'https://example.com/bc-med.jpg',
          original: 'https://example.com/bc.jpg',
        },
        characterId: 10,
        characterName: 'Walter White',
        voice: false,
        self: false,
      },
    ],
  }

  interface MockStore {
    details: ShowDetails | null
    loading: boolean
    error: string | null
    fetchDetails: ReturnType<typeof vi.fn>
    clearDetails: ReturnType<typeof vi.fn>
  }

  function makeStore(overrides: Partial<MockStore> = {}): MockStore {
    return {
      details: null,
      loading: false,
      error: null,
      fetchDetails: vi.fn(),
      clearDetails: vi.fn(),
      ...overrides,
    }
  }

  function mountView(store: MockStore, id = '42'): VueWrapper<InstanceType<typeof DetailsView>> {
    mockUseShowDetailsStore.mockReturnValue(store as unknown as ReturnType<typeof useShowDetailsStore>)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        {
          path: '/details/:id',
          name: RouteNames.DETAILS,
          props: true,
          component: DetailsView,
        },
      ],
    })

    return mount(DetailsView, {
      props: { id },
      global: { plugins: [router, i18n] },
    })
  }
})
