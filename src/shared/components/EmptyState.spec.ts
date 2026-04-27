import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import EmptyState from './EmptyState.vue'

describe('EmptyState', () => {
  const locators = {
    message: '[data-testid="empty-state-message"]',
  } as const

  let view: VueWrapper<InstanceType<typeof EmptyState>>

  beforeEach(() => {
    view = mount(EmptyState, {
      props: { message: 'No shows found' },
    })
  })

  it('renders the message prop', () => {
    expect(view.find(locators.message).text()).toBe('No shows found')
  })

  it('updates when the message prop changes', async () => {
    await view.setProps({ message: 'Nothing here yet' })

    expect(view.find(locators.message).text()).toBe('Nothing here yet')
  })
})
