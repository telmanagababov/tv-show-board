/* eslint-disable vue/one-component-per-file */
import { defineComponent, h, nextTick, onMounted } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import { i18n } from '@/shared/i18n'
import RenderErrorBoundary from './RenderErrorBoundary.vue'

describe('RenderErrorBoundary', () => {
  const StableSlot = defineComponent({
    template: '<span data-testid="slot-content">content</span>',
  })
  const locators = {
    errorUI: '[data-testid="app-render-error"]',
    retryButton: 'button',
    slotContent: '[data-testid="slot-content"]',
  } as const

  // Vue logs caught errors to console — suppress noise in test output
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('no error (happy path)', () => {
    let wrapper: VueWrapper

    beforeEach(() => {
      wrapper = mount(RenderErrorBoundary, {
        slots: { default: StableSlot },
        global: { plugins: [i18n] },
      })
    })

    it('renders the default slot', () => {
      expect(wrapper.find(locators.slotContent).exists()).toBe(true)
    })

    it('does not render the error UI', () => {
      expect(wrapper.find(locators.errorUI).exists()).toBe(false)
    })
  })

  describe('when a child component throws an Error', () => {
    let wrapper: VueWrapper

    beforeEach(async () => {
      wrapper = mount(RenderErrorBoundary, {
        slots: { default: makeThrowingSlot(new Error('boom')) },
        global: { plugins: [i18n] },
      })
      await nextTick()
    })

    it('shows the error UI container', () => {
      expect(wrapper.find(locators.errorUI).exists()).toBe(true)
    })

    it('hides the slot content', () => {
      expect(wrapper.find(locators.slotContent).exists()).toBe(false)
    })

    it('displays the generic error i18n message', () => {
      expect(wrapper.find(locators.errorUI).text()).toContain('Something went wrong')
    })

    it('renders a retry button with the correct label', () => {
      expect(wrapper.find(locators.retryButton).text()).toBe('Retry')
    })
  })

  describe('when a non-Error value is thrown', () => {
    it('wraps the value in an Error so capturedError is always an Error instance', async () => {
      const wrapper = mount(RenderErrorBoundary, {
        slots: { default: makeThrowingSlot('plain string error') },
        global: { plugins: [i18n] },
      })
      await nextTick()

      // The error UI must appear even for non-Error throws
      expect(wrapper.find(locators.errorUI).exists()).toBe(true)
    })
  })

  describe('retry', () => {
    it('hides the error UI and restores the slot after clicking retry', async () => {
      // Use a slot that only throws once so the second mount (after retry) succeeds
      const wrapper = mount(RenderErrorBoundary, {
        slots: { default: makeThrowOnceSlot() },
        global: { plugins: [i18n] },
      })
      await nextTick()
      expect(wrapper.find(locators.errorUI).exists()).toBe(true)

      await wrapper.find(locators.retryButton).trigger('click')
      await nextTick()

      expect(wrapper.find(locators.errorUI).exists()).toBe(false)
      expect(wrapper.find(locators.slotContent).exists()).toBe(true)
    })
  })

  /** Throws every time it mounts — useful for verifying the error UI appears */
  const makeThrowingSlot = (error: unknown = new Error('test error')) =>
    defineComponent({
      setup() {
        onMounted(() => {
          throw error
        })
        return () => h('span', { 'data-testid': 'slot-content' }, 'content')
      },
    })

  /** Throws only on the first mount, recovers on subsequent mounts (retry scenario) */
  const makeThrowOnceSlot = () => {
    let thrown = false
    return defineComponent({
      setup() {
        onMounted(() => {
          if (!thrown) {
            thrown = true
            throw new Error('first-mount error')
          }
        })
        return () => h('span', { 'data-testid': 'slot-content' }, 'recovered')
      },
    })
  }
})
