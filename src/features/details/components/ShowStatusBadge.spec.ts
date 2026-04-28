import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { i18n } from '@/shared/i18n'
import ShowStatusBadge from './ShowStatusBadge.vue'

describe('ShowStatusBadge', () => {
  const locator = '[data-testid="details-status"]'

  function mountBadge(status: 'running' | 'ended' | 'upcoming') {
    return mount(ShowStatusBadge, { props: { status }, global: { plugins: [i18n] } })
  }

  it('renders "Running" for status "running"', () => {
    expect(mountBadge('running').find(locator).text()).toBe('Running')
  })

  it('renders "Ended" for status "ended"', () => {
    expect(mountBadge('ended').find(locator).text()).toBe('Ended')
  })

  it('renders "Upcoming" for status "upcoming"', () => {
    expect(mountBadge('upcoming').find(locator).text()).toBe('Upcoming')
  })
})
