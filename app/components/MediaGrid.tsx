"use client";

import { AnimatePresence, motion } from "motion/react";
import type { MediaItem } from "@/lib/types";
import MediaCard from "./MediaCard";

interface MediaGridProps {
	items: MediaItem[];
}

const containerVariants = {
	hidden: {},
	visible: {
		transition: {
			staggerChildren: 0.06,
			delayChildren: 0.1,
		},
	},
};

export default function MediaGrid({ items }: MediaGridProps) {
	return (
		<motion.div
			className="media-grid"
			variants={containerVariants}
			initial="hidden"
			animate="visible"
			layout
		>
			<AnimatePresence mode="popLayout">
				{items.map((item) => (
					<MediaCard key={item.id} item={item} />
				))}
			</AnimatePresence>
			<AnimatePresence>
				{items.length === 0 && (
					<motion.div
						className="media-grid-empty"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.3 }}
					>
						<motion.span
							style={{
								fontSize: "2rem",
								display: "block",
								marginBottom: "0.75rem",
							}}
							animate={{ rotate: [0, -15, 15, 0] }}
							transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
						>
							🎵
						</motion.span>
						No tracks match the selected tags.
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}
