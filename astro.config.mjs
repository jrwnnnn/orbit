// @ts-check
import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";

export default defineConfig({
	site: "https://orbit.jrwnnnn.me",
	output: "server",
	adapter: cloudflare({
		remoteBindings: !process.env.CI,
	}),
});
