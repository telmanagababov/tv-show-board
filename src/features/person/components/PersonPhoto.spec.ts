import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PersonPhoto from './PersonPhoto.vue'
import type { ShowImage } from '@/shared/types/show'

describe('PersonPhoto', () => {
  const locators = {
    photo: '[data-testid="person-photo"]',
    fallback: '[data-testid="person-photo-fallback"]',
  } as const

  const image: ShowImage = {
    medium: 'https://example.com/bc-med.jpg',
    original: 'https://example.com/bc-orig.jpg',
  }

  it('renders the photo when an image is provided', () => {
    const wrapper = mount(PersonPhoto, { props: { image, name: 'Person Name' } })

    expect(wrapper.find(locators.photo).exists()).toBe(true)
    expect(wrapper.find(locators.fallback).exists()).toBe(false)
  })

  it('uses the original image URL as the src', () => {
    const wrapper = mount(PersonPhoto, { props: { image, name: 'Person Name' } })

    expect(wrapper.find(locators.photo).attributes('src')).toBe(image.original)
  })

  it('sets the alt attribute to the person name', () => {
    const wrapper = mount(PersonPhoto, { props: { image, name: 'Person Name' } })

    expect(wrapper.find(locators.photo).attributes('alt')).toBe('Person Name')
  })

  it('renders the fallback when image is null', () => {
    const wrapper = mount(PersonPhoto, { props: { image: null, name: 'Person Name' } })

    expect(wrapper.find(locators.photo).exists()).toBe(false)
    expect(wrapper.find(locators.fallback).exists()).toBe(true)
  })
})
