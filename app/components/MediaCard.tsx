"use client";

import { useCallback, useState, type CSSProperties } from "react";
import Image from "next/image";
import type { Recommendation } from "@/lib/types";
import { youtubeThumbnail } from "@/lib/media";

interface MediaCardProps {
	item: Recommendation;
	index: number;
	delay: number;
	playing: boolean;
	onPlayToggle: (id: string) => void;
	isOwner: boolean;
	onEdit: (item: Recommendation) => void;
	onDelete: (item: Recommendation) => void;
}

const THUMB_QUALITIES = ["hq", "mq", "sd"] as const;

function PlayOverlay() {
	return (
		<span className="absolute inset-0 flex items-center justify-center">
			<span className="flex h-14 w-14 items-center justify-center bg-accent text-accent-ink shadow-lg transition-transform duration-300 group-hover/card:scale-110">
				<svg className="ml-0.5 h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<polygon points="6 3 20 12 6 21 6 3" />
				</svg>
			</span>
		</span>
	);
}

function SpotifyCover({ title }: { title: string }) {
	return (
		<span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent)_14%,var(--surface)),var(--surface))]">
			<svg className="h-10 w-10 text-foreground/60" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
				<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
			</svg>
			<span className="label max-w-[80%] truncate !text-foreground/70">{title}</span>
		</span>
	);
}

export default function MediaCard({
	item,
	index,
	delay,
	playing,
	onPlayToggle,
	isOwner,
	onEdit,
	onDelete,
}: MediaCardProps) {
	const [copied, setCopied] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [thumbQuality, setThumbQuality] = useState(0);
	const [thumbFailed, setThumbFailed] = useState(false);

	const isSpotify = item.platform === "spotify";
	const platformLabel = isSpotify ? "Spotify" : "YouTube";

	const handleCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(item.url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {}
	}, [item.url]);

	const handleThumbError = useCallback(() => {
		setThumbQuality((q) => {
			if (q < THUMB_QUALITIES.length - 1) return q + 1;
			setThumbFailed(true);
			return q;
		});
	}, []);

	const handleDeleteClick = useCallback(() => {
		if (!confirmingDelete) {
			setConfirmingDelete(true);
			setTimeout(() => setConfirmingDelete(false), 3500);
			return;
		}
		setConfirmingDelete(false);
		onDelete(item);
	}, [confirmingDelete, item, onDelete]);

	return (
		<article
			className="card-in group/card relative flex flex-col border border-line bg-surface transition-colors duration-300 hover:border-accent/60"
			style={{ "--d": `${delay}s` } as CSSProperties}
		>
			{/* Media area */}
			<div className="relative aspect-video overflow-hidden border-b border-line bg-background">
				{playing ? (
					isSpotify ? (
						<iframe
							className="h-full w-full"
							src={`https://open.spotify.com/embed/track/${item.embedId}?utm_source=generator`}
							title={item.title}
							allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
							loading="lazy"
						/>
					) : (
						<iframe
							className="h-full w-full"
							src={`https://www.youtube.com/embed/${item.embedId}?rel=0&autoplay=1`}
							title={item.title}
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
						/>
					)
				) : (
					<button
						type="button"
						onClick={() => onPlayToggle(item.id)}
						aria-label={`Play ${item.title}`}
						className="absolute inset-0 text-left"
					>
						{isSpotify || thumbFailed ? (
							<SpotifyCover title={item.title} />
						) : (
							<Image
								src={youtubeThumbnail(item.embedId, THUMB_QUALITIES[thumbQuality])}
								alt=""
								fill
								sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw"
								className="thumb-duotone object-cover"
								onError={handleThumbError}
							/>
						)}
						<PlayOverlay />
					</button>
				)}
			</div>

			{/* Info */}
			<div className="flex grow flex-col gap-2.5 p-5">
				<div className="flex items-center justify-between">
					<span className="flex items-center gap-2.5">
						<span aria-hidden className="display text-outline-strong text-2xl leading-none">
							{String(index + 1).padStart(2, "0")}
						</span>
						{playing && (
							<span className="eq" aria-label="Now playing">
								<span />
								<span />
								<span />
								<span />
							</span>
						)}
					</span>
					<span className="label !text-[0.6rem]">{platformLabel}</span>
				</div>

				<h3 className="line-clamp-2 text-[0.95rem] font-medium leading-snug text-foreground">
					{item.title}
				</h3>
				{item.artist && (
					<p className="serif-accent text-sm text-muted">{item.artist}</p>
				)}

				{item.tags.length > 0 && (
					<ul className="flex flex-wrap gap-1.5">
						{item.tags.map((tag) => (
							<li
								key={tag.id}
								className="border border-line px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-muted"
							>
								{tag.name}
							</li>
						))}
					</ul>
				)}

				{/* Actions */}
				<div className="mt-auto flex items-center gap-4 pt-3">
					<button
						type="button"
						onClick={handleCopy}
						className="label !text-muted transition-colors hover:!text-foreground"
					>
						{copied ? <span className="text-accent">Copied ✓</span> : "Copy link"}
					</button>
					<a
						href={item.url}
						target="_blank"
						rel="noopener noreferrer"
						className="label !text-muted transition-colors hover:!text-accent"
					>
						Open ↗
					</a>

					{isOwner && (
						<span className="ml-auto flex items-center gap-3">
							<button
								type="button"
								onClick={() => onEdit(item)}
								className="label !text-muted transition-colors hover:!text-foreground"
							>
								Edit
							</button>
							<button
								type="button"
								onClick={handleDeleteClick}
								className={`label transition-colors ${
									confirmingDelete
										? "!text-accent"
										: "!text-muted hover:!text-accent"
								}`}
							>
								{confirmingDelete ? "Sure?" : "Delete"}
							</button>
						</span>
					)}
				</div>
			</div>
		</article>
	);
}
