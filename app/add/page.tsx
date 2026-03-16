"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import Header from "../components/Header";
import MusicBackground from "../components/MusicBackground";
import { useAuth } from "@/lib/hooks/useAuth";
import { useAddRecommendation, useTags } from "@/lib/hooks/useRecommendations";

function extractEmbedId(url: string, platform: "youtube" | "spotify"): string {
	if (platform === "youtube") {
		// Handle youtu.be/ID, youtube.com/watch?v=ID, youtube.com/embed/ID
		const patterns = [
			/youtu\.be\/([^?&#]+)/,
			/[?&]v=([^&#]+)/,
			/\/embed\/([^?&#]+)/,
		];
		for (const pattern of patterns) {
			const match = url.match(pattern);
			if (match) return match[1];
		}
	} else if (platform === "spotify") {
		// Handle open.spotify.com/track/ID
		const match = url.match(/track\/([^?&#]+)/);
		if (match) return match[1];
	}
	return "";
}

const PRESET_TAGS = ["AMV", "Chill", "Guitar", "Sad", "Acoustic", "Soft"];

export default function AddPage() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const addMutation = useAddRecommendation();
	const { data: existingTags = [] } = useTags();

	const [title, setTitle] = useState("");
	const [artist, setArtist] = useState("");
	const [url, setUrl] = useState("");
	const [platform, setPlatform] = useState<"youtube" | "spotify">("youtube");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [customTag, setCustomTag] = useState("");

	// Merge preset tags with existing DB tags
	const allAvailableTags = Array.from(
		new Set([...PRESET_TAGS, ...existingTags]),
	).sort();

	const toggleTag = useCallback((tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	}, []);

	const addCustomTag = useCallback(() => {
		const tag = customTag.trim();
		if (tag && !selectedTags.includes(tag)) {
			setSelectedTags((prev) => [...prev, tag]);
		}
		setCustomTag("");
	}, [customTag, selectedTags]);

	const handleUrlChange = useCallback(
		(value: string) => {
			setUrl(value);
			// Auto-detect platform from URL
			if (value.includes("spotify.com")) {
				setPlatform("spotify");
			} else if (
				value.includes("youtube.com") ||
				value.includes("youtu.be")
			) {
				setPlatform("youtube");
			}
		},
		[],
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		const embedId = extractEmbedId(url, platform);
		if (!embedId) {
			return;
		}

		addMutation.mutate(
			{
				title,
				artist,
				url,
				platform,
				tags: selectedTags,
				embed_id: embedId,
			},
			{
				onSuccess: () => {
					router.push("/");
				},
			},
		);
	};

	if (authLoading) {
		return (
			<>
				<MusicBackground />
				<Header />
				<main className="page-container">
					<div className="loading-container">
						<div className="loading-spinner" />
					</div>
				</main>
			</>
		);
	}

	if (!user) {
		return (
			<>
				<MusicBackground />
				<Header />
				<main className="page-container">
					<motion.div
						className="auth-card"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
					>
						<div className="auth-header">
							<span className="auth-icon">🔒</span>
							<h1 className="auth-title">Sign in required</h1>
							<p className="auth-subtitle">
								You need to be signed in to add recommendations.
							</p>
						</div>
						<motion.button
							className="auth-submit-btn"
							onClick={() => router.push("/login")}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							Go to login
						</motion.button>
					</motion.div>
				</main>
			</>
		);
	}

	const embedId = extractEmbedId(url, platform);

	return (
		<>
			<MusicBackground />
			<Header />
			<main className="page-container">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
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
							+
						</motion.span>{" "}
						Add a recommendation
					</h1>
					<p className="page-subtitle">
						Share a track or video you love with everyone.
					</p>
				</motion.div>

				<motion.div
					className="add-form-card"
					initial={{ opacity: 0, y: 30, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<form onSubmit={handleSubmit} className="add-form">
						<div className="form-row">
							<div className="form-group">
								<label htmlFor="title" className="form-label">
									Title
								</label>
								<input
									id="title"
									type="text"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="form-input"
									placeholder="Song or video title"
									required
								/>
							</div>
							<div className="form-group">
								<label htmlFor="artist" className="form-label">
									Artist
								</label>
								<input
									id="artist"
									type="text"
									value={artist}
									onChange={(e) => setArtist(e.target.value)}
									className="form-input"
									placeholder="Artist name"
									required
								/>
							</div>
						</div>

						<div className="form-row">
							<div className="form-group form-group-grow">
								<label htmlFor="url" className="form-label">
									URL
								</label>
								<input
									id="url"
									type="url"
									value={url}
									onChange={(e) => handleUrlChange(e.target.value)}
									className="form-input"
									placeholder="https://youtu.be/... or https://open.spotify.com/track/..."
									required
								/>
							</div>
							<div className="form-group form-group-shrink">
								<label htmlFor="platform" className="form-label">
									Platform
								</label>
								<select
									id="platform"
									value={platform}
									onChange={(e) =>
										setPlatform(
											e.target.value as "youtube" | "spotify",
										)
									}
									className="form-input form-select"
								>
									<option value="youtube">YouTube</option>
									<option value="spotify">Spotify</option>
								</select>
							</div>
						</div>

						{url && !embedId && (
							<motion.p
								className="form-hint-error"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
							>
								Could not extract embed ID from URL. Make sure it&apos;s
								a valid {platform === "youtube" ? "YouTube" : "Spotify"}{" "}
								link.
							</motion.p>
						)}

						{embedId && (
							<motion.div
								className="embed-preview"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
							>
								<p className="form-label">Preview</p>
								<div className="embed-preview-frame">
									{platform === "youtube" ? (
										<iframe
											src={`https://www.youtube.com/embed/${embedId}`}
											title="Preview"
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
											className="embed-preview-iframe"
										/>
									) : (
										<iframe
											src={`https://open.spotify.com/embed/track/${embedId}?utm_source=generator&theme=0`}
											title="Preview"
											allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
											allowFullScreen
											loading="lazy"
											className="embed-preview-iframe embed-preview-iframe-spotify"
										/>
									)}
								</div>
							</motion.div>
						)}

						<div className="form-group">
							<label className="form-label">Tags</label>
							<div className="tag-selector">
								{allAvailableTags.map((tag) => (
									<motion.button
										key={tag}
										type="button"
										className={`tag-pill ${selectedTags.includes(tag) ? "tag-pill-active" : ""}`}
										onClick={() => toggleTag(tag)}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
									>
										<span className="tag-pill-label">{tag}</span>
									</motion.button>
								))}
							</div>
							<div className="custom-tag-row">
								<input
									type="text"
									value={customTag}
									onChange={(e) => setCustomTag(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.preventDefault();
											addCustomTag();
										}
									}}
									className="form-input form-input-small"
									placeholder="Add custom tag..."
								/>
								<motion.button
									type="button"
									onClick={addCustomTag}
									className="add-tag-btn"
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									disabled={!customTag.trim()}
								>
									+
								</motion.button>
							</div>
							<AnimatePresence>
								{selectedTags.length > 0 && (
									<motion.div
										className="selected-tags-display"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										exit={{ opacity: 0 }}
									>
										<span className="form-hint">
											Selected: {selectedTags.join(", ")}
										</span>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{addMutation.error && (
							<motion.div
								className="auth-error"
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
							>
								{addMutation.error.message}
							</motion.div>
						)}

						<motion.button
							type="submit"
							className="auth-submit-btn"
							disabled={
								addMutation.isPending ||
								!title ||
								!artist ||
								!url ||
								!embedId
							}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							{addMutation.isPending
								? "Adding..."
								: "Add recommendation"}
						</motion.button>
					</form>
				</motion.div>
			</main>
		</>
	);
}
