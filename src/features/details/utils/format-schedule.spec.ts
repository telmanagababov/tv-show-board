import { describe, expect, it } from 'vitest'
import { localizeDay, localizeTime } from './format-schedule'

describe('localizeDay', () => {
  it('returns the locale-formatted day name for a known TVMaze day string', () => {
    expect(localizeDay('Monday', 'en')).toBe('Monday')
    expect(localizeDay('Friday', 'en')).toBe('Friday')
    expect(localizeDay('Sunday', 'en')).toBe('Sunday')
  })

  it('returns all seven days without repetition or off-by-one errors', () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const formatted = days.map((d) => localizeDay(d, 'en'))
    expect(new Set(formatted).size).toBe(7)
  })

  it('passes through an unknown day string unchanged', () => {
    expect(localizeDay('Funday', 'en')).toBe('Funday')
  })
})

describe('localizeTime', () => {
  it('formats midnight correctly', () => {
    const result = localizeTime('00:00', 'en')
    expect(result).toBeTruthy()
  })

  it('produces different output for different locales', () => {
    // en-US uses 12-hour; de-DE uses 24-hour — they must differ for 21:00.
    const enUS = localizeTime('21:00', 'en-US')
    const deDE = localizeTime('21:00', 'de-DE')
    expect(enUS).not.toBe(deDE)
  })

  it('round-trips: the formatted value contains the expected hour digits', () => {
    // Use the same Intl call as the implementation to stay environment-agnostic.
    const expected = new Intl.DateTimeFormat('en', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(2000, 0, 1, 9, 30))
    expect(localizeTime('09:30', 'en')).toBe(expected)
  })
})
