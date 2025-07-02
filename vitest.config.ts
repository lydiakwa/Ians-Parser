import { defineConfig } from "vitest/config";
import vitePluginFile from "@astropub/vite-plugin-file";

export default defineConfig({
  plugins: [vitePluginFile()],
});
