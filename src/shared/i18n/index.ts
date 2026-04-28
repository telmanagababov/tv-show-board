import { createI18n } from 'vue-i18n'

import en from '@/locales/en.json'

export const SUPPORTED_LOCALES = ['en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

const isDev = import.meta.env.DEV

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: { en } as never,
  missingWarn: isDev,
  fallbackWarn: isDev,
  missing: isDev
    ? (locale, key) => {
        throw new Error(`[i18n] Missing key "${key}" for locale "${locale}"`)
      }
    : undefined,
})
