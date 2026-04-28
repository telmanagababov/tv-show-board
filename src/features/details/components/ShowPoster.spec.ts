import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import ShowPoster from './ShowPoster.vue'
import type { ShowImage } from '@/shared/types'

describe('ShowPoster', () => {
  const locators = {
    poster: '[data-testid="details-poster"]',
    fallback: '[data-testid="details-poster-fallback"]',
  } as const

  const image: ShowImage = {
    medium: 'https://example.com/bb-med.jpg',
    original: 'https://example.com/bb.jpg',
  }

  describe('when image is provided', () => {
    it('renders the img element', () => {
      const wrapper = mount(ShowPoster, { props: { image, name: 'Breaking Bad' } })
      expect(wrapper.find(locators.poster).exists()).toBe(true)
    })

    it('uses the original url as src', () => {
      const wrapper = mount(ShowPoster, { props: { image, name: 'Breaking Bad' } })
      expect(wrapper.find(locators.poster).attributes('src')).toBe(image.original)
    })

    it('uses the show name as alt text', () => {
      const wrapper = mount(ShowPoster, { props: { image, name: 'Breaking Bad' } })
      expect(wrapper.find(locators.poster).attributes('alt')).toBe('Breaking Bad')
    })

    it('does not render the fallback', () => {
      const wrapper = mount(ShowPoster, { props: { image, name: 'Breaking Bad' } })
      expect(wrapper.find(locators.fallback).exists()).toBe(false)
    })
  })

  describe('when image is null', () => {
    it('renders the fallback placeholder', () => {
      const wrapper = mount(ShowPoster, { props: { image: null, name: 'Breaking Bad' } })
      expect(wrapper.find(locators.fallback).exists()).toBe(true)
    })

    it('does not render the img element', () => {
      const wrapper = mount(ShowPoster, { props: { image: null, name: 'Breaking Bad' } })
      expect(wrapper.find(locators.poster).exists()).toBe(false)
    })
  })
})
