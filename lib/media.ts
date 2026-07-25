import type { MediaPlatform } from "./types";

export interface ParsedMediaLink {
	platform: MediaPlatform;
	embedId: string;
	/** Canonical URL for the media. */
	url: string;
}

/**
 * Parse a YouTube or Spotify link into a platform + embeddable id.
 * Supports youtube.com/watch, youtu.be, shorts, music.youtube.com,
 * and open.spotify.com/track links (with locale prefixes).
 */
export function parseMediaLink(raw: string): ParsedMediaLink | null {
	let url: URL;
	try {
		url = new URL(raw.trim());
	} catch {
		return null;
	}

	const host = url.hostname.replace(/^www\./, "");

	if (host === "youtu.be") {
		const id = url.pathname.slice(1).split("/")[0];
		return isYouTubeId(id) ? youtube(id) : null;
	}

	if (
		host === "youtube.com" ||
		host === "m.youtube.com" ||
		host === "music.youtube.com"
	) {
		const v = url.searchParams.get("v");
		if (v && isYouTubeId(v)) return youtube(v);
		const shorts = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
		if (shorts) return youtube(shorts[1]);
		return null;
	}

	if (host === "open.spotify.com") {
		// Path may include a locale segment, e.g. /intl-en/track/{id}
		const m = url.pathname.match(/\/track\/([A-Za-z0-9]{22})/);
		if (m) {
			return {
				platform: "spotify",
				embedId: m[1],
				url: `https://open.spotify.com/track/${m[1]}`,
			};
		}
		return null;
	}

	return null;
}

function isYouTubeId(id: string): boolean {
	return /^[\w-]{11}$/.test(id);
}

function youtube(id: string): ParsedMediaLink {
	return {
		platform: "youtube",
		embedId: id,
		url: `https://youtu.be/${id}`,
	};
}

export function youtubeThumbnail(
	embedId: string,
	quality: "hq" | "mq" | "sd" = "hq",
): string {
	return `https://img.youtube.com/vi/${embedId}/${quality}default.jpg`;
}
