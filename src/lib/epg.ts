import channels from "@/data/channels.json";

interface EPG {
	epg_list: {
		desc: string;
		start_date: string;
		title: string;
	}[];
}

export interface NowNext {
	now: EPG["epg_list"][number] | null;
	next: EPG["epg_list"][number] | null;
}

export async function getNowNext(channel: string): Promise<NowNext> {
	let epg: EPG;
	const channelsMap = new Map(channels.map((c) => [c.id, c]));

	// Fetch the EPG data for the given channel from the API
	try {
		const res = await fetch(
			`https://epg.pw/api/epg.json?lang=en&date=${new Date().toISOString().slice(0, 10).replace(/-/g, "")}&channel_id=${channelsMap.get(channel)?.epg_id}`,
		);

		if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

		epg = await res.json();
	} catch (e) {
		console.error(`Error fetching EPG for channel ${channel}:`, e);

		// Return null for both on error
		return { now: null, next: null };
	}

	// Find the current and next program based on the current time
	const list = epg.epg_list;
	let currentIndex = -1;
	for (let i = 0; i < list.length; i++) {
		const start = new Date(list[i].start_date).getTime();
		if (start <= new Date().getTime()) {
			currentIndex = i;
		} else {
			break;
		}
	}

	// Return the current and next program, or null if not found
	return {
		now: currentIndex >= 0 ? list[currentIndex] : null,
		next:
			currentIndex >= 0 && currentIndex + 1 < list.length
				? list[currentIndex + 1]
				: null,
	};
}
