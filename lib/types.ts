export type MediaPlatform = "spotify" | "youtube";

export type Tag = "AMV" | "Chill" | "Guitar" | "Sad" | "Acoustic" | "Soft" | string;

export interface MediaItem {
	id: string;
	title: string;
	artist: string;
	url: string;
	platform: MediaPlatform;
	tags: Tag[];
	embedId: string;
}

// Database row shape (snake_case from Supabase)
export interface DbRecommendation {
	id: string;
	title: string;
	artist: string;
	url: string;
	platform: MediaPlatform;
	tags: string[];
	embed_id: string;
	author_id: string;
	created_at: string;
}

export function dbToMediaItem(row: DbRecommendation): MediaItem {
	return {
		id: row.id,
		title: row.title,
		artist: row.artist,
		url: row.url,
		platform: row.platform,
		tags: row.tags as Tag[],
		embedId: row.embed_id,
	};
}
