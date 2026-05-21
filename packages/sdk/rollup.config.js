import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/index.ts",
  output: [
    {
      file: "dist/collect.js",
      format: "iife",
      name: "_NRInit",
      sourcemap: false,
      plugins: [terser()],
    },
    {
      file: "dist/collect.dev.js",
      format: "iife",
      name: "_NRInit",
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({ browser: true }),
    typescript({ tsconfig: "./tsconfig.json" }),
  ],
};
