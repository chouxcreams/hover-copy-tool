import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Suppress React act() warnings in tests
    env: {
      NODE_ENV: "test",
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
