"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import type { MediaItem } from "@/lib/types";

interface MediaCardProps {
	item: MediaItem;
}

function EmbedErrorPlaceholder({ item }: { item: MediaItem }) {
	const isSpotify = item.platform === "spotify";
	return (
		<div className="embed-error-placeholder">
			<div className="embed-error-icon">
				{isSpotify ? (
					<svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
					</svg>
				) : (
					<svg
						width="36"
						height="36"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<circle cx="12" cy="12" r="10" />
						<polygon
							points="10 8 16 12 10 16 10 8"
							fill="currentColor"
							stroke="none"
						/>
					</svg>
				)}
			</div>
			<p className="embed-error-title">Unavailable for embed</p>
			<p className="embed-error-subtitle">
				Open on {isSpotify ? "Spotify" : "YouTube"} to listen
			</p>
		</div>
	);
}

function YouTubeThumbnail({
	item,
	onError,
}: {
	item: MediaItem;
	onError: () => void;
}) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [thumbSrc, setThumbSrc] = useState(
		`https://img.youtube.com/vi/${item.embedId}/hqdefault.jpg`,
	);
	const triedFallbacksRef = useRef(0);

	const handleImgError = useCallback(() => {
		if (triedFallbacksRef.current === 0) {
			triedFallbacksRef.current = 1;
			setThumbSrc(`https://img.youtube.com/vi/${item.embedId}/mqdefault.jpg`);
		} else if (triedFallbacksRef.current === 1) {
			triedFallbacksRef.current = 2;
			setThumbSrc(`https://img.youtube.com/vi/${item.embedId}/sddefault.jpg`);
		} else {
			onError();
		}
	}, [item.embedId, onError]);

	if (isPlaying) {
		return (
			<iframe
				className="media-embed-yt"
				src={`https://www.youtube.com/embed/${item.embedId}?rel=0&autoplay=1`}
				title={item.title}
				allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
				allowFullScreen
			/>
		);
	}

	return (
		<button
			className="yt-thumbnail-btn"
			onClick={() => setIsPlaying(true)}
			aria-label={`Play ${item.title}`}
		>
			<img
				className="yt-thumbnail-img"
				src={thumbSrc}
				alt={item.title}
				loading="lazy"
				onError={handleImgError}
			/>
			<div className="yt-play-overlay">
				<div className="yt-play-btn">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
						<polygon points="6 3 20 12 6 21 6 3" />
					</svg>
				</div>
			</div>
		</button>
	);
}

function SpotifyEmbed({
	item,
	onError,
}: {
	item: MediaItem;
	onError: () => void;
}) {
	const [loaded, setLoaded] = useState(false);
	const [timedOut, setTimedOut] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		timeoutRef.current = setTimeout(() => {
			if (!loaded) {
				setTimedOut(true);
				onError();
			}
		}, 6000);

		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current);
		};
	}, [loaded, onError]);

	const handleLoad = useCallback(() => {
		setLoaded(true);
		if (timeoutRef.current) clearTimeout(timeoutRef.current);
	}, []);

	if (timedOut) {
		return <EmbedErrorPlaceholder item={item} />;
	}

	return (
		<>
			{!loaded && (
				<div className="embed-loading-placeholder">
					<div className="embed-loading-icon">
						<svg
							width="36"
							height="36"
							viewBox="0 0 24 24"
							fill="currentColor"
							style={{ color: "var(--embed-error-icon)", opacity: 0.6 }}
						>
							<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
						</svg>
					</div>
					<div className="embed-loading-pulse"></div>
				</div>
			)}
			<iframe
				className="media-embed-spotify"
				src={`https://open.spotify.com/embed/track/${item.embedId}?utm_source=generator&theme=0`}
				title={item.title}
				allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
				allowFullScreen
				loading="lazy"
				onLoad={handleLoad}
				style={{ opacity: loaded ? 1 : 0 }}
			/>
		</>
	);
}

export default function MediaCard({ item }: MediaCardProps) {
	const [copied, setCopied] = useState(false);
	const [embedError, setEmbedError] = useState(false);
	const [btnPressed, setBtnPressed] = useState<string | null>(null);

	const handleCopyLink = useCallback(async () => {
		await navigator.clipboard.writeText(item.url);
		setCopied(true);
		setBtnPressed("copy");
		setTimeout(() => setCopied(false), 2000);
		setTimeout(() => setBtnPressed(null), 300);
	}, [item.url]);

	const handleOpenClick = useCallback(() => {
		setBtnPressed("open");
		setTimeout(() => setBtnPressed(null), 300);
	}, []);

	const isSpotify = item.platform === "spotify";
	const platformLabel = isSpotify ? "Spotify" : "YouTube";

	return (
		<motion.div
			className="media-card"
			layout
			initial={{ opacity: 0, y: 30, scale: 0.92 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, scale: 0.85, y: -10, transition: { duration: 0.25 } }}
			whileHover={{
				y: -6,
				transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
			}}
			transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
		>
			<div
				className={`media-embed-wrapper ${isSpotify ? "media-embed-wrapper-spotify" : ""}`}
			>
				{embedError ? (
					<EmbedErrorPlaceholder item={item} />
				) : item.platform === "youtube" ? (
					<YouTubeThumbnail item={item} onError={() => setEmbedError(true)} />
				) : (
					<SpotifyEmbed item={item} onError={() => setEmbedError(true)} />
				)}
			</div>

			<div className="media-card-info">
				<div className="media-card-text">
					<h3 className="media-card-title">{item.title}</h3>
					<p className="media-card-artist">{item.artist}</p>
				</div>

				<div className="media-card-tags">
					{item.tags.map((tag) => (
						<motion.span
							key={tag}
							className="media-card-tag"
							whileHover={{ scale: 1.1 }}
							transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
						>
							{tag}
						</motion.span>
					))}
				</div>

				<div className="media-card-actions">
					<motion.button
						onClick={handleCopyLink}
						className="media-action-btn"
						aria-label="Copy link"
						title="Copy link"
						whileHover={{ scale: 1.05, backgroundColor: "var(--accent-soft)" }}
						whileTap={{ scale: 0.9 }}
						animate={btnPressed === "copy" ? { scale: [1, 1.15, 1] } : {}}
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
					>
						<AnimatePresence mode="wait">
							{copied ? (
								<motion.span
									key="copied"
									className="btn-inner"
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2.5"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<motion.polyline
											points="20 6 9 17 4 12"
											initial={{ pathLength: 0 }}
											animate={{ pathLength: 1 }}
											transition={{ duration: 0.3 }}
										/>
									</svg>
									<span>Copied!</span>
								</motion.span>
							) : (
								<motion.span
									key="copy"
									className="btn-inner"
									initial={{ scale: 0, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0, opacity: 0 }}
									transition={{ duration: 0.2 }}
								>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
										<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
									</svg>
									<span>Copy link</span>
								</motion.span>
							)}
						</AnimatePresence>
					</motion.button>

					<motion.a
						href={item.url}
						target="_blank"
						rel="noopener noreferrer"
						className="media-action-btn media-action-btn-primary"
						aria-label={`Open on ${platformLabel}`}
						title={`Open on ${platformLabel}`}
						onClick={handleOpenClick}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.9 }}
						transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
					>
						{isSpotify ? (
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
							</svg>
						) : (
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="currentColor"
							>
								<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
							</svg>
						)}
						<span>Open on {platformLabel}</span>
					</motion.a>
				</div>
			</div>
		</motion.div>
	);
}
