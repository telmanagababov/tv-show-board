import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import PersonView from './PersonView.vue'
import { RouteNames } from '@/shared/constants'
import { usePersonStore } from './stores/person.store'
import type { PersonDetails } from '@/shared/types'

vi.mock('./stores/person.store', () => ({
  usePersonStore: vi.fn<() => ReturnType<typeof usePersonStore>>(),
}))

describe('PersonView', () => {
  const locators = {
    back: '[data-testid="back-button"]',
    loading: '[data-testid="person-loading"]',
    error: '[data-testid="person-error"]',
    errorMessage: '[data-testid="error-state-message"]',
    retryButton: '[data-testid="retry-button"]',
    content: '[data-testid="person-content"]',
    name: '[data-testid="person-name"]',
    creditsSection: '[data-testid="person-credits-section"]',
  } as const

  const mockUsePersonStore = vi.mocked(usePersonStore)
  let view: VueWrapper<InstanceType<typeof PersonView>>

  beforeEach(() => {
    view = mountView(makeStore())
  })

  const person: PersonDetails = {
    id: 99,
    name: 'Person Name',
    image: { medium: 'https://example.com/bc-med.jpg', original: 'https://example.com/bc.jpg' },
    birthday: '1956-03-07',
    deathday: null,
    gender: 'Male',
    country: 'United States of America',
    showCredits: [],
  }

  describe('loading state', () => {
    it('shows the loading indicator while fetching', () => {
      view = mountView(makeStore({ loading: true }))
      expect(view.find(locators.loading).exists()).toBe(true)
    })

    it('hides content and error while loading', () => {
      view = mountView(makeStore({ loading: true }))
      expect(view.find(locators.content).exists()).toBe(false)
      expect(view.find(locators.error).exists()).toBe(false)
    })

    it('hides the loading indicator when not loading', () => {
      expect(view.find(locators.loading).exists()).toBe(false)
    })
  })

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

    it('calls fetchPersonDetails again when the retry button is clicked', async () => {
      const store = makeStore({ error: 'errors.network' })
      view = mountView(store)
      await view.find(locators.retryButton).trigger('click')
      expect(store.fetchPersonDetails).toHaveBeenCalledTimes(2)
    })
  })

  describe('person content', () => {
    it('renders the person name', () => {
      view = mountView(makeStore({ person }))
      expect(view.find(locators.name).text()).toBe(person.name)
    })

    it('renders the credits section', () => {
      view = mountView(makeStore({ person }))
      expect(view.find(locators.creditsSection).exists()).toBe(true)
    })

    it('hides the content when person is null', () => {
      expect(view.find(locators.content).exists()).toBe(false)
    })
  })

  describe('data fetching', () => {
    it('calls fetchPersonDetails with the numeric id on mount', () => {
      const store = makeStore()
      mountView(store, '99')
      expect(store.fetchPersonDetails).toHaveBeenCalledWith(99)
    })

    it('calls fetchPersonDetails again when the id prop changes', async () => {
      const store = makeStore()
      view = mountView(store, '99')
      await view.setProps({ id: '42' })
      expect(store.fetchPersonDetails).toHaveBeenCalledWith(42)
    })
  })

  describe('back button', () => {
    it('is always visible', () => {
      expect(view.find(locators.back).exists()).toBe(true)
    })
  })

  interface MockStore {
    person: PersonDetails | null
    loading: boolean
    error: string | null
    fetchPersonDetails: ReturnType<typeof vi.fn>
    clearPersonDetails: ReturnType<typeof vi.fn>
  }

  function makeStore(overrides: Partial<MockStore> = {}): MockStore {
    return {
      person: null,
      loading: false,
      error: null,
      fetchPersonDetails: vi.fn<() => Promise<void>>(),
      clearPersonDetails: vi.fn<() => void>(),
      ...overrides,
    }
  }

  function mountView(store: MockStore, id = '99'): VueWrapper<InstanceType<typeof PersonView>> {
    mockUsePersonStore.mockReturnValue(store as unknown as ReturnType<typeof usePersonStore>)

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/details/:id', name: RouteNames.DETAILS, component: { template: '<div />' } },
        { path: '/people/:id', name: RouteNames.PERSON, props: true, component: PersonView },
      ],
    })

    return mount(PersonView, {
      props: { id },
      global: { plugins: [router, i18n] },
    })
  }
})
