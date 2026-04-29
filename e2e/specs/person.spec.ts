import { test, expect } from '@playwright/test'

import { fakePerson, fakeCastCredit, PERSON_ID, TVMAZE_API_URL } from '../fixtures'
import { personLocators, sharedLocators } from '../data'

test.describe('Person view', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) => url.origin === TVMAZE_API_URL && url.pathname === `/people/${PERSON_ID}`,
      async (route) => route.fulfill({ json: fakePerson }),
    )
    await page.route(
      (url) => url.origin === TVMAZE_API_URL && url.pathname === `/people/${PERSON_ID}/castcredits`,
      async (route) => route.fulfill({ json: [fakeCastCredit] }),
    )
    await page.goto(`/people/${PERSON_ID}`)
  })

  test('renders the person content panel', async ({ page }) => {
    await expect(page.getByTestId(personLocators.content)).toBeVisible()
  })

  test('displays the person name', async ({ page }) => {
    await expect(page.getByTestId(personLocators.name)).toHaveText(fakePerson.name)
  })

  test('displays biography metadata', async ({ page }) => {
    await expect(page.getByTestId(personLocators.birthday)).toHaveText(fakePerson.birthday)
    await expect(page.getByTestId(personLocators.gender)).toHaveText(fakePerson.gender)
    await expect(page.getByTestId(personLocators.country)).toHaveText(fakePerson.country.name)
  })

  test('renders the show credits section with at least one card', async ({ page }) => {
    await expect(page.getByTestId(personLocators.creditsSection)).toBeVisible()
    await expect(page.getByTestId(sharedLocators.showCard).first()).toBeVisible()
    await expect(page.getByTestId(sharedLocators.showCardTitle).first()).toHaveText(fakeCastCredit._embedded.show.name)
  })
})
