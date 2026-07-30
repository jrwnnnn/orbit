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

async function refreshCache(): Promise<Data[]> {
	const list = new Set(
		(await env.DB.prepare("SELECT id FROM channels").all()).results.map(
			(r) => r.id as string,
		),
	);

	const data = (await fetchIPTV()).filter((c) => list.has(c.id));

	await env.SESSION.put("cache", JSON.stringify(data), {
		expirationTtl: 43200,
	});

	await Promise.all(
		data.map((c) =>
			env.SESSION.put(`channel:${c.id}`, JSON.stringify(c), {
				expirationTtl: 43200,
			}),
		),
	);

	return data;
}

export async function getData(id: string): Promise<Data[]> {
	if (id === "all") {
		const cache = await env.SESSION.get<Data[]>("cache", "json");
		if (cache) return cache;
		return refreshCache();
	} else {
		const cached = await env.SESSION.get<Data>(`channel:${id}`, "json");
		if (cached) return [cached];

		const result = (await refreshCache()).find((c) => c.id === id);
		return result ? [result] : [];
	}
}
