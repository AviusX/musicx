"use client";

import { useState, useMemo, useCallback } from "react";
import { motion } from "motion/react";
import Header from "./Header";
import TagFilter, { type FilterMode } from "./TagFilter";
import MediaGrid from "./MediaGrid";
import MusicBackground from "./MusicBackground";
import { filterByTags } from "@/lib/filters";
import type { MediaItem, Tag } from "@/lib/types";

interface HomeClientProps {
	items: MediaItem[];
	tags: Tag[];
}

export default function HomeClient({ items, tags }: HomeClientProps) {
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [filterMode, setFilterMode] = useState<FilterMode>("any");

	const filteredItems = useMemo(
		() => filterByTags(items, selectedTags, filterMode),
		[items, selectedTags, filterMode],
	);

	const handleToggleTag = useCallback((tag: Tag) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	}, []);

	const handleToggleFilterMode = useCallback(() => {
		setFilterMode((prev) => (prev === "any" ? "all" : "any"));
	}, []);

	return (
		<>
			<MusicBackground />
			<Header />
			<main className="page-container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
				>
					<h1 className="page-title">
						<motion.span
							className="page-title-note"
							animate={{ rotate: [0, -12, 12, -8, 0] }}
							transition={{
								duration: 2,
								repeat: Infinity,
								repeatDelay: 5,
								ease: "easeInOut",
							}}
						>
							♪
						</motion.span>{" "}
						Hrijul&apos;s music recommendations
					</h1>
					<p className="page-subtitle">
						A mix of tracks and videos I love. Filter by vibe.
					</p>
				</motion.div>

				<TagFilter
					tags={tags}
					selectedTags={selectedTags}
					onToggleTag={handleToggleTag}
					filterMode={filterMode}
					onToggleFilterMode={handleToggleFilterMode}
				/>

				<MediaGrid items={filteredItems} />
			</main>
		</>
	);
}
