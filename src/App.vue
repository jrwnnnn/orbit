<script setup lang="ts">
import channels from "@/data/channels.json";
import { getNowNext, type NowNext } from "@/lib/epg";
import Hls from "hls.js";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

// Create a map of channel IDs to channel objects
const channelsMap = new Map(channels.map((c) => [c.id, c]));

// The channel to be displayed
// Set the initial channel to the first one in the channels list
const currentChannel = ref<string>(channels[0]?.id);

// Store the current and next program information for the current channel
// Set the initial values to null, populated later on watch()
const epg = ref<NowNext>({
	now: null,
	next: null,
});

let player: Hls | null = null;
const hlsVideo = ref<HTMLVideoElement>();
const smpte = ref<HTMLDivElement>();
const osd = ref<HTMLDivElement>();
const toast = ref<HTMLDivElement>();

// Cleanup function to destroy the Hls instance and reset it
function cleanup() {
	player?.destroy();
	player = null;
}

watch(
	currentChannel,
	async (id) => {
		cleanup();
		if (!id) return;

		await nextTick();

		// Fetch the current and next program information for the selected channel
		getNowNext(id).then((result) => {
			epg.value = result;
		});

		smpte.value?.classList.add("hidden");
		toast.value?.classList.add("hidden");
		hlsVideo.value!.style.display = "";

		osd.value?.classList.remove("animate-[disappear_7s_step-end_forwards]");
		void osd.value?.offsetWidth;
		osd.value?.classList.add("animate-[disappear_7s_step-end_forwards]");

		const src = channelsMap.get(id)?.url;
		if (!src || !hlsVideo.value) return;

		if (Hls.isSupported()) {
			player = new Hls();
			player.loadSource(src);
			player.attachMedia(hlsVideo.value);

			// Handle fatal HLS errors by cleaning up the player and showing an error message on the OSD
			player.on(Hls.Events.ERROR, (_event, error) => {
				console.warn("HLS error:", error);

				if (error.fatal) {
					console.error("HLS fatal error:", error);
					cleanup();

					smpte.value!.classList.remove("hidden");
					hlsVideo.value!.style.display = "none";
					osd.value!.classList.remove(
						"animate-[disappear_7s_step-end_forwards]",
					);
					toast.value!.classList.remove("hidden");
					toast.value!.textContent = `Failed to load the stream: ${error.error?.message}`;
				}
			});
		} else if (hlsVideo.value.canPlayType("application/vnd.apple.mpegurl")) {
			// Set the video src directly for browsers that support HLS natively
			hlsVideo.value.src = src;
		}
	},
	{ immediate: true },
);

// Remote control navigation
const channelIds = channels.map((c) => c.id);
onMounted(() =>
	document.addEventListener("keydown", (e: KeyboardEvent) => {
		const idx = channelIds.indexOf(currentChannel.value as string);
		switch (e.key) {
			case "ArrowUp":
				if (idx > 0) currentChannel.value = channelIds[idx - 1];
				break;
			case "ArrowDown":
				if (idx < channelIds.length - 1)
					currentChannel.value = channelIds[idx + 1];
				break;
		}
	}),
);

onBeforeUnmount(() => {
	cleanup();
	document.removeEventListener("keydown", () => {});
});
</script>

<template>
	<main>
		<div class="flex justify-center max-h-dvh w-full bg-black">
			<img
				ref="smpte"
				src="https://t3.ftcdn.net/jpg/05/39/64/56/360_F_539645678_UGE3wFAgMELL8kdqp72FYd7J46df43Sj.jpg"
				class="hidden h-dvh object-cover"
			/>

			<video ref="hlsVideo" class="h-dvh" autoplay playsinline></video>

			<div
				ref="osd"
				class="pointer-events-none fixed inset-0 z-10 flex animate-[disappear_7s_step-end_forwards] flex-col justify-end gap-2 p-10"
			>
				<div class="rounded-md bg-black/80 px-6 py-3 font-mono text-white">
					<div class="flex gap-2 items-center">
						<p class="text-2xl font-bold mr-2">
							{{ channelsMap.get(currentChannel)?.name }}
						</p>
						<span class="tags uppercase">
							{{ channelsMap.get(currentChannel)?.country }}
						</span>
						<span
							v-if="channelsMap.get(currentChannel)?.categories[0]"
							class="tags capitalize"
						>
							{{ channelsMap.get(currentChannel)?.categories[0] }}
						</span>
					</div>

					<div>
						<p>Now: {{ epg.now?.title }}</p>
						<p>Next: {{ epg.next?.title }}</p>
					</div>
				</div>

				<p
					ref="toast"
					class="hidden rounded-md bg-red-700 px-6 py-1 font-mono font-bold text-white"
				></p>
			</div>
		</div>
	</main>
</template>
