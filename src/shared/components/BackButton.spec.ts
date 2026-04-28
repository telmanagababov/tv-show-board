import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import BackButton from './BackButton.vue'
import { RouteNames } from '@/shared/constants/route-names'

describe('BackButton', () => {
  const locators = {
    button: '[data-testid="back-button"]',
  } as const

  it('renders an anchor element', () => {
    const { wrapper } = mountButton()

    expect(wrapper.find(locators.button).exists()).toBe(true)
    expect(wrapper.find(locators.button).element.tagName).toBe('A')
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

  it('prevents default anchor navigation on click', async () => {
    const { wrapper } = mountButton()
    let defaultPrevented = false
    wrapper.find(locators.button).element.addEventListener('click', (e) => {
      defaultPrevented = e.defaultPrevented
    })

    await wrapper.find(locators.button).trigger('click')

    expect(defaultPrevented).toBe(true)
  })

  function mountButton() {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } }],
    })
    return { wrapper: mount(BackButton, { global: { plugins: [router, i18n] } }), router }
  }
})
