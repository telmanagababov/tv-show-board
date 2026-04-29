import { test, expect } from '@playwright/test'

import { fakeShow, SHOW_ID, TVMAZE_API_URL } from '../fixtures'
import { dashboardLocators, sharedLocators } from '../data'

test.describe('Dashboard view', () => {
  test.beforeEach(async ({ page }) => {
    await page.route(
      (url) => url.origin === TVMAZE_API_URL && url.pathname === '/shows',
      async (route) => {
        const pageParam = new URL(route.request().url()).searchParams.get('page')
        if (!pageParam || pageParam === '0') {
          await route.fulfill({ json: [fakeShow] })
        } else {
          await route.fulfill({ status: 404, body: '{"message":"Not found"}' })
        }
      },
    )
    await page.goto('/')
  })

  test('renders the dashboard title', async ({ page }) => {
    await expect(page.getByTestId(dashboardLocators.title)).toBeVisible()
  })

  test('renders at least one genre section with a show card', async ({ page }) => {
    await expect(page.getByTestId(dashboardLocators.genres)).toBeVisible()
    await expect(page.getByTestId(sharedLocators.showCard).first()).toBeVisible()
  })

  test('show card displays the correct title and rating', async ({ page }) => {
    const card = page.getByTestId(sharedLocators.showCard).first()
    await expect(card.getByTestId(sharedLocators.showCardTitle)).toHaveText(fakeShow.name)
    await expect(card.getByTestId(sharedLocators.showCardRating)).toBeVisible()
  })

  test('clicking a show card navigates to the details page', async ({ page }) => {
    await page.route(
      (url) => url.origin === TVMAZE_API_URL && url.pathname === `/shows/${SHOW_ID}`,
      async (route) => route.fulfill({ json: { ...fakeShow, _embedded: { cast: [] } } }),
    )
    await page.getByTestId(sharedLocators.showCard).first().click()
    await expect(page).toHaveURL(`/details/${SHOW_ID}`)
  })
})
