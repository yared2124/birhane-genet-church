/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
  extends: ["@repo/eslint-config"],
  // Frontend-specific overrides
  rules: {
    "react/display-name": "warn",
  },
};
