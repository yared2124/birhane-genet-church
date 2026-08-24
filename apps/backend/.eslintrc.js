/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  extends: ["@repo/eslint-config"],
  // Backend-specific overrides
  rules: {
    "@typescript-eslint/no-explicit-any": "off",
  },
};
