/**
 * Domain types for the person (cast member / crew) concept.
 */

import type { ShowImage, ShowSummary } from './show'

/**
 * Full person shape for the person detail page.
 */
export interface PersonDetails {
  id: number
  name: string
  /** `null` when the person has no photo. */
  image: ShowImage | null
  /** ISO "YYYY-MM-DD". `null` when unknown. */
  birthday: string | null
  /** ISO "YYYY-MM-DD". `null` when still alive or unknown. */
  deathday: string | null
  gender: string | null
  country: string | null
  /** Shows the person has appeared in, mapped to the lightweight summary shape. */
  showCredits: ShowSummary[]
}
