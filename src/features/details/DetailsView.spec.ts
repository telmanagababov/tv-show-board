import { beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'

import DetailsView from './DetailsView.vue'

describe('DetailsView', () => {
  const locators = {
    heading: '[data-testid="details-heading"]',
    comingSoon: '[data-testid="details-coming-soon"]',
  } as const

  let view: VueWrapper<InstanceType<typeof DetailsView>>

  beforeEach(() => {
    view = mount(DetailsView, { props: { id: '42' } })
  })

  it('renders a heading with the show id', () => {
    expect(view.find(locators.heading).text()).toContain('42')
  })

  it('renders the coming-soon message', () => {
    expect(view.find(locators.comingSoon).text()).toBeTruthy()
  })
})
