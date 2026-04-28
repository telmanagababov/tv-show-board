import 'vue-i18n'

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
type Messages = typeof import('./locales/en.json')

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends Messages {}
}
