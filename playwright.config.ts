import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "e2e",
  use: { baseURL: "http://127.0.0.1:4173" },
  webServer: [
    {
      command: "python -m backend.e2e_server",
      url: "http://127.0.0.1:8173/api/encontros/",
    },
    {
      env: { RATEIO_API: "http://127.0.0.1:8173" },
      command: "npm run dev -- --host 127.0.0.1 --port 4173 --strictPort",
      url: "http://127.0.0.1:4173",
    },
  ],
});
