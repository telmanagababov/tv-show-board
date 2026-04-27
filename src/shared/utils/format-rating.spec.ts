import { describe, expect, it } from 'vitest'
import { formatRating } from './format-rating'

describe('formatRating', () => {
  it('formats a float rating to one decimal place', () => {
    expect(formatRating(8.5)).toBe('8.5')
  })

  it('formats a whole-number rating with a trailing zero', () => {
    expect(formatRating(10)).toBe('10.0')
  })

  it('formats a zero rating as "0.0"', () => {
    expect(formatRating(0)).toBe('0.0')
  })

  it('returns "—" for a null rating', () => {
    expect(formatRating(null)).toBe('—')
  })
})
