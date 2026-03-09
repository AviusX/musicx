import type { MediaItem, Tag } from "./types";
import recommendations from "@/data/recommendations.json";

export function getRecommendations(): MediaItem[] {
	return recommendations as MediaItem[];
}

export function getAllTags(): Tag[] {
	const tags = new Set<Tag>();
	for (const item of getRecommendations()) {
		for (const tag of item.tags) {
			tags.add(tag);
		}
	}
	return Array.from(tags).sort();
}

export function filterByTags(
	items: MediaItem[],
	selectedTags: Tag[],
	mode: "any" | "all" = "any",
): MediaItem[] {
	if (selectedTags.length === 0) return items;
	if (mode === "all") {
		return items.filter((item) =>
			selectedTags.every((tag) => item.tags.includes(tag)),
		);
	}
	return items.filter((item) =>
		selectedTags.some((tag) => item.tags.includes(tag)),
	);
}
