import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import { i18n } from '@/shared/i18n'
import OfflineBanner from './OfflineBanner.vue'

describe('OfflineBanner', () => {
  const locators = {
    banner: '[data-testid="offline-banner"]',
  } as const

  let view: VueWrapper<InstanceType<typeof OfflineBanner>>

  beforeEach(() => {
    view = mount(OfflineBanner, {
      global: { plugins: [i18n] },
    })
  })

  it('renders the banner element', () => {
    expect(view.find(locators.banner).exists()).toBe(true)
  })

  it('has role="status" for assistive technology', () => {
    expect(view.find(locators.banner).attributes('role')).toBe('status')
  })

  it('has aria-live="polite" so screen readers announce it', () => {
    expect(view.find(locators.banner).attributes('aria-live')).toBe('polite')
  })

  it('displays the offline i18n message', () => {
    expect(view.find(locators.banner).text()).toContain('offline')
  })
})
