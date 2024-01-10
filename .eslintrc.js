module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended"
    ],
    ignorePatterns: ["/*.*"],
    overrides: [
        {
            env: {
                node: true
            },
            files: [
                '.eslintrc.{js,cjs}'
            ],
            parserOptions: {
                sourceType: 'script'
            }
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module'
    },
    rules: {
      quotes:                        ['error', 'single'],
      semi:                          ['error', 'never'],
      indent:                        ['error', 2],
      'max-len':                     ['error', { code: 100 }],
      'no-trailing-spaces':          ['error'],
      'no-multi-spaces':             [
        1,
        {
          exceptions: {
            ImportDeclaration:  true,
            PropertyAssignment: false,
            TSTypeAnnotation:   true,
            VariableDeclarator: true,
          },
        },
      ],
      'key-spacing': [
        2,
        {
          multiLine: {
            align: 'value',
          },
        },
      ],
      'comma-dangle': [
        'error',
        {
          arrays:    'always-multiline', //only-multiline
          exports:   'always-multiline',
          functions: 'only-multiline',
          imports:   'always-multiline',
          objects:   'always-multiline',
        },
      ],
      '@typescript-eslint/explicit-module-boundary-types': [0],
    },
}
