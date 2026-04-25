import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'

import SearchView from './SearchView.vue'

describe('SearchView', () => {
  const locators = {
    heading: '[data-testid="search-heading"]',
    query: '[data-testid="search-query"]',
  } as const

  let view: VueWrapper<InstanceType<typeof SearchView>>

  const mountWith = async (q?: string) => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/search', component: SearchView }],
    })
    await router.push(q ? `/search?q=${q}` : '/search')
    return mount(SearchView, { global: { plugins: [router] } })
  }

  beforeEach(async () => {
    view = await mountWith()
  })

  it('renders the Search heading', () => {
    expect(view.find(locators.heading).text()).toBeTruthy()
  })

  it('displays the query string when provided', async () => {
    view = await mountWith('batman')
    expect(view.find(locators.query).text()).toContain('batman')
  })

  it('displays (empty) when no query is provided', () => {
    expect(view.find(locators.query).text()).toContain('(empty)')
  })
})
