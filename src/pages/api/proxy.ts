import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
	const params = url.searchParams.get("url");

	if (!params) return new Response("Missing url parameter", { status: 400 });

	const target = URL.parse(params);
	if (!target) return new Response("Invalid url", { status: 400 });

	if (target.protocol !== "http:") {
		return new Response("Only http:// URLs are proxied", { status: 400 });
	}

	const allowed = await env.DB.prepare(
		"SELECT 1 FROM channels WHERE url LIKE ? LIMIT 1",
	)
		.bind(`${target.origin}%`)
		.first();

	if (!allowed) {
		return new Response("URL not allowed", { status: 403 });
	}

	const res = await fetch(target.toString(), {
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			Accept: "*/*",
			Connection: "keep-alive",
			Referer: `${target.protocol}//${target.host}`,
			Origin: `${target.protocol}//${target.host}`,
		},
	});

	if (!res.ok)
		return new Response("Upstream fetch failed", { status: res.status });

	const contentType = res.headers.get("content-type") ?? "";

	if (
		target.pathname.endsWith(".m3u8") ||
		contentType.includes("mpegurl") ||
		contentType.includes("x-mpegURL")
	) {
		const text = await res.text();

		const rewritten = text
			.split("\n")
			.map((line) => {
				const trimmed = line.trim();
				if (!trimmed || trimmed.startsWith("#")) return line;
				const resolved = new URL(trimmed, target).toString();
				return `/api/proxy?url=${encodeURIComponent(resolved)}`;
			})
			.join("\n");

		return new Response(rewritten, {
			headers: {
				"content-type": "application/vnd.apple.mpegurl",
				"access-control-allow-origin": "*",
			},
		});
	}

	return new Response(res.body, {
		headers: {
			"content-type": contentType || "video/mp2t",
			"access-control-allow-origin": "*",
		},
	});
};
