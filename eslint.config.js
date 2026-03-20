import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueEslintPaser from 'vue-eslint-parser'
import tsPaser from '@typescript-eslint/parser'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default defineConfig([
  {
    name: 'app/files-to-lint',
    files: ['**/*.{js,mjs,jsx,vue}'],
    rules: {
      ...js.configs.recommended.rules,
      // Prettier 格式化警告
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          semi: false,
          printWidth: 80,
          trailingComma: 'none',
          endOfLine: 'auto',
        },
      ],
      // Vue 多单词组件名称警告（忽略 index.vue）
      'vue/multi-word-component-names': [
        'warn',
        {
          ignores: ['index', 'Index', 'Layout', 'Detail', 'List', 'Menu'],
        },
      ],
      // 关闭 props 解构校验
      'vue/no-setup-props-destructure': ['off'],
      // 未定义变量报错
      'no-undef': 'error',
      //'no-console': 'warn',
    },
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**']),

  {
    languageOptions: {
      parser: vueEslintPaser,
      parserOptions: {
        extraFileExtensions: ['.vue'],
        parser: tsPaser,
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      vue: pluginVue,
    },
  },

  ...pluginVue.configs['flat/essential'],
  skipFormatting,
])
