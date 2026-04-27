import { useI18n } from 'vue-i18n'

/**
 * Maps genre strings to their localised display labels.
 */
export function useGenreLabel() {
  const { t, te } = useI18n()

  function translateGenre(genre: string): string {
    const key = `common.genres.${genre.toLowerCase().replace(/ /g, '-')}`
    return te(key) ? t(key) : genre
  }

  return { translateGenre }
}
