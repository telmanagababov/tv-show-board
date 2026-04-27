/**
 * Formats a nullable rating value for display.
 * Returns the rating fixed to one decimal place, or "—" when no rating exists.
 */
export function formatRating(rating: number | null): string {
  return rating != null ? rating.toFixed(1) : '—'
}
