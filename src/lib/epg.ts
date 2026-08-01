import { env } from "cloudflare:workers";

interface EPG {
	epg_list: {
		desc: string;
		start_date: Date;
		title: string;
	}[];
}

export async function getNowNext(channel: string) {
	const EPGid = await env.DB.prepare("SELECT epg_id FROM channels WHERE id = ?")
		.bind(channel)
		.first();

	let epg: EPG;
	try {
		if (!EPGid)
			throw new Error(`Channel ID for ${channel} not found in database`);

		const res = await fetch(
			`https://epg.pw/api/epg.json?lang=en&date=${new Date().toISOString().slice(0, 10).replace(/-/g, "")}&channel_id=${EPGid.epg_id}`,
		);

		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

		epg = await res.json();
	} catch (e) {
		console.error(`Error fetching EPG for channel ${channel}:`, e);
		return { now: null, next: null };
	}

	const list = epg.epg_list;
	const now = new Date().getTime();

	let currentIndex = -1;
	for (let i = 0; i < list.length; i++) {
		const start = new Date(list[i].start_date).getTime();
		if (start <= now) {
			currentIndex = i;
		} else {
			break;
		}
	}

	return {
		now: currentIndex >= 0 ? list[currentIndex] : null,
		next:
			currentIndex >= 0 && currentIndex + 1 < list.length
				? list[currentIndex + 1]
				: null,
	};
}