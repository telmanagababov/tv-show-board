import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import { i18n } from '@/shared/i18n'
import ErrorState from './ErrorState.vue'

describe('ErrorState', () => {
  const locators = {
    message: '[data-testid="error-state-message"]',
    retry: '[data-testid="retry-button"]',
  } as const

  let view: VueWrapper<InstanceType<typeof ErrorState>>

  beforeEach(() => {
    view = mount(ErrorState, {
      props: { message: 'Something went wrong' },
      global: { plugins: [i18n] },
    })
  })

  it('renders the message prop', () => {
    expect(view.find(locators.message).text()).toBe('Something went wrong')
  })

  it('renders the retry button with translated text', () => {
    expect(view.find(locators.retry).text()).toBeTruthy()
  })

  it('emits the retry event when the retry button is clicked', async () => {
    await view.find(locators.retry).trigger('click')

    expect(view.emitted('retry')).toHaveLength(1)
  })

  it('updates when the message prop changes', async () => {
    await view.setProps({ message: 'Network error' })

    expect(view.find(locators.message).text()).toBe('Network error')
  })
})
