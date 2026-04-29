import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import PersonCard from './PersonCard.vue'
import { RouteNames } from '@/shared/constants'
import type { CastMember } from '@/shared/types'

describe('PersonCard', () => {
  const locators = {
    card: '[data-testid="person-card"]',
    photo: '[data-testid="person-card-photo"]',
    photoFallback: '[data-testid="person-card-photo-fallback"]',
    name: '[data-testid="person-card-name"]',
    character: '[data-testid="person-card-character"]',
    tooltipTrigger: '[data-testid="tooltip-trigger"]',
    tooltipPopup: '[data-testid="tooltip-popup"]',
  } as const

  const person1: CastMember = {
    personId: 1,
    personName: 'Person Name 1',
    personImage: {
      medium: 'https://example.com/bc-med.jpg',
      original: 'https://example.com/bc.jpg',
    },
    characterId: 10,
    characterName: 'Character Name 1',
    voice: false,
    self: false,
  }

  const person2: CastMember = {
    personId: 2,
    personName: 'Person Name 2',
    personImage: null,
    characterId: 11,
    characterName: 'Character Name 2',
    voice: false,
    self: false,
  }

  function mountCard(member: CastMember) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/details/:id', name: RouteNames.DETAILS, component: { template: '<div />' } },
        { path: '/people/:id', name: RouteNames.PERSON, component: { template: '<div />' } },
      ],
    })
    return mount(PersonCard, {
      props: { member },
      global: { plugins: [router, i18n] },
      attachTo: document.body,
    })
  }

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders a link to the person page', () => {
    const wrapper = mountCard(person1)
    const link = wrapper.find(locators.card)

    expect(link.exists()).toBe(true)
    expect(link.attributes('href')).toBe('/people/1')
  })

  it('shows the person photo when an image is available', () => {
    const wrapper = mountCard(person1)

    expect(wrapper.find(locators.photo).exists()).toBe(true)
    expect(wrapper.find(locators.photo).attributes('src')).toBe(person1.personImage!.medium)
    expect(wrapper.find(locators.photoFallback).exists()).toBe(false)
  })

  it('shows the fallback icon when no image is available', () => {
    const wrapper = mountCard(person2)

    expect(wrapper.find(locators.photo).exists()).toBe(false)
    expect(wrapper.find(locators.photoFallback).exists()).toBe(true)
  })

  it('renders the person name', () => {
    const wrapper = mountCard(person1)

    expect(wrapper.find(locators.name).text()).toBe('Person Name 1')
  })

  it('renders the character name', () => {
    const wrapper = mountCard(person1)

    expect(wrapper.find(locators.character).text()).toBe('Character Name 1')
  })

  it('wraps the character name in a tooltip trigger', () => {
    const wrapper = mountCard(person1)

    expect(wrapper.find(locators.tooltipTrigger).exists()).toBe(true)
  })

  it('shows a tooltip with the full character name on hover', async () => {
    const wrapper = mountCard(person1)

    await wrapper.find(locators.tooltipTrigger).trigger('mouseenter')
    await nextTick()

    expect(document.querySelector(locators.tooltipPopup)?.textContent?.trim()).toBe('Character Name 1')
  })

  it('tooltip shows all roles when actor plays multiple characters', async () => {
    const multiRole: CastMember = { ...person1, characterName: 'Role A, Role B' }
    const wrapper = mountCard(multiRole)

    await wrapper.find(locators.tooltipTrigger).trigger('mouseenter')
    await nextTick()

    expect(document.querySelector(locators.tooltipPopup)?.textContent?.trim()).toBe('Role A, Role B')
  })
})
