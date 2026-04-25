import { createI18n } from 'vue-i18n'

import common from './messages/en/common.json'
import errors from './messages/en/errors.json'

const isDev = import.meta.env.DEV

export const SUPPORTED_LOCALES = ['en'] as const
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages: {
    en: { common, errors } as never,
  },
  missingWarn: isDev,
  fallbackWarn: isDev,
  missing: isDev
    ? (locale, key) => {
        throw new Error(`[i18n] Missing key "${key}" for locale "${locale}"`)
      }
    : undefined,
})

/**
 * Merge a feature's locale messages into the global instance.
 * Each feature calls this from its own entry to keep messages
 * co-located with the feature and split into the feature's chunk.
 */
export function registerFeatureMessages(
  locale: SupportedLocale,
  namespace: string,
  messages: Record<string, unknown>,
): void {
  i18n.global.mergeLocaleMessage(locale, { [namespace]: messages })
}
