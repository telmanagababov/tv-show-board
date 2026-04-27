import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'

import Tooltip from './Tooltip.vue'

describe('Tooltip', () => {
  const locators = {
    trigger: '[data-testid="tooltip-trigger"]',
    popup: '[data-testid="tooltip-popup"]',
  } as const

  let view: VueWrapper<InstanceType<typeof Tooltip>>

  beforeEach(() => {
    view = mount(Tooltip, {
      props: { text: 'Helpful hint' },
      slots: { default: '<span>Hover me</span>' },
      attachTo: document.body,
    })
  })

  afterEach(() => {
    view.unmount()
  })

  it('renders the slot content', () => {
    expect(view.find(locators.trigger).text()).toBe('Hover me')
  })

  it('does not render the tooltip popup initially', () => {
    expect(document.querySelector(locators.popup)).toBeNull()
  })

  it('shows the tooltip popup on mouseenter', async () => {
    await view.find(locators.trigger).trigger('mouseenter')

    expect(document.querySelector(locators.popup)).not.toBeNull()
  })

  it('displays the text prop inside the popup', async () => {
    await view.find(locators.trigger).trigger('mouseenter')

    expect(document.querySelector(locators.popup)?.textContent?.trim()).toBe('Helpful hint')
  })

  it('hides the tooltip popup on mouseleave', async () => {
    await view.find(locators.trigger).trigger('mouseenter')
    await view.find(locators.trigger).trigger('mouseleave')
    await nextTick()

    expect(document.querySelector(locators.popup)).toBeNull()
  })

  it('has role="tooltip" on the popup', async () => {
    await view.find(locators.trigger).trigger('mouseenter')

    expect(document.querySelector(locators.popup)?.getAttribute('role')).toBe('tooltip')
  })
})
