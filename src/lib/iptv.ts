import { env } from "cloudflare:workers";

export interface Channel {
	id: string;
	name: string;
	country: string;
	categories: string[];
}

interface Logo {
	channel: string;
	url: string;
}

export interface Data extends Channel {
	logo: string | null;
}

export async function getData(): Promise<Data[]> {
	const cachedData = await env.SESSION.get<Data[]>("cache", "json");
	if (cachedData) return cachedData;

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
		id: channel.id,
		name: channel.name,
		country: channel.country,
		categories: channel.categories,
		logo: logoMap.get(channel.id) ?? null,
	}));

	await env.SESSION.put("cache", JSON.stringify(data), {
		expirationTtl: 43200,
	});

	return data;
}
