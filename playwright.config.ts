import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  use: {
    baseURL: "http://localhost:8080",
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices.chromium },
    },
  ],
});
