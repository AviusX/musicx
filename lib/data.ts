import { createClient } from "@/lib/supabase/server";
import type { DbRecommendation, MediaItem, Tag } from "./types";
import { mapDbToMediaItem } from "./types";

export async function getRecommendations(): Promise<MediaItem[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("recommendations")
		.select("*")
		.order("created_at", { ascending: false });

	if (error) throw error;
	return (data as DbRecommendation[]).map(mapDbToMediaItem);
}

export async function getAllTags(): Promise<Tag[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("tags")
		.select("name")
		.order("name");

	if (error) throw error;
	return data.map((t: { name: string }) => t.name);
}

