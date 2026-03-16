export type MediaPlatform = "spotify" | "youtube";

export type Tag = string;

export interface MediaItem {
	id: string;
	title: string;
	artist: string;
	url: string;
	platform: MediaPlatform;
	tags: Tag[];
	embedId: string; // Spotify track ID or YouTube video ID
}

export interface DbRecommendation {
	id: string;
	title: string;
	artist: string;
	url: string;
	platform: string;
	tags: string[];
	embed_id: string;
	author_id: string;
	created_at: string;
}

export function mapDbToMediaItem(row: DbRecommendation): MediaItem {
	return {
		id: row.id,
		title: row.title,
		artist: row.artist,
		url: row.url,
		platform: row.platform as MediaPlatform,
		tags: row.tags,
		embedId: row.embed_id,
	};
}
