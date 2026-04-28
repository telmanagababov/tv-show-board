/**
 * App-level vue-i18n schema augmentation.
 */
import 'vue-i18n'

/* eslint-disable @typescript-eslint/consistent-type-imports */
type CommonMessages = typeof import('./shared/i18n/messages/en/common.json')
type ErrorsMessages = typeof import('./shared/i18n/messages/en/errors.json')
type ShellMessages = typeof import('./shell/i18n/en.json')
type DashboardMessages = typeof import('./features/dashboard/i18n/en.json')
type DetailsMessages = typeof import('./features/details/i18n/en.json')
type PersonMessages = typeof import('./features/person/i18n/en.json')
type SearchMessages = typeof import('./features/search/i18n/en.json')
/* eslint-enable @typescript-eslint/consistent-type-imports */

interface AppMessages {
  common: CommonMessages
  errors: ErrorsMessages
  shell: ShellMessages
  dashboard: DashboardMessages
  details: DetailsMessages
  person: PersonMessages
  search: SearchMessages
}

declare module 'vue-i18n' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface DefineLocaleMessage extends AppMessages {}
}
