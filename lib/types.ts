export type MediaPlatform = "spotify" | "youtube";

export interface Tag {
	id: string;
	name: string;
}

export interface Recommendation {
	id: string;
	title: string;
	artist: string;
	url: string;
	platform: MediaPlatform;
	embedId: string;
	createdAt: string;
	tags: Tag[];
}

export type FilterMode = "any" | "all";

export const OWNER_EMAIL = "aviusanima@gmail.com";
