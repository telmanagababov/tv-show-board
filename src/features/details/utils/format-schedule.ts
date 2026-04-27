/**
 * Utilities for formatting English schedule data into locale-aware strings.
 */

/**
 * Jan 5 2025 is a Sunday (index 0 in the DAY_INDEX array).
 */
const REFERENCE_SUNDAY = new Date(2025, 0, 5)
/**
 * The array of day names in English.
 */
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

/**
 * Converts an English day name (e.g. "Monday") to a locale-aware weekday string (e.g. "Montag").
 */
export function localizeDay(day: string, locale: string): string {
  const index = DAY_NAMES.indexOf(day.toLowerCase().trim())
  if (index > 0) {
    const date = new Date(REFERENCE_SUNDAY)
    date.setDate(REFERENCE_SUNDAY.getDate() + index)
    return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)
  }
  return day
}

/**
 * Converts a 24-hour time string (e.g. "14:00") to a locale-aware time string (e.g. "2:00 PM").
 */
export function localizeTime(time: string, locale: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date(2000, 0, 1, hours, minutes)
  return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit' }).format(date)
}
