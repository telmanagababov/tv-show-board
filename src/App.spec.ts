import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import App from './App.vue'

describe('App', () => {
  const locators = {
    routerView: '[data-testid="app-router-view"]',
  } as const

  let view: VueWrapper<InstanceType<typeof App>>

  beforeEach(() => {
    view = mount(App, {
      global: { stubs: { RouterView: true } },
    })
  })

  it('renders a RouterView', () => {
    expect(view.find(locators.routerView).exists()).toBe(true)
  })
})
