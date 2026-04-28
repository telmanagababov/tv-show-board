import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import '../i18n'
import { i18n } from '@/shared/i18n'
import PersonInfo from './PersonInfo.vue'
import type { PersonDetails } from '@/shared/types'

describe('PersonInfo', () => {
  const locators = {
    name: '[data-testid="person-name"]',
    birthday: '[data-testid="person-birthday"]',
    deathday: '[data-testid="person-deathday"]',
    gender: '[data-testid="person-gender"]',
    country: '[data-testid="person-country"]',
  } as const

  it('renders the person name', () => {
    const wrapper = mountInfo(makePerson())

    expect(wrapper.find(locators.name).text()).toBe('Person Name')
  })

  it('renders the birthday when present', () => {
    const wrapper = mountInfo(makePerson({ birthday: '1956-03-07' }))

    expect(wrapper.find(locators.birthday).exists()).toBe(true)
    expect(wrapper.find(locators.birthday).text()).toBe('1956-03-07')
  })

  it('hides the birthday when null', () => {
    const wrapper = mountInfo(makePerson({ birthday: null }))

    expect(wrapper.find(locators.birthday).exists()).toBe(false)
  })

  it('renders the deathday when present', () => {
    const wrapper = mountInfo(makePerson({ deathday: '2024-01-01' }))

    expect(wrapper.find(locators.deathday).exists()).toBe(true)
    expect(wrapper.find(locators.deathday).text()).toBe('2024-01-01')
  })

  it('hides the deathday when null', () => {
    const wrapper = mountInfo(makePerson({ deathday: null }))

    expect(wrapper.find(locators.deathday).exists()).toBe(false)
  })

  it('renders the gender when present', () => {
    const wrapper = mountInfo(makePerson({ gender: 'Female' }))

    expect(wrapper.find(locators.gender).exists()).toBe(true)
    expect(wrapper.find(locators.gender).text()).toBe('Female')
  })

  it('hides the gender when null', () => {
    const wrapper = mountInfo(makePerson({ gender: null }))

    expect(wrapper.find(locators.gender).exists()).toBe(false)
  })

  it('renders the country when present', () => {
    const wrapper = mountInfo(makePerson({ country: 'United States of America' }))

    expect(wrapper.find(locators.country).exists()).toBe(true)
    expect(wrapper.find(locators.country).text()).toBe('United States of America')
  })

  it('hides the country when null', () => {
    const wrapper = mountInfo(makePerson({ country: null }))

    expect(wrapper.find(locators.country).exists()).toBe(false)
  })

  function makePerson(overrides: Partial<PersonDetails> = {}): PersonDetails {
    return {
      id: 99,
      name: 'Person Name',
      image: null,
      birthday: '1956-03-07',
      deathday: null,
      gender: 'Male',
      country: 'United States of America',
      showCredits: [],
      ...overrides,
    }
  }

  function mountInfo(person: PersonDetails) {
    return mount(PersonInfo, {
      props: { person },
      global: { plugins: [i18n] },
    })
  }
})
