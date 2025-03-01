module.exports = {
    env: {
      browser: true,
      es2021: true
    },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:react/recommended'],
    overrides: [
      {
        env: {
          node: true
        },
        files: ['.eslintrc.{js,cjs}'],
        parserOptions: {
          sourceType: 'script'
        }
      },
      {
        files: ['src/pages/api/sentry-example-api.js', 'src/pages/_error.jsx'],
        rules: {
          'react/prop-types': 'off'
        }
      }
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 'detect',
      sourceType: 'module'
    },
    plugins: ['@typescript-eslint', 'react'],
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      'react/react-in-jsx-scope': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-unreachable': 'off'
    }
}  