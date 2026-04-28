import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import '../i18n'
import { i18n } from '@/shared/i18n'
import ShowCast from './ShowCast.vue'
import { RouteNames } from '@/shared/constants'
import type { CastMember } from '@/shared/types'

describe('ShowCast', () => {
  const locators = {
    member: '[data-testid="details-cast-member"]',
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

  function mountCast(cast: CastMember[]) {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } },
        { path: '/details/:id', name: RouteNames.DETAILS, component: { template: '<div />' } },
        { path: '/people/:id', name: RouteNames.PERSON, component: { template: '<div />' } },
      ],
    })
    return mount(ShowCast, { props: { cast }, global: { plugins: [router, i18n] } })
  }

  it('renders a non-empty section heading', () => {
    expect(mountCast([person1]).find('h2').text()).toBeTruthy()
  })

  it('renders one list item per cast member', () => {
    expect(mountCast([person1, person2]).findAll(locators.member)).toHaveLength(2)
  })

  it('renders the person name inside the card', () => {
    expect(mountCast([person1]).find(locators.member).text()).toContain(person1.personName)
  })

  it('renders the character name inside the card', () => {
    expect(mountCast([person1]).find(locators.member).text()).toContain(person1.characterName)
  })

  it('renders the person image when one is available', () => {
    const img = mountCast([person1]).find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(person1.personImage!.medium)
  })

  it('renders the fallback icon when person image is null', () => {
    expect(mountCast([person2]).find('img').exists()).toBe(false)
  })
})
