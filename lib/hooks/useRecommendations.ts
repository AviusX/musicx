"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { DbRecommendation, MediaItem } from "@/lib/types";
import { dbToMediaItem } from "@/lib/types";

export function useRecommendations() {
	const supabase = createClient();

	return useQuery<MediaItem[]>({
		queryKey: ["recommendations"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("recommendations")
				.select("*")
				.order("created_at", { ascending: true });

			if (error) throw error;
			return (data as DbRecommendation[]).map(dbToMediaItem);
		},
	});
}

export function useTags() {
	const supabase = createClient();

	return useQuery<string[]>({
		queryKey: ["tags"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("tags")
				.select("name")
				.order("name");

			if (error) throw error;
			return data.map((t: { name: string }) => t.name);
		},
	});
}

interface AddRecommendationInput {
	title: string;
	artist: string;
	url: string;
	platform: "spotify" | "youtube";
	tags: string[];
	embed_id: string;
}

export function useAddRecommendation() {
	const supabase = createClient();
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (input: AddRecommendationInput) => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			const { data, error } = await supabase
				.from("recommendations")
				.insert({
					...input,
					author_id: user.id,
				})
				.select()
				.single();

			if (error) throw error;

			// Insert any new tags that don't exist yet
			for (const tag of input.tags) {
				await supabase
					.from("tags")
					.upsert({ name: tag }, { onConflict: "name" });
			}

			return data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["recommendations"] });
			queryClient.invalidateQueries({ queryKey: ["tags"] });
		},
	});
}
