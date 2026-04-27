import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import '@/features/details/i18n'
import { i18n } from '@/shared/i18n'
import ShowInfo from './ShowInfo.vue'
import type { ShowDetails } from '@/shared/types/show'

describe('ShowInfo', () => {
  const locators = {
    title: '[data-testid="details-title"]',
    rating: '[data-testid="details-rating"]',
    status: '[data-testid="details-status"]',
    premiered: '[data-testid="details-premiered"]',
    network: '[data-testid="details-network"]',
    language: '[data-testid="details-language"]',
    schedule: '[data-testid="details-schedule"]',
    genres: '[data-testid="details-genres"]',
    officialSite: '[data-testid="details-official-site"]',
  } as const

  const breakingBad: ShowDetails = {
    id: 169,
    name: 'Breaking Bad',
    genres: ['Drama', 'Crime'],
    rating: 9.9,
    summaryHtml: '<p>A chemistry teacher turns drug lord.</p>',
    summaryText: 'A chemistry teacher turns drug lord.',
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

  function mountInfo(overrides: Partial<ShowDetails> = {}) {
    return mount(ShowInfo, {
      props: { show: { ...breakingBad, ...overrides } },
      global: { plugins: [i18n] },
    })
  }

  it('renders the show title', () => {
    expect(mountInfo().find(locators.title).text()).toBe('Breaking Bad')
  })

  it('renders the formatted rating', () => {
    expect(mountInfo().find(locators.rating).text()).toContain('9.9')
  })

  it('renders "—" when the rating is null', () => {
    expect(mountInfo({ rating: null }).find(locators.rating).text()).toContain('—')
  })

  it('renders the status badge', () => {
    expect(mountInfo().find(locators.status).text()).toBeTruthy()
  })

  it('renders the premiered year', () => {
    expect(mountInfo().find(locators.premiered).text()).toBe('2008')
  })

  it('hides the premiered row when premieredYear is null', () => {
    expect(mountInfo({ premieredYear: null }).find(locators.premiered).exists()).toBe(false)
  })

  it('renders the network', () => {
    expect(mountInfo().find(locators.network).text()).toBe('AMC')
  })

  it('hides the network row when network is null', () => {
    expect(mountInfo({ network: null }).find(locators.network).exists()).toBe(false)
  })

  it('renders the language', () => {
    expect(mountInfo().find(locators.language).text()).toBe('English')
  })

  it('hides the language row when language is null', () => {
    expect(mountInfo({ language: null }).find(locators.language).exists()).toBe(false)
  })

  it('renders the localized schedule containing the day name', () => {
    expect(mountInfo().find(locators.schedule).text()).toContain('Sunday')
  })

  it('hides the schedule row when days and time are both empty', () => {
    expect(
      mountInfo({ schedule: { days: [], time: '' } })
        .find(locators.schedule)
        .exists(),
    ).toBe(false)
  })

  it('renders one pill per genre', () => {
    expect(mountInfo().find(locators.genres).findAll('span')).toHaveLength(2)
  })

  it('hides the genres block when the genres array is empty', () => {
    expect(mountInfo({ genres: [] }).find(locators.genres).exists()).toBe(false)
  })

  it('renders the official site link', () => {
    expect(mountInfo().find(locators.officialSite).exists()).toBe(true)
  })

  it('hides the official site link when officialSite is null', () => {
    expect(mountInfo({ officialSite: null }).find(locators.officialSite).exists()).toBe(false)
  })

  it('includes the show name in the sr-only span for an accessible link name', () => {
    const srOnly = mountInfo().find(`${locators.officialSite} .sr-only`)
    expect(srOnly.text()).toContain('Breaking Bad')
  })
})
