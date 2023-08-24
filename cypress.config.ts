import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    experimentalSessionAndOrigin: true,
    specPattern: "cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}",
    baseUrl: "http://127.0.0.1:4173",
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
