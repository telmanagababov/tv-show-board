import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import { i18n } from '@/shared/i18n'
import LoadingIndicator from './LoadingIndicator.vue'

describe('LoadingIndicator', () => {
  const locators = {
    indicator: '[data-testid="loading-indicator"]',
  } as const

  let view: VueWrapper<InstanceType<typeof LoadingIndicator>>

  beforeEach(() => {
    view = mount(LoadingIndicator, {
      global: { plugins: [i18n] },
    })
  })

  it('renders the loading text', () => {
    expect(view.find(locators.indicator).text()).toBeTruthy()
  })

  it('has role="status" for screen readers', () => {
    expect(view.find(locators.indicator).attributes('role')).toBe('status')
  })

  it('defaults to the md size class', () => {
    expect(view.find(locators.indicator).classes()).toContain('text-base')
  })

  it('applies the sm size class when size="sm"', () => {
    view = mount(LoadingIndicator, {
      props: { size: 'sm' },
      global: { plugins: [i18n] },
    })

    expect(view.find(locators.indicator).classes()).toContain('text-sm')
  })

  it('applies the lg size class when size="lg"', () => {
    view = mount(LoadingIndicator, {
      props: { size: 'lg' },
      global: { plugins: [i18n] },
    })

    expect(view.find(locators.indicator).classes()).toContain('text-xl')
  })
})
