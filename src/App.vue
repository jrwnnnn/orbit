<script setup lang="ts">
import Hls from "hls.js";
import master from "@/data/master.json";
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

const currentChannel = ref<string>();

// Create a Map for quick lookup of channel data by ID
const data = new Map(master.map((c) => [c.id, c]));

let hls: Hls | null = null;
const hlsVideo = ref<HTMLVideoElement>();
const smpte = ref<HTMLDivElement>();
const osd = ref<HTMLDivElement>();
const toast = ref<HTMLDivElement>();

// Cleanup function to destroy the Hls instance and reset it
function cleanup() {
	hls?.destroy();
	hls = null;
}

watch(currentChannel, async (id) => {
	cleanup();
	if (!id) return;

	smpte.value?.classList.add("hidden");
	toast.value?.classList.add("hidden");
	if (hlsVideo.value) hlsVideo.value.style.display = "";

	osd.value?.classList.remove("animate-[disappear_7s_step-end_forwards]");
	void osd.value?.offsetWidth;
	osd.value?.classList.add("animate-[disappear_7s_step-end_forwards]");

	await nextTick();
	const src = data.get(id)?.url;
	if (!src || !hlsVideo.value) return;

	if (Hls.isSupported()) {
		hls = new Hls();
		hls.loadSource(src);
		hls.attachMedia(hlsVideo.value);

		// Handle HLS errors
		hls.on(Hls.Events.ERROR, (_event, error) => {
			console.warn("HLS error:", error);

			if (error.fatal) {
				console.error("HLS fatal error:", error);
				cleanup();

				smpte.value!.classList.remove("hidden");
				hlsVideo.value!.style.display = "none";
				osd.value!.classList.remove("animate-[disappear_7s_step-end_forwards]");
				toast.value!.classList.remove("hidden");
				toast.value!.textContent = `Failed to load the stream: ${error.error?.message}`;
			}
		});
	} else if (hlsVideo.value.canPlayType("application/vnd.apple.mpegurl")) {
		hlsVideo.value.src = src;
	}
});

// Keyboard navigation for channel selection
const channelIds = master.map((c) => c.id);
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
			case "Escape":
				currentChannel.value = undefined;
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
		<div v-if="!currentChannel" class="p-10">
			<div class="grid grid-cols-5 gap-5">
				<div
					v-for="channel in master"
					:key="channel.id"
					@click="currentChannel = channel.id"
					class="group flex flex-col"
				>
					<div
						class="flex h-40 grow items-center justify-center rounded-lg bg-neutral-800 transition hover:bg-neutral-700"
					>
						<img
							:src="data.get(channel.id)?.logo"
							class="max-h-20 w-24 object-contain"
							:alt="data.get(channel.id)?.name"
							loading="lazy"
						/>
					</div>
					<p
						class="mt-2 line-clamp-1 truncate text-center font-mono text-sm text-neutral-400 group-hover:font-bold"
					>
						{{ data.get(channel.id)?.name }}
					</p>
					<div class="mt-1 flex items-center justify-center gap-2">
						<span
							class="rounded-md border border-neutral-600 px-1 font-mono text-[0.7rem] text-neutral-400 uppercase"
						>
							{{ data.get(channel.id)?.country }}
						</span>
						<span
							v-if="data.get(channel.id)?.categories[0]"
							class="rounded-md border border-neutral-600 px-1 font-mono text-[0.7rem] text-neutral-400 capitalize"
						>
							{{ data.get(channel.id)?.categories[0] }}
						</span>
					</div>
				</div>
			</div>
			<div
				class="mt-20 flex flex-col items-center justify-center text-sm text-neutral-500"
			>
				<p>
					This website does not host or store content. All video streams are
					provided by external third-party sources.
				</p>

				<a class="underline" href="https://jrwnnnn.me" target="_blank">
					Mark Jerwin
				</a>
			</div>
		</div>
		<div v-else>
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
						<p class="text-2xl font-bold">
							{{ data.get(currentChannel)?.name }}
						</p>
						<div>
							<p>Now:</p>
							<p>Next:</p>
						</div>
					</div>

					<p
						ref="toast"
						class="hidden rounded-md bg-red-700 px-6 py-1 font-mono font-bold text-white"
					></p>
				</div>
			</div>
		</div>
	</main>
</template>

<style>
@keyframes disappear {
	0%,
	99% {
		opacity: 1;
	}
	100% {
		opacity: 0;
	}
}
</style>
