import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
	{ ignores: [".astro/**", "dist/**", "node_modules/**", ".wrangler/**"] },
	...tseslint.configs.recommended,
	...eslintPluginAstro.configs.recommended,
];
