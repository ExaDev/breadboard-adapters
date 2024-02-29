import { resolve } from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import * as EsLint from "vite-plugin-linter";
import tsConfigPaths from "vite-tsconfig-paths";
import * as packageJson from "./package.json";
const { EsLinter, linterPlugin } = EsLint;

const peerDependencies = packageJson.peerDependencies || {};

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tsConfigPaths(),
		dts({
			include: ["src/"],
		}),
	],
	build: {
		lib: {
			entry: resolve("src", "components/index.ts"),
			name: "Breadboard React Adapter",
			formats: ["es", "umd", "cjs"],
			fileName: (format) => `index.${format}.js`,
		},
		rollupOptions: {
			external: [...Object.keys(peerDependencies)],
		},
	},
});
