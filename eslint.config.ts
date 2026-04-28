import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import pluginPlaywright from 'eslint-plugin-playwright'
import pluginVitest from '@vitest/eslint-plugin'
import pluginOxlint from 'eslint-plugin-oxlint'
import pluginVueI18n from '@intlify/eslint-plugin-vue-i18n'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  ...pluginVue.configs['flat/recommended'],
  vueTsConfigs.recommended,

  {
    ...pluginPlaywright.configs['flat/recommended'],
    files: ['e2e/**/*.{test,spec}.{js,ts,jsx,tsx}'],
  },

  {
    ...pluginVitest.configs.recommended,
    files: ['src/**/__tests__/*', 'src/**/*.{test,spec}.{ts,tsx}'],
  },

  // Project-specific rule tightening
  {
    name: 'app/custom-rules',
    files: ['src/**/*.{vue,ts}'],
    rules: {
      // TypeScript: forbid `any`, enforce explicit intent
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],

      // Console: allow warn/error (for real problems), forbid log/debug
      'no-console': ['warn', { allow: ['warn', 'error'] }],

      // Vue: tighten component conventions
      'vue/multi-word-component-names': 'error',
      'vue/component-api-style': ['error', ['script-setup']],
      'vue/define-emits-declaration': ['error', 'type-based'],
      'vue/define-props-declaration': ['error', 'type-based'],
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-unused-refs': 'error',
      'vue/no-useless-v-bind': 'error',
      'vue/prefer-true-attribute-shorthand': 'error',
    },
  },

  // ── i18n key safety ───────────────────────────────────────────────────────
  {
    name: 'app/i18n',
    files: ['src/**/*.{vue,ts}'],
    plugins: {
      '@intlify/vue-i18n': pluginVueI18n,
    },
    settings: {
      'vue-i18n': {
        localeDir: {
          pattern: 'src/locales/en.json',
          localeKey: 'file',
        },
        messageSyntaxVersion: '^11.0.0',
      },
    },
    rules: {
      '@intlify/vue-i18n/no-missing-keys': 'error',
      '@intlify/vue-i18n/no-deprecated-i18n-component': 'error',
      '@intlify/vue-i18n/no-deprecated-v-t': 'error',
      '@intlify/vue-i18n/no-v-html': 'error',
    },
  },

  // ── Architectural boundaries ──────────────────────────────────────────────

  // Scope A — feature & shared components/utils (no api, no stores, no shell, no cross-feature)
  {
    name: 'app/components-utils-purity',
    files: [
      'src/features/*/components/**/*.{vue,ts}',
      'src/features/*/utils/**/*.{vue,ts}',
      'src/shared/components/**/*.{vue,ts}',
      'src/shared/utils/**/*.{vue,ts}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/shell', '@/shell/**'],
              message: 'components/ and utils/ must not import from shell/. See docs/ARCHITECTURE.md',
            },
            {
              group: ['@/features', '@/features/**'],
              message:
                'components/ and utils/ must not import across feature boundaries via the @/ alias. Use relative paths within your own feature. See docs/ARCHITECTURE.md',
            },
            {
              group: ['@/shared/api', '@/shared/stores', '**/api/**', '**/stores/**'],
              message:
                'components/ and utils/ must remain pure — they cannot import from api/ or stores/. Pass data via props. See docs/ARCHITECTURE.md',
            },
            {
              group: ['@/shared/*/*', '@/shared/*/**'],
              message:
                "Import from the shared folder's public index, not from internal files. Use '@/shared/X' instead of '@/shared/X/file'. See docs/ARCHITECTURE.md",
            },
          ],
        },
      ],
    },
  },

  // Scope B — rest of features/ and shared/ (stores, views, i18n, composables…)
  {
    name: 'app/feature-shared-boundary',
    files: ['src/features/**/*.{vue,ts}', 'src/shared/**/*.{vue,ts}'],
    ignores: [
      'src/features/*/components/**',
      'src/features/*/utils/**',
      'src/shared/components/**',
      'src/shared/utils/**',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/shell', '@/shell/**'],
              message:
                'features/ and shared/ must not import from shell/ — shell is the app frame, used once. See docs/ARCHITECTURE.md',
            },
            {
              group: ['@/features', '@/features/**'],
              message:
                'features must not import from other features via the @/ alias; shared/ must never import from features/. Cross-feature state goes through Pinia stores or the router. See docs/ARCHITECTURE.md',
            },
            {
              group: ['@/shared/*/*', '@/shared/*/**'],
              message:
                "Import from the shared folder's public index, not from internal files. Use '@/shared/X' instead of '@/shared/X/file'. See docs/ARCHITECTURE.md",
            },
          ],
        },
      ],
    },
  },

  // Scope C — shell/ (can import from everything, but must use shared indexes)
  {
    name: 'app/shell-index-only',
    files: ['src/shell/**/*.{vue,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/shared/*/*', '@/shared/*/**'],
              message:
                "Import from the shared folder's public index, not from internal files. Use '@/shared/X' instead of '@/shared/X/file'. See docs/ARCHITECTURE.md",
            },
          ],
        },
      ],
    },
  },

  // Scope D — src root files: App.vue, routes.ts, main.ts … (must use shared indexes)
  {
    name: 'app/src-root-index-only',
    files: ['src/*.{vue,ts}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/shared/*/*', '@/shared/*/**'],
              message:
                "Import from the shared folder's public index, not from internal files. Use '@/shared/X' instead of '@/shared/X/file'. See docs/ARCHITECTURE.md",
            },
          ],
        },
      ],
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile('.oxlintrc.json'),

  skipFormatting,
)
