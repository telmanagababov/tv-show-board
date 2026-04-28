import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, nextTick } from 'vue'
import { mount } from '@vue/test-utils'

import { useOnlineState } from './useOnlineState'

describe('useOnlineState', () => {
  beforeEach(() => {
    Object.defineProperty(navigator, 'onLine', { configurable: true, writable: true, value: true })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mountComposable() {
    let isOnline!: ReturnType<typeof useOnlineState>['isOnline']
    const wrapper = mount(
      defineComponent({
        setup() {
          isOnline = useOnlineState().isOnline
        },
        template: '<div />',
      }),
    )
    return { wrapper, isOnline: () => isOnline.value }
  }

  it('initialises as online when navigator.onLine is true', () => {
    Object.defineProperty(navigator, 'onLine', { value: true, configurable: true })
    const { isOnline } = mountComposable()

    expect(isOnline()).toBe(true)
  })

  it('initialises as offline when navigator.onLine is false', () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const { isOnline } = mountComposable()

    expect(isOnline()).toBe(false)
  })

  it('becomes false when the offline window event fires', async () => {
    const { isOnline } = mountComposable()

    window.dispatchEvent(new Event('offline'))
    await nextTick()

    expect(isOnline()).toBe(false)
  })

  it('becomes true when the online window event fires', async () => {
    Object.defineProperty(navigator, 'onLine', { value: false, configurable: true })
    const { isOnline } = mountComposable()

    window.dispatchEvent(new Event('online'))
    await nextTick()

    expect(isOnline()).toBe(true)
  })

  it('removes event listeners on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { wrapper } = mountComposable()

    wrapper.unmount()

    expect(removeSpy).toHaveBeenCalledWith('online', expect.any(Function))
    expect(removeSpy).toHaveBeenCalledWith('offline', expect.any(Function))
  })
})
