"use client";

import { motion } from "motion/react";
import type { Tag } from "@/lib/types";

export type FilterMode = "any" | "all";

interface TagFilterProps {
	tags: Tag[];
	selectedTags: Tag[];
	onToggleTag: (tag: Tag) => void;
	filterMode: FilterMode;
	onToggleFilterMode: () => void;
}

export default function TagFilter({
	tags,
	selectedTags,
	onToggleTag,
	filterMode,
	onToggleFilterMode,
}: TagFilterProps) {
	const hasSelection = selectedTags.length > 1;

	return (
		<motion.div
			className="tag-filter-section"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
		>
			<div className="tag-filter-container">
				{tags.map((tag) => {
					const isActive = selectedTags.includes(tag);
					return (
						<motion.button
							key={tag}
							onClick={() => onToggleTag(tag)}
							className={`tag-pill ${isActive ? "tag-pill-active" : ""}`}
							whileHover={{ scale: 1.08, y: -2 }}
							whileTap={{ scale: 0.9 }}
							layout
							transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
						>
							<motion.span
								className="tag-pill-label"
								animate={{ fontWeight: isActive ? 600 : 500 }}
							>
								{tag}
							</motion.span>
						</motion.button>
					);
				})}
			</div>

			{hasSelection && (
				<motion.div
					className="filter-mode-toggle"
					initial={{ opacity: 0, height: 0, y: -8 }}
					animate={{ opacity: 1, height: "auto", y: 0 }}
					exit={{ opacity: 0, height: 0, y: -8 }}
					transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
				>
					<span className="filter-mode-label">Show tracks that match:</span>
					<motion.button
						className="filter-mode-btn"
						onClick={onToggleFilterMode}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.92 }}
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
						aria-label={`Currently showing tracks matching ${filterMode === "any" ? "any of the selected tags" : "all selected tags"}. Click to toggle.`}
					>
						<motion.span
							className="filter-mode-indicator"
							layout
							transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
						>
							<span
								className={`filter-mode-option ${filterMode === "any" ? "filter-mode-option-active" : ""}`}
							>
								Any of these
							</span>
							<span
								className={`filter-mode-option ${filterMode === "all" ? "filter-mode-option-active" : ""}`}
							>
								All of these
							</span>
						</motion.span>
					</motion.button>
				</motion.div>
			)}
		</motion.div>
	);
}
