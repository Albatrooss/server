
const sharRules = {
  'import/no-commonjs': 'error',
  'import/no-cycle': 'off',
  'import/named': 'error',
  'arrow-body-style': ['error', 'as-needed'],
  'no-console': 'off',
  'react/react-in-jsx-scope': 'off',
  'no-process-env': 'error',
  'no-return-await': 'error',
};

const jsRules = {
  ...sharedRules,
  'arrow-parens': 'as-needed',
};
const tsRules = {};

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  extends: [
    // '@oh-oh-oh/eslint',
    'plugin:react/recommended',
    'airbnb',
  ],
  rules: jsRules,
  overrides: [{}],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
      },
    },
  },
};
