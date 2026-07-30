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

export async function getData() {
	const [channels, logos] = await Promise.all([
		fetch("https://iptv-org.github.io/api/channels.json", {
			cf: { cacheTtl: 3600, cacheEverything: true },
		}).then((res) => res.json() as Promise<Channel[]>),
		fetch("https://iptv-org.github.io/api/logos.json", {
			cf: { cacheTtl: 3600, cacheEverything: true },
		}).then((res) => res.json() as Promise<Logo[]>),
	]);

	const logoMap = new Map(logos.map((l) => [l.channel, l.url]));

	return channels.map((channel) => ({
		...channel,
		logo: logoMap.get(channel.id) ?? null,
	}));
}
