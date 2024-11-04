import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";
import { defineConfig } from "rollup";

export default defineConfig([
	{
		input: "src/index.ts",
		output: {
			dir: "lib",
			format: "cjs",
		},
		plugins: [
			resolve(),
			commonjs({
				include: /node_modules/,
				sourceMap: false,
			}),
			typescript(),
			// babel({
			// 	babelHelpers: "bundled",
			// 	exclude: "node_modules/**",
			// }),
			// terser(),
		],
		external: ["fs", "path"],
	},
]);
