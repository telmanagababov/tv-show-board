import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import '@/features/details/i18n'
import { i18n } from '@/shared/i18n'
import ShowSummary from './ShowSummary.vue'

describe('ShowSummary', () => {
  const locators = {
    section: '[data-testid="details-summary-section"]',
    content: '[data-testid="details-summary"]',
  } as const

  function mountSummary(summaryHtml: string) {
    return mount(ShowSummary, { props: { summaryHtml }, global: { plugins: [i18n] } })
  }

  it('renders the summary section', () => {
    expect(mountSummary('<p>A great show.</p>').find(locators.section).exists()).toBe(true)
  })

  it('renders a non-empty section heading', () => {
    expect(mountSummary('<p>A great show.</p>').find('h2').text()).toBeTruthy()
  })

  it('renders the HTML content inside the summary div', () => {
    const wrapper = mountSummary('<p>A great show.</p>')
    expect(wrapper.find(locators.content).html()).toContain('A great show.')
  })

  it('strips script tags via DOMPurify (XSS prevention)', () => {
    const wrapper = mountSummary('<p>Safe content</p><script>alert("xss")<\/script>')
    expect(wrapper.find(locators.content).html()).not.toContain('<script>')
    expect(wrapper.find(locators.content).html()).toContain('Safe content')
  })
})
