module.exports = {
    env: {
        browser: true,
        commonjs: true,
        es2021: true,
    },
    extends: [
        'airbnb-base',
    ],
    parserOptions: {
        ecmaVersion: 13,
    },
    rules: {
        indent: [
            'error',
            4,
        ],
        semi: [
            'error',
            'never',
        ],
        "no-underscore-dangle": 'off',
    },
    overrides: [
        {
            files: [
                '**/*.test.js',
                '**/*.test.jsx',
            ],
            env: {
                jest: true,
            },
        },
    ],
}
