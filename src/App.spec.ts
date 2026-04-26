import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import App from './App.vue'

describe('App', () => {
  const locators = {
    header: '[data-testid="app-header"]',
    mainContent: '[data-testid="app-main-content"]',
  } as const

  let view: VueWrapper<InstanceType<typeof App>>

  beforeEach(() => {
    view = mount(App, {
      global: {
        stubs: {
          RouterView: true,
          AppHeader: true,
        },
      },
    })
  })

  it('renders the header', () => {
    expect(view.find(locators.header).exists()).toBe(true)
  })
  it('renders the main content', () => {
    expect(view.find(locators.mainContent).exists()).toBe(true)
  })
})
