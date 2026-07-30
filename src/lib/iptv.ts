import { env } from "cloudflare:workers";

export interface Channel {
	id: string;
	name: string;
	alt_names: string[];
	network: string | null;
	owners: string[];
	country: string;
	categories: string[];
	is_nsfw: boolean;
	launched: string | null;
	closed: string | null;
	replaced_by: string | null;
	website: string;
}

interface Logo {
	channel: string;
	url: string;
}

export interface Data extends Channel {
	logo: string | null;
}

async function fetchIPTV() {
	const [channels, logos] = await Promise.all([
		fetch("https://iptv-org.github.io/api/channels.json").then(
			(res) => res.json() as Promise<Channel[]>,
		),
		fetch("https://iptv-org.github.io/api/logos.json").then(
			(res) => res.json() as Promise<Logo[]>,
		),
	]);

	const logoMap = new Map(logos.map((l) => [l.channel, l.url]));
	const data: Data[] = channels.map((channel) => ({
		...channel,
		logo: logoMap.get(channel.id) ?? null,
	}));

	return data;
}

async function refreshCache(list: Set<string>): Promise<Data[]> {
	const data = (await fetchIPTV()).filter((c) => list.has(c.id));

	await env.SESSION.put("cache", JSON.stringify(data), {
		expirationTtl: 43200,
	});

	return data;
}

export async function getData(): Promise<Data[]> {
	const list = new Set(
		(await env.DB.prepare("SELECT id FROM channels").all()).results.map(
			(r) => r.id as string,
		),
	);
	const cache = await env.SESSION.get<Data[]>("cache", "json");

	// Check if the cache is still valid
	if (cache) {
		const ids = new Set(cache.map((c) => c.id));
		const isMissingChannels = [...list].some((id) => !ids.has(id));
		if (!isMissingChannels) return cache;
	}

	console.warn("Cache is missing channels or is invalid. Refreshing cache...");

	return refreshCache(list);
}
