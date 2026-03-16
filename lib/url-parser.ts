export interface ParsedUrl {
	platform: "youtube" | "spotify";
	embedId: string;
	url: string;
}

export function parseMediaUrl(input: string): ParsedUrl | null {
	const trimmed = input.trim();

	// YouTube patterns
	const ytPatterns = [
		/(?:youtube\.com\/watch\?.*v=)([\w-]{11})/,
		/(?:youtu\.be\/)([\w-]{11})/,
		/(?:youtube\.com\/embed\/)([\w-]{11})/,
		/(?:youtube\.com\/shorts\/)([\w-]{11})/,
	];

	for (const pattern of ytPatterns) {
		const match = trimmed.match(pattern);
		if (match) {
			return {
				platform: "youtube",
				embedId: match[1],
				url: trimmed,
			};
		}
	}

	// Spotify patterns
	const spotifyMatch = trimmed.match(
		/open\.spotify\.com\/track\/([\w]+)/,
	);
	if (spotifyMatch) {
		return {
			platform: "spotify",
			embedId: spotifyMatch[1],
			url: trimmed,
		};
	}

	return null;
}

export interface OembedResult {
	title: string;
	artist: string;
}

export async function fetchOembedData(
	url: string,
	platform: "youtube" | "spotify",
): Promise<OembedResult | null> {
	try {
		const res = await fetch(
			`/api/oembed?url=${encodeURIComponent(url)}&platform=${platform}`,
		);
		if (!res.ok) return null;
		return await res.json();
	} catch {
		return null;
	}
}
