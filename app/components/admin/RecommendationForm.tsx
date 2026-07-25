"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Modal from "../Modal";
import {
	createRecommendation,
	createTag,
	lookupLink,
	updateRecommendation,
	type RecommendationInput,
} from "@/app/actions";
import { parseMediaLink } from "@/lib/media";
import type { MediaPlatform, Recommendation, Tag } from "@/lib/types";

interface RecommendationFormProps {
	initial: Recommendation | null;
	tags: Tag[];
	onClose: () => void;
	onSaved: () => void;
}

export default function RecommendationForm({
	initial,
	tags,
	onClose,
	onSaved,
}: RecommendationFormProps) {
	const [link, setLink] = useState(initial?.url ?? "");
	const [title, setTitle] = useState(initial?.title ?? "");
	const [artist, setArtist] = useState(initial?.artist ?? "");
	const [platform, setPlatform] = useState<MediaPlatform | null>(
		initial?.platform ?? null,
	);
	const [embedId, setEmbedId] = useState(initial?.embedId ?? "");
	const [canonicalUrl, setCanonicalUrl] = useState(initial?.url ?? "");
	const [thumbnail, setThumbnail] = useState<string | null>(
		initial?.platform === "youtube"
			? `https://img.youtube.com/vi/${initial.embedId}/mqdefault.jpg`
			: null,
	);

	const [availableTags, setAvailableTags] = useState<Tag[]>(tags);
	const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
		initial?.tags.map((t) => t.id) ?? [],
	);
	const [newTagName, setNewTagName] = useState("");
	const [tagPending, setTagPending] = useState(false);

	const [lookingUp, setLookingUp] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isPending, startTransition] = useTransition();

	const lastLookedUp = useRef(initial?.embedId ?? "");

	// Sync the local tag list when the server-refreshed prop changes.
	const [prevTags, setPrevTags] = useState(tags);
	if (prevTags !== tags) {
		setPrevTags(tags);
		setAvailableTags(tags);
	}

	// Debounced autofill: paste a link, get title/artist/platform for free.
	useEffect(() => {
		const parsed = parseMediaLink(link);
		if (!parsed || parsed.embedId === lastLookedUp.current) return;

		const handle = setTimeout(async () => {
			lastLookedUp.current = parsed.embedId;
			setLookingUp(true);
			setError(null);
			const result = await lookupLink(link);
			setLookingUp(false);
			if (result.ok) {
				setPlatform(result.data.platform);
				setEmbedId(result.data.embedId);
				setCanonicalUrl(result.data.url);
				setThumbnail(result.data.thumbnailUrl);
				if (result.data.title) setTitle(result.data.title);
				if (result.data.artist) setArtist(result.data.artist);
			}
		}, 500);

		return () => clearTimeout(handle);
	}, [link]);

	const linkInvalid =
		link.trim() !== "" && parseMediaLink(link) === null && !embedId;

	const toggleTag = useCallback((id: string) => {
		setSelectedTagIds((prev) =>
			prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
		);
	}, []);

	const handleAddTag = useCallback(async () => {
		const name = newTagName.trim();
		if (!name || tagPending) return;
		setTagPending(true);
		setError(null);
		const result = await createTag(name);
		setTagPending(false);
		if (result.ok) {
			setAvailableTags((prev) =>
				[...prev.filter((t) => t.id !== result.tag.id), result.tag].sort(
					(a, b) => a.name.localeCompare(b.name),
				),
			);
			setSelectedTagIds((prev) => [...prev, result.tag.id]);
			setNewTagName("");
		} else {
			setError(result.error);
		}
	}, [newTagName, tagPending]);

	const handleSubmit = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!platform || !embedId) {
				setError("Paste a valid YouTube or Spotify link first.");
				return;
			}
			const input: RecommendationInput = {
				title,
				artist,
				url: canonicalUrl,
				platform,
				embedId,
				tagIds: selectedTagIds,
			};
			setError(null);
			startTransition(async () => {
				const result = initial
					? await updateRecommendation(initial.id, input)
					: await createRecommendation(input);
				if (result.ok) {
					onSaved();
				} else {
					setError(result.error);
				}
			});
		},
		[
			artist,
			canonicalUrl,
			embedId,
			initial,
			onSaved,
			platform,
			selectedTagIds,
			title,
		],
	);

	return (
		<Modal title={initial ? "Edit track" : "Add track"} onClose={onClose} wide>
			<form onSubmit={handleSubmit} className="flex flex-col gap-5">
				{/* Link */}
				<div className="flex flex-col gap-1.5">
					<label htmlFor="rec-link" className="label">
						Link <span className="text-accent">— paste & we fill the rest</span>
					</label>
					<input
						id="rec-link"
						type="url"
						className="field font-mono text-xs"
						placeholder="https://youtu.be/… or https://open.spotify.com/track/…"
						value={link}
						onChange={(e) => setLink(e.target.value)}
						autoFocus={!initial}
						required
					/>
					<div className="flex min-h-4 items-center gap-3">
						{lookingUp && (
							<span className="label !text-accent">Fetching details…</span>
						)}
						{!lookingUp && platform && embedId && (
							<span className="label">
								<span className="text-accent">✓</span> {platform} ·{" "}
								<span className="text-foreground/70">{embedId}</span>
							</span>
						)}
						{linkInvalid && (
							<span className="label !text-accent">
								Unrecognized link — YouTube videos & Spotify tracks only
							</span>
						)}
					</div>
				</div>

				{/* Preview + fields */}
				<div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
					<div className="relative hidden aspect-video overflow-hidden border border-line bg-background sm:block">
						{thumbnail ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={thumbnail}
								alt=""
								className="h-full w-full object-cover"
							/>
						) : (
							<span className="absolute inset-0 flex items-center justify-center">
								<svg
									className="h-8 w-8 text-line"
									viewBox="0 0 24 24"
									fill="currentColor"
									aria-hidden
								>
									<path
										d="M9 18V5l12-2v13"
										strokeWidth={1.5}
										stroke="currentColor"
										fill="none"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
									<circle
										cx="6"
										cy="18"
										r="3"
										fill="none"
										stroke="currentColor"
										strokeWidth={1.5}
									/>
									<circle
										cx="18"
										cy="16"
										r="3"
										fill="none"
										stroke="currentColor"
										strokeWidth={1.5}
									/>
								</svg>
							</span>
						)}
					</div>

					<div className="flex flex-col gap-4">
						<div className="flex flex-col gap-1.5">
							<label htmlFor="rec-title" className="label">
								Title
							</label>
							<input
								id="rec-title"
								type="text"
								className="field"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								required
							/>
						</div>
						<div className="flex flex-col gap-1.5">
							<label htmlFor="rec-artist" className="label">
								Artist / channel
							</label>
							<input
								id="rec-artist"
								type="text"
								className="field"
								value={artist}
								onChange={(e) => setArtist(e.target.value)}
							/>
						</div>
					</div>
				</div>

				{/* Tags */}
				<div className="flex flex-col gap-2">
					<span className="label">Tags</span>
					<div className="flex flex-wrap items-center gap-2">
						{availableTags.map((tag) => {
							const active = selectedTagIds.includes(tag.id);
							return (
								<button
									key={tag.id}
									type="button"
									onClick={() => toggleTag(tag.id)}
									aria-pressed={active}
									className={`border px-3 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-colors ${
										active
											? "border-accent bg-accent text-accent-ink"
											: "border-line text-muted hover:border-foreground/50 hover:text-foreground"
									}`}
								>
									{tag.name}
								</button>
							);
						})}
						<span className="flex items-center gap-1.5">
							<input
								type="text"
								aria-label="New tag name"
								className="field !w-28 !px-2.5 !py-1 font-mono !text-[0.68rem] uppercase tracking-[0.14em]"
								placeholder="new tag"
								value={newTagName}
								onChange={(e) => setNewTagName(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										handleAddTag();
									}
								}}
							/>
							<button
								type="button"
								onClick={handleAddTag}
								disabled={!newTagName.trim() || tagPending}
								className="border border-dashed border-line px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-40"
							>
								{tagPending ? "…" : "+ Add"}
							</button>
						</span>
					</div>
				</div>

				{error && (
					<p
						className="border border-accent/40 bg-accent/5 px-4 py-2.5 text-sm text-accent"
						role="alert"
					>
						{error}
					</p>
				)}

				<div className="flex items-center justify-end gap-4 border-t border-line pt-5">
					<button
						type="button"
						onClick={onClose}
						className="label !text-muted transition-colors hover:!text-foreground"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isPending}
						className="inline-flex h-11 items-center gap-2 bg-foreground px-6 text-sm font-medium text-background transition-colors duration-300 hover:bg-accent hover:text-accent-ink disabled:opacity-50"
					>
						{isPending
							? "Saving…"
							: initial
								? "Save changes"
								: "Add to archive"}
					</button>
				</div>
			</form>
		</Modal>
	);
}
