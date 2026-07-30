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
	const data = channels.map((channel) => ({
		...channel,
		logo: logoMap.get(channel.id) ?? null,
	}));

	await env.SESSION.put("cache", JSON.stringify(data), {
		expirationTtl: 43200,
	});

	return data;
}
