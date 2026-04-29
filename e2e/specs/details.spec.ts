import { test, expect } from '@playwright/test'

import { fakeShowWithEmbeds, SHOW_ID, TVMAZE_API_URL } from '../fixtures'
import { detailsLocators } from '../data'

test.describe('Details view', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) => url.origin === TVMAZE_API_URL && url.pathname === `/shows/${SHOW_ID}`,
      async (route) => route.fulfill({ json: fakeShowWithEmbeds }),
    )
    await page.goto(`/details/${SHOW_ID}`)
  })

  test('renders the show details content panel', async ({ page }) => {
    await expect(page.getByTestId(detailsLocators.content)).toBeVisible()
  })

  test('displays the show title', async ({ page }) => {
    await expect(page.getByTestId(detailsLocators.title)).toHaveText(fakeShowWithEmbeds.name)
  })

  test('displays the rating badge', async ({ page }) => {
    await expect(page.getByTestId(detailsLocators.rating)).toBeVisible()
    await expect(page.getByTestId(detailsLocators.rating)).toContainText(String(fakeShowWithEmbeds.rating.average))
  })

  test('displays the network metadata', async ({ page }) => {
    await expect(page.getByTestId(detailsLocators.network)).toHaveText(fakeShowWithEmbeds.network.name)
  })

  test('displays the premiered year', async ({ page }) => {
    await expect(page.getByTestId(detailsLocators.premiered)).toHaveText(fakeShowWithEmbeds.premiered.slice(0, 4))
  })

  test('back button is present', async ({ page }) => {
    await expect(page.getByTestId(detailsLocators.backButton)).toBeVisible()
  })
})
