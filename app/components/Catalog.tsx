"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TagFilter from "./TagFilter";
import MediaCard from "./MediaCard";
import RecommendationForm from "./admin/RecommendationForm";
import TagManager from "./admin/TagManager";
import { deleteRecommendation } from "@/app/actions";
import { filterByTags } from "@/lib/data";
import { useOwner } from "@/lib/useOwner";
import type { FilterMode, Recommendation, Tag } from "@/lib/types";

interface CatalogProps {
	recommendations: Recommendation[];
	tags: Tag[];
}

export default function Catalog({ recommendations, tags }: CatalogProps) {
	const router = useRouter();
	const isOwner = useOwner();

	const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
	const [mode, setMode] = useState<FilterMode>("any");
	const [playingId, setPlayingId] = useState<string | null>(null);
	const [formItem, setFormItem] = useState<Recommendation | null>(null);
	const [formOpen, setFormOpen] = useState(false);
	const [tagManagerOpen, setTagManagerOpen] = useState(false);
	const [actionError, setActionError] = useState<string | null>(null);

	const filtered = useMemo(
		() => filterByTags(recommendations, selectedTagIds, mode),
		[recommendations, selectedTagIds, mode],
	);

	// Remount cards when the filter changes so the entrance animation replays.
	const filterKey = `${selectedTagIds.join(".")}-${mode}`;

	const handleToggleTag = useCallback((id: string) => {
		setPlayingId(null);
		setSelectedTagIds((prev) =>
			prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
		);
	}, []);

	const handleClear = useCallback(() => {
		setPlayingId(null);
		setSelectedTagIds([]);
	}, []);

	const handleToggleMode = useCallback(() => {
		setPlayingId(null);
		setMode((prev) => (prev === "any" ? "all" : "any"));
	}, []);

	const handlePlayToggle = useCallback((id: string) => {
		setPlayingId((prev) => (prev === id ? null : id));
	}, []);

	const handleEdit = useCallback((item: Recommendation) => {
		setFormItem(item);
		setFormOpen(true);
	}, []);

	const handleAdd = useCallback(() => {
		setFormItem(null);
		setFormOpen(true);
	}, []);

	const handleDelete = useCallback(
		async (item: Recommendation) => {
			setActionError(null);
			const result = await deleteRecommendation(item.id);
			if (result.ok) {
				router.refresh();
			} else {
				setActionError(result.error);
			}
		},
		[router],
	);

	const handleSaved = useCallback(() => {
		setFormOpen(false);
		router.refresh();
	}, [router]);

	const handleTagsChanged = useCallback(() => {
		router.refresh();
	}, [router]);

	return (
		<section
			id="catalog"
			aria-label="Music recommendations"
			className="border-t border-line"
		>
			<h2 className="sr-only">The Archive</h2>
			<TagFilter
				tags={tags}
				selectedIds={selectedTagIds}
				onToggle={handleToggleTag}
				onClear={handleClear}
				mode={mode}
				onToggleMode={handleToggleMode}
				matchCount={filtered.length}
				isOwner={isOwner}
				onManageTags={() => setTagManagerOpen(true)}
			/>

			<div className="mx-auto max-w-[110rem] px-5 py-12 sm:px-8 sm:py-16">
				{actionError && (
					<p
						className="mb-6 border border-accent/40 bg-accent/5 px-4 py-2.5 text-sm text-accent"
						role="alert"
					>
						{actionError}
					</p>
				)}

				{filtered.length > 0 ? (
					<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
						{filtered.map((item, i) => (
							<MediaCard
								key={`${filterKey}-${item.id}`}
								item={item}
								index={i}
								delay={Math.min(i, 11) * 0.05}
								playing={playingId === item.id}
								onPlayToggle={handlePlayToggle}
								isOwner={isOwner}
								onEdit={handleEdit}
								onDelete={handleDelete}
							/>
						))}
					</div>
				) : (
					<div className="flex flex-col items-center gap-4 py-24 text-center">
						<span className="display text-outline text-6xl">Silence</span>
						<p className="text-muted">
							Nothing matches that combination of vibes
							{mode === "all" ? " — try switching to “any”" : ""}.
						</p>
						<button
							type="button"
							onClick={handleClear}
							className="label !text-accent underline-offset-4 hover:underline"
						>
							Clear filters
						</button>
					</div>
				)}
			</div>

			{/* Admin layer */}
			{isOwner && (
				<button
					type="button"
					onClick={handleAdd}
					className="fixed bottom-6 right-6 z-50 inline-flex h-13 items-center gap-2 bg-accent px-6 text-sm font-semibold text-accent-ink shadow-xl transition-transform duration-300 hover:scale-105"
				>
					<svg
						className="h-4 w-4"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={2.5}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M12 4.5v15m7.5-7.5h-15"
						/>
					</svg>
					Add track
				</button>
			)}

			{formOpen && (
				<RecommendationForm
					initial={formItem}
					tags={tags}
					onClose={() => setFormOpen(false)}
					onSaved={handleSaved}
				/>
			)}

			{tagManagerOpen && (
				<TagManager
					tags={tags}
					onClose={() => setTagManagerOpen(false)}
					onChanged={handleTagsChanged}
				/>
			)}
		</section>
	);
}
