export type MediaPlatform = "spotify" | "youtube";

export type Tag = "AMV" | "Chill" | "Guitar" | "Sad" | "Acoustic";

export interface MediaItem {
	id: string;
	title: string;
	artist: string;
	url: string;
	platform: MediaPlatform;
	tags: Tag[];
	embedId: string; // Spotify track ID or YouTube video ID
}
