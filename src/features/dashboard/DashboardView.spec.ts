import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import { i18n } from '@/shared/i18n'
import DashboardView from './DashboardView.vue'

describe('DashboardView', () => {
  const locators = {
    title: '[data-testid="dashboard-title"]',
    subtitle: '[data-testid="dashboard-subtitle"]',
  } as const
  let view: VueWrapper<InstanceType<typeof DashboardView>>

  beforeEach(() => {
    view = mount(DashboardView, {
      global: { plugins: [i18n] },
    })
  })

  it('displays the dashboard title', () => {
    expect(view.find(locators.title).text()).toBeTruthy()
  })

  it('displays the dashboard subtitle', () => {
    expect(view.find(locators.subtitle).text()).toBeTruthy()
  })
})
