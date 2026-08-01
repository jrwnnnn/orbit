import Hls from "hls.js";

export function initPlayer() {
	const smpte = document.getElementById("smpte") as HTMLImageElement;
	const video = document.getElementById("hls-video") as HTMLVideoElement;
	const osd = document.getElementById("osd") as HTMLDivElement;
	const toast = document.getElementById(
		"osd-toast-error",
	) as HTMLParagraphElement;
	const dataset = video.dataset.src;

	if (dataset) {
		const isHttp = dataset.startsWith("http://");
		const src = isHttp
			? `/api/proxy?url=${encodeURIComponent(dataset)}`
			: dataset;

		if (isHttp) {
			console.warn("HLS Source is HTTP, using proxy...");
		}

		if (src) {
			if (Hls.isSupported()) {
				const hls = new Hls();
				hls.loadSource(src);
				hls.attachMedia(video);

				hls.on(Hls.Events.ERROR, (_event, error) => {
					if (error.fatal) {
						console.error("HLS Error:", error);
						hls.destroy();

						smpte.style.display = "block";
						video.style.display = "none";
						osd.classList.remove("animate-[disappear_7s_step-end_forwards]");
						toast.classList.remove("hidden");

						if (error.response?.code === 403) {
							osd.classList.add("cursor-pointer");
							osd.classList.remove("pointer-events-none");
							osd.addEventListener("click", () => {
								location.href = dataset;
							});
							toast.textContent =
								"This stream could not be loaded in this viewer. Click here to open it directly.";
						} else {
							toast.textContent = `Failed to load the stream: ${error.error?.message}`;
						}
					}
				});
			} else if (video.canPlayType("application/vnd.apple.mpegurl")) {
				video.src = src;
			}
		}
	}
}
