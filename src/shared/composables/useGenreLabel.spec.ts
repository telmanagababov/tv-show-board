import { describe, expect, it } from 'vitest'
import { defineComponent } from 'vue'
import { mount } from '@vue/test-utils'

import { useGenreLabel } from './useGenreLabel'
import { i18n } from '../i18n'

describe('useGenreLabel', () => {
  it('returns the localised label for a known genre', () => {
    const { translateGenre } = setupComposable()

    expect(translateGenre('Science-fiction')).toBe('Science Fiction')
  })

  it('falls back to the raw API string for genres not in the translations', () => {
    const { translateGenre } = setupComposable()

    expect(translateGenre('UnknownGenre')).toBe('UnknownGenre')
  })

  it('handles an empty string gracefully', () => {
    const { translateGenre } = setupComposable()

    expect(translateGenre('')).toBe('')
  })

  function setupComposable() {
    let translateGenre!: (genre: string) => string
    mount(
      defineComponent({
        setup() {
          translateGenre = useGenreLabel().translateGenre
        },
        template: '<div />',
      }),
      { global: { plugins: [i18n] } },
    )

    return { translateGenre }
  }
})
