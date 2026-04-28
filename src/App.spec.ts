import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import { i18n } from '@/shared/i18n'
import { RouteNames } from '@/shared/constants'
import App from './App.vue'

describe('App', () => {
  const locators = {
    header: '[data-testid="app-header"]',
    mainContent: '[data-testid="app-main-content"]',
  } as const

  let view: VueWrapper<InstanceType<typeof App>>

  beforeEach(() => {
    view = mountApp()
  })

  it('renders the header', () => {
    expect(view.find(locators.header).exists()).toBe(true)
  })

  it('renders the main content', () => {
    expect(view.find(locators.mainContent).exists()).toBe(true)
  })

  function mountApp() {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: RouteNames.DASHBOARD, component: { template: '<div />' } }],
    })
    return mount(App, {
      global: {
        plugins: [i18n, router],
        stubs: {
          AppHeader: true,
          RenderErrorBoundary: { template: '<slot />' },
        },
      },
    })
  }
})
