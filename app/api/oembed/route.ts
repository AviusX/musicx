import { NextRequest, NextResponse } from "next/server";

const ALLOWED_DOMAINS = ["youtube.com", "youtu.be", "spotify.com"];

function isAllowedUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return ALLOWED_DOMAINS.some(
			(domain) =>
				parsed.hostname === domain ||
				parsed.hostname.endsWith(`.${domain}`),
		);
	} catch {
		return false;
	}
}

export async function GET(request: NextRequest) {
	const { searchParams } = request.nextUrl;
	const url = searchParams.get("url");
	const platform = searchParams.get("platform");

	if (!url || !platform) {
		return NextResponse.json(
			{ error: "Missing url or platform parameter" },
			{ status: 400 },
		);
	}

	if (!isAllowedUrl(url)) {
		return NextResponse.json(
			{ error: "URL not from an allowed domain" },
			{ status: 400 },
		);
	}

	try {
		let oembedUrl: string;
		if (platform === "youtube") {
			oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
		} else if (platform === "spotify") {
			oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
		} else {
			return NextResponse.json(
				{ error: "Unsupported platform" },
				{ status: 400 },
			);
		}

		const res = await fetch(oembedUrl);
		if (!res.ok) {
			return NextResponse.json(
				{ error: "Failed to fetch metadata" },
				{ status: 502 },
			);
		}

		const data = await res.json();

		let title: string;
		let artist: string;

		if (platform === "youtube") {
			title = data.title || "";
			artist = data.author_name || "";
		} else {
			// Spotify oEmbed returns title as "SONG by ARTIST"
			const raw = data.title || "";
			const byIndex = raw.lastIndexOf(" by ");
			if (byIndex > 0) {
				title = raw.substring(0, byIndex);
				artist = raw.substring(byIndex + 4);
			} else {
				title = raw;
				artist = "";
			}
		}

		return NextResponse.json({ title, artist });
	} catch {
		return NextResponse.json(
			{ error: "Internal server error" },
			{ status: 500 },
		);
	}
}
