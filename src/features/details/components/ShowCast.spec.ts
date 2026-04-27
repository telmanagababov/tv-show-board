import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import '@/features/details/i18n'
import { i18n } from '@/shared/i18n'
import ShowCast from './ShowCast.vue'
import type { CastMember } from '@/shared/types/show'

describe('ShowCast', () => {
  const locators = {
    member: '[data-testid="details-cast-member"]',
  } as const

  const cranston: CastMember = {
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
  }

  const paul: CastMember = {
    personId: 2,
    personName: 'Aaron Paul',
    personImage: null,
    characterId: 11,
    characterName: 'Jesse Pinkman',
    voice: false,
    self: false,
  }

  function mountCast(cast: CastMember[]) {
    return mount(ShowCast, { props: { cast }, global: { plugins: [i18n] } })
  }

  it('renders a non-empty section heading', () => {
    expect(mountCast([cranston]).find('h2').text()).toBeTruthy()
  })

  it('renders one list item per cast member', () => {
    expect(mountCast([cranston, paul]).findAll(locators.member)).toHaveLength(2)
  })

  it('renders the person name inside the card', () => {
    expect(mountCast([cranston]).find(locators.member).text()).toContain('Bryan Cranston')
  })

  it('renders the character name inside the card', () => {
    expect(mountCast([cranston]).find(locators.member).text()).toContain('Walter White')
  })

  it('renders the person image when one is available', () => {
    const img = mountCast([cranston]).find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe(cranston.personImage!.medium)
  })

  it('renders the fallback icon when person image is null', () => {
    expect(mountCast([paul]).find('img').exists()).toBe(false)
  })
})
