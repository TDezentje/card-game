module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  extends: [
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports,
  },
  plugins: [
    "react",
    "jsx"
  ],
  rules: {
    "jsx/uses-factory": [1, {"pragma": "h"}],
    "react/jsx-uses-vars": 1,
    "react/jsx-no-duplicate-props": 1,
    "react/jsx-tag-spacing": 1,
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-namespace": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-parameter-properties": "off",
    "@typescript-eslint/no-object-literal-type-assertion": "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/no-var-requires": "off",
    "@typescript-eslint/indent": "off",
    "@typescript-eslint/no-empty-function": "off",
    "prefer-spread": "off",
    "prefer-const": ["error", {"destructuring": "all"}],
    "prefer-rest-params": "off",
    "semi": ["error", "always"]
  }
};