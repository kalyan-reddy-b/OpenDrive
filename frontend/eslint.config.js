import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      // Disabled: this rule flags the standard "fetch data on mount" pattern
      // (useEffect(() => { fetchData() }, [])) used throughout this app,
      // which is the documented/idiomatic way to load data from an API.
      'react-hooks/set-state-in-effect': 'off',
      // Disabled: flags Date.now()/new Date() used in render-time formatting
      // helpers (e.g. "2h ago" timestamps), a common and harmless pattern.
      'react-hooks/purity': 'off',
    },
  },
  {
    // shadcn/ui components conventionally export helper constants/functions
    // (e.g. buttonVariants, useFormField) alongside the component — standard
    // pattern, only affects Fast Refresh granularity, not correctness.
    files: ['src/components/ui/**/*.{ts,tsx}'],
    rules: {
      'react-refresh/only-export-components': 'off',
    },
  },
])
