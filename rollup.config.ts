import alias from "@rollup/plugin-alias";
import babel from "@rollup/plugin-babel";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import { defineConfig } from "rollup";

const isProduction = process.env.NODE_ENV === "production";

export default defineConfig([
  {
    input: "src/index.ts",
    output: {
      dir: "lib",
      format: "cjs",
      sourcemap: true,
    },
    plugins: [
      alias({
        entries: [{ find: "@", replacement: path.resolve(__dirname, "src") }],
      }),
      resolve(),
      commonjs({
        include: /node_modules/,
        sourceMap: false,
      }),
      typescript(),
      babel({
        babelHelpers: "bundled",
        exclude: "node_modules/**",
      }),
      isProduction && terser(),
    ],
    external: ["fs", "path"],
  },
  {
    // 生成 类型声明文件
    input: "src/index.ts",
    output: {
      file: "types/index.d.ts",
      format: "esm",
      sourcemap: false,
    },
    plugins: [
      typescript({
        declaration: true,
        declarationMap: false,
        outDir: "types/",
        sourceMap: false,
        include: ["src/**/*.ts"],
      }),
    ],
  },
]);
