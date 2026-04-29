import { test, expect } from '@playwright/test'

import { fakeSearchResult, TVMAZE_API_URL } from '../fixtures'
import { searchLocators, sharedLocators } from '../data'

test.describe('Search view', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) => url.origin === TVMAZE_API_URL && url.pathname === '/search/shows',
      async (route) => route.fulfill({ json: [fakeSearchResult] }),
    )
    await page.route(
      (url) => url.origin === TVMAZE_API_URL && url.pathname === '/shows',
      async (route) => route.fulfill({ json: [] }),
    )
  })

  test('navigating directly to /search?q=… shows results', async ({ page }) => {
    await page.goto('/search?q=Breaking+Bad')

    await expect(page.getByTestId(searchLocators.results)).toBeVisible()
    await expect(page.getByTestId(searchLocators.resultItem).first()).toBeVisible()
    await expect(page.getByTestId(sharedLocators.showCardTitle).first()).toHaveText(fakeSearchResult.show.name)
  })

  test('typing in the header search bar navigates to the search route', async ({ page }) => {
    await page.goto('/')

    const input = page.getByTestId(searchLocators.input)
    await input.fill('Breaking Bad')

    await expect(page).toHaveURL(/\/search\?q=Breaking/)
    await expect(page.getByTestId(searchLocators.results)).toBeVisible()
  })

  test('shows the search heading that reflects the query', async ({ page }) => {
    await page.goto('/search?q=Breaking+Bad')

    await expect(page.getByTestId(searchLocators.heading)).toBeVisible()
    await expect(page.getByTestId(searchLocators.heading)).toContainText('Breaking Bad')
  })
})
