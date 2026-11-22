import { defineConfig, loadEnv } from "vite";
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    proxy: {
      "/api":
        loadEnv(mode, ".", "RATEIO_").RATEIO_API || "http://127.0.0.1:8000",
    },
  },
}));
