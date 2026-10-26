import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "../backend/openapi.json",
  output: {
    path: "src/api/generated",
  },
  plugins: [
    {
      name: "@hey-api/client-fetch",
      baseUrl: "http://localhost:8000",
    },
    "@hey-api/typescript",
    "@hey-api/sdk",
    "zod",
  ],
});
