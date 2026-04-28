import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import { RouteNames } from '@/shared/constants'
import NotFoundView from './NotFoundView.vue'

describe('NotFoundView', () => {
  const locators = {
    heading: '[data-testid="not-found-heading"]',
    message: '[data-testid="not-found-message"]',
    link: '[data-testid="not-found-link"]',
  } as const

  let view: VueWrapper<InstanceType<typeof NotFoundView>>

  beforeEach(() => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } }],
    })
    view = mount(NotFoundView, {
      global: { plugins: [router, i18n] },
    })
  })

  it('displays 404', () => {
    expect(view.find(locators.heading).text()).toBe('404')
  })

  it('displays the page-not-found message', () => {
    expect(view.find(locators.message).text()).toBeTruthy()
  })

  it('renders a link back to the dashboard', () => {
    expect(view.find(locators.link).exists()).toBe(true)
  })
})
