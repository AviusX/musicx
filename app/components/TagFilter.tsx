"use client";

import type { FilterMode, Tag } from "@/lib/types";

interface TagFilterProps {
	tags: Tag[];
	selectedIds: string[];
	onToggle: (id: string) => void;
	onClear: () => void;
	mode: FilterMode;
	onToggleMode: () => void;
	matchCount: number;
	isOwner: boolean;
	onManageTags: () => void;
}

export default function TagFilter({
	tags,
	selectedIds,
	onToggle,
	onClear,
	mode,
	onToggleMode,
	matchCount,
	isOwner,
	onManageTags,
}: TagFilterProps) {
	const hasSelection = selectedIds.length > 0;

	return (
		<div className="sticky top-16 z-40 border-b border-line bg-background/85 py-4 backdrop-blur-md">
			<div className="mx-auto flex max-w-[110rem] flex-wrap items-center gap-x-6 gap-y-3 px-5 sm:px-8">
				<span className="label shrink-0">
					Filter<span className="text-accent"> /</span> vibe
				</span>

				<div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by tag">
					{tags.map((tag) => {
						const active = selectedIds.includes(tag.id);
						return (
							<button
								key={tag.id}
								type="button"
								onClick={() => onToggle(tag.id)}
								aria-pressed={active}
								className={`border px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] transition-colors duration-200 ${
									active
										? "border-accent bg-accent text-accent-ink"
										: "border-line text-muted hover:border-foreground/50 hover:text-foreground"
								}`}
							>
								{tag.name}
							</button>
						);
					})}

					{isOwner && (
						<button
							type="button"
							onClick={onManageTags}
							className="border border-dashed border-line px-3.5 py-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted transition-colors hover:border-accent hover:text-accent"
						>
							+ Manage
						</button>
					)}
				</div>

				<div className="ml-auto flex items-center gap-4">
					{selectedIds.length >= 2 && (
						<button
							type="button"
							onClick={onToggleMode}
							aria-label={`Matching ${mode === "any" ? "any" : "all"} selected tags — click to switch`}
							className="group flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted transition-colors hover:text-foreground"
						>
							<span className={mode === "any" ? "text-accent" : ""}>Any</span>
							<span className="relative h-4 w-8 border border-line">
								<span
									className={`absolute top-0.5 h-2.5 w-2.5 bg-accent transition-all duration-300 ${
										mode === "any" ? "left-0.5" : "left-[1.05rem]"
									}`}
								/>
							</span>
							<span className={mode === "all" ? "text-accent" : ""}>All</span>
						</button>
					)}

					{hasSelection && (
						<button
							type="button"
							onClick={onClear}
							className="label !text-muted underline-offset-4 transition-colors hover:!text-accent hover:underline"
						>
							Clear
						</button>
					)}

					<span className="label tabular-nums" aria-live="polite">
						{String(matchCount).padStart(2, "0")}{" "}
						<span className="text-accent">rec{matchCount === 1 ? "" : "s"}</span>
					</span>
				</div>
			</div>
		</div>
	);
}
