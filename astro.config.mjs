// @ts-check
import { defineConfig } from "astro/config";
import writingRoom from "./src/editor/integration.mjs";

export default defineConfig({
  output: "static",
  integrations: [writingRoom()],
  site: "https://aayush.world",
});
