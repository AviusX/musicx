"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseMediaLink, youtubeThumbnail } from "@/lib/media";
import { OWNER_EMAIL, type MediaPlatform, type Tag } from "@/lib/types";

type ActionResult = { ok: true } | { ok: false; error: string };

async function requireOwner() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();
	if (!user || user.email?.toLowerCase() !== OWNER_EMAIL) {
		throw new Error("Not authorized.");
	}
	return { supabase, user };
}

function toError(e: unknown): { ok: false; error: string } {
	return { ok: false, error: e instanceof Error ? e.message : "Something went wrong." };
}

/* ------------------------------ auth ------------------------------ */

export interface SignInState {
	error: string | null;
}

export async function signIn(
	_prev: SignInState,
	formData: FormData,
): Promise<SignInState> {
	const email = String(formData.get("email") ?? "").trim();
	const password = String(formData.get("password") ?? "");

	if (!email || !password) {
		return { error: "Email and password are required." };
	}

	const supabase = await createClient();
	const { error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) {
		return { error: "Invalid credentials." };
	}
	redirect("/");
}

export async function signOut(): Promise<void> {
	const supabase = await createClient();
	await supabase.auth.signOut();
	redirect("/");
}

/* -------------------------- link autofill -------------------------- */

export interface LinkLookup {
	platform: MediaPlatform;
	embedId: string;
	url: string;
	title: string;
	artist: string;
	thumbnailUrl: string | null;
}

export async function lookupLink(
	rawUrl: string,
): Promise<{ ok: true; data: LinkLookup } | { ok: false; error: string }> {
	const parsed = parseMediaLink(rawUrl);
	if (!parsed) {
		return {
			ok: false,
			error: "Paste a YouTube video or Spotify track link.",
		};
	}

	let title = "";
	let artist = "";
	let thumbnailUrl: string | null = null;

	try {
		const oembedUrl =
			parsed.platform === "youtube"
				? `https://www.youtube.com/oembed?url=${encodeURIComponent(parsed.url)}&format=json`
				: `https://open.spotify.com/oembed?url=${encodeURIComponent(parsed.url)}`;

		const res = await fetch(oembedUrl, {
			headers: { accept: "application/json" },
			signal: AbortSignal.timeout(6000),
		});
		if (res.ok) {
			const meta = (await res.json()) as {
				title?: string;
				author_name?: string;
				thumbnail_url?: string;
			};
			title = meta.title ?? "";
			artist = meta.author_name ?? "";
			thumbnailUrl = meta.thumbnail_url ?? null;
		}
	} catch {
		// oEmbed is best-effort; the parsed link is still usable.
	}

	if (parsed.platform === "youtube" && !thumbnailUrl) {
		thumbnailUrl = youtubeThumbnail(parsed.embedId);
	}

	return {
		ok: true,
		data: { ...parsed, title, artist, thumbnailUrl },
	};
}

/* ----------------------- recommendation CRUD ----------------------- */

export interface RecommendationInput {
	title: string;
	artist: string;
	url: string;
	platform: MediaPlatform;
	embedId: string;
	tagIds: string[];
}

function validateInput(input: RecommendationInput): string | null {
	if (!input.title.trim()) return "Title is required.";
	if (!input.embedId || !input.url) return "A valid YouTube or Spotify link is required.";
	if (input.platform !== "youtube" && input.platform !== "spotify") {
		return "Unsupported platform.";
	}
	return null;
}

export async function createRecommendation(
	input: RecommendationInput,
): Promise<ActionResult> {
	try {
		const invalid = validateInput(input);
		if (invalid) return { ok: false, error: invalid };

		const { supabase, user } = await requireOwner();

		const { data, error } = await supabase
			.from("recommendations")
			.insert({
				title: input.title.trim(),
				artist: input.artist.trim(),
				url: input.url,
				platform: input.platform,
				embed_id: input.embedId,
				author_id: user.id,
			})
			.select("id")
			.single();
		if (error) throw error;

		if (input.tagIds.length > 0) {
			const { error: tagError } = await supabase.from("recommendation_tags").insert(
				input.tagIds.map((tagId) => ({
					recommendation_id: data.id,
					tag_id: tagId,
				})),
			);
			if (tagError) throw tagError;
		}

		revalidatePath("/");
		return { ok: true };
	} catch (e) {
		return toError(e);
	}
}

export async function updateRecommendation(
	id: string,
	input: RecommendationInput,
): Promise<ActionResult> {
	try {
		const invalid = validateInput(input);
		if (invalid) return { ok: false, error: invalid };

		const { supabase } = await requireOwner();

		const { error } = await supabase
			.from("recommendations")
			.update({
				title: input.title.trim(),
				artist: input.artist.trim(),
				url: input.url,
				platform: input.platform,
				embed_id: input.embedId,
			})
			.eq("id", id);
		if (error) throw error;

		const { error: clearError } = await supabase
			.from("recommendation_tags")
			.delete()
			.eq("recommendation_id", id);
		if (clearError) throw clearError;

		if (input.tagIds.length > 0) {
			const { error: tagError } = await supabase.from("recommendation_tags").insert(
				input.tagIds.map((tagId) => ({ recommendation_id: id, tag_id: tagId })),
			);
			if (tagError) throw tagError;
		}

		revalidatePath("/");
		return { ok: true };
	} catch (e) {
		return toError(e);
	}
}

export async function deleteRecommendation(id: string): Promise<ActionResult> {
	try {
		const { supabase } = await requireOwner();
		const { error } = await supabase.from("recommendations").delete().eq("id", id);
		if (error) throw error;

		revalidatePath("/");
		return { ok: true };
	} catch (e) {
		return toError(e);
	}
}

/* ------------------------------ tag CRUD ------------------------------ */

export async function createTag(
	name: string,
): Promise<{ ok: true; tag: Tag } | { ok: false; error: string }> {
	try {
		const trimmed = name.trim();
		if (!trimmed) return { ok: false, error: "Tag name is required." };
		if (trimmed.length > 32) return { ok: false, error: "Tag name is too long." };

		const { supabase } = await requireOwner();
		const { data, error } = await supabase
			.from("tags")
			.insert({ name: trimmed })
			.select("id, name")
			.single();
		if (error) {
			if (error.code === "23505") return { ok: false, error: "Tag already exists." };
			throw error;
		}

		revalidatePath("/");
		return { ok: true, tag: data as Tag };
	} catch (e) {
		return toError(e);
	}
}

export async function renameTag(id: string, name: string): Promise<ActionResult> {
	try {
		const trimmed = name.trim();
		if (!trimmed) return { ok: false, error: "Tag name is required." };

		const { supabase } = await requireOwner();
		const { error } = await supabase.from("tags").update({ name: trimmed }).eq("id", id);
		if (error) {
			if (error.code === "23505") return { ok: false, error: "Tag already exists." };
			throw error;
		}

		revalidatePath("/");
		return { ok: true };
	} catch (e) {
		return toError(e);
	}
}

export async function deleteTag(id: string): Promise<ActionResult> {
	try {
		const { supabase } = await requireOwner();
		const { error } = await supabase.from("tags").delete().eq("id", id);
		if (error) throw error;

		revalidatePath("/");
		return { ok: true };
	} catch (e) {
		return toError(e);
	}
}
