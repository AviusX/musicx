import { createStaticClient } from "./supabase/static";
import type { FilterMode, Recommendation, Tag } from "./types";

interface RecommendationRow {
	id: string;
	title: string;
	artist: string;
	url: string;
	platform: "spotify" | "youtube";
	embed_id: string;
	created_at: string;
	recommendation_tags: { tags: { id: string; name: string } | null }[];
}

export interface Catalog {
	recommendations: Recommendation[];
	tags: Tag[];
}

export async function getCatalog(): Promise<Catalog> {
	const supabase = createStaticClient();

	const [recsRes, tagsRes] = await Promise.all([
		supabase
			.from("recommendations")
			.select(
				"id, title, artist, url, platform, embed_id, created_at, recommendation_tags(tags(id, name))",
			)
			.order("created_at", { ascending: false }),
		supabase.from("tags").select("id, name").order("name"),
	]);

	if (recsRes.error) throw recsRes.error;
	if (tagsRes.error) throw tagsRes.error;

	const recommendations = (recsRes.data as unknown as RecommendationRow[]).map(
		(row): Recommendation => ({
			id: row.id,
			title: row.title,
			artist: row.artist,
			url: row.url,
			platform: row.platform,
			embedId: row.embed_id,
			createdAt: row.created_at,
			tags: row.recommendation_tags
				.map((rt) => rt.tags)
				.filter((t): t is Tag => t !== null)
				.sort((a, b) => a.name.localeCompare(b.name)),
		}),
	);

	return { recommendations, tags: tagsRes.data as Tag[] };
}

export function filterByTags(
	items: Recommendation[],
	selectedTagIds: string[],
	mode: FilterMode = "any",
): Recommendation[] {
	if (selectedTagIds.length === 0) return items;
	if (mode === "all") {
		return items.filter((item) =>
			selectedTagIds.every((id) => item.tags.some((t) => t.id === id)),
		);
	}
	return items.filter((item) =>
		selectedTagIds.some((id) => item.tags.some((t) => t.id === id)),
	);
}
