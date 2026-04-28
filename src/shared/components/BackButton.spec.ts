import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import BackButton from './BackButton.vue'
import { RouteNames } from '@/shared/constants'

describe('BackButton', () => {
  const locators = {
    button: '[data-testid="back-button"]',
  } as const

  it('renders a button element', () => {
    const { wrapper } = mountButton()

    expect(wrapper.find(locators.button).exists()).toBe(true)
    expect(wrapper.find(locators.button).element.tagName).toBe('BUTTON')
  })

  it('has the correct data-testid', () => {
    const { wrapper } = mountButton()

    expect(wrapper.find(locators.button).attributes('data-testid')).toBe('back-button')
  })

  it('renders a non-empty back label', () => {
    const { wrapper } = mountButton()

    expect(wrapper.find(locators.button).text()).toBeTruthy()
  })

  it('calls router.back() when clicked', async () => {
    const { wrapper, router } = mountButton()
    const backSpy = vi.spyOn(router, 'back').mockImplementation(() => {})

    await wrapper.find(locators.button).trigger('click')

    expect(backSpy).toHaveBeenCalledOnce()
  })

  it('has type="button" to prevent unintended form submission', () => {
    const { wrapper } = mountButton()

    expect(wrapper.find(locators.button).attributes('type')).toBe('button')
  })

  function mountButton() {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } }],
    })
    return { wrapper: mount(BackButton, { global: { plugins: [router, i18n] } }), router }
  }
})
