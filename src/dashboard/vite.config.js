import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
/** @type {import('vite').UserConfig} */
export default defineConfig({
    server: {
        host: true,
        port: 5500,
    },
    build: {
        outDir: "build",
    },
    plugins: [react()],
    resolve: {
        tsconfigPaths: true,
        alias: {
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
        setupFiles: "./src/setupTests.ts",
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],
            exclude: ["node_modules/", "src/setupTests.ts"],
        },
    },
});
