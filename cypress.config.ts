import { defineConfig } from "cypress";

export default defineConfig({
  projectId: 'kn5tu8',
  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: 'cypress/component/*.cy.{js,jsx,ts,tsx}'
  },
  e2e: {
    baseUrl: 'https://maams-ng.netlify.app',
  },
});
