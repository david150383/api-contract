import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:8000/openapi.json",
  output: {
    path: "src/api/generated",
  },
  client: "@hey-api/client-fetch",
  plugins: ["@hey-api/typescript", "@hey-api/sdk"],
});
