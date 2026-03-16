import type { MediaItem, Tag } from "./types";

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
