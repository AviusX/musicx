"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/providers/AuthProvider";
import { createClient } from "@/lib/supabase/client";
import { parseMediaUrl, fetchOembedData } from "@/lib/url-parser";
import Header from "../components/Header";
import MusicBackground from "../components/MusicBackground";

export default function AddPage() {
	const { user, loading } = useAuth();
	const router = useRouter();
	const supabase = createClient();

	const [url, setUrl] = useState("");
	const [title, setTitle] = useState("");
	const [artist, setArtist] = useState("");
	const [platform, setPlatform] = useState<"youtube" | "spotify" | null>(null);
	const [embedId, setEmbedId] = useState("");
	const [selectedTags, setSelectedTags] = useState<string[]>([]);
	const [fetchingMeta, setFetchingMeta] = useState(false);
	const [success, setSuccess] = useState(false);

	useEffect(() => {
		if (!loading && !user) {
			router.replace("/login");
		}
	}, [user, loading, router]);

	const { data: tags = [] } = useQuery({
		queryKey: ["tags"],
		queryFn: async () => {
			const { data, error } = await supabase
				.from("tags")
				.select("name")
				.order("name");
			if (error) throw error;
			return data.map((t: { name: string }) => t.name);
		},
	});

	const insertMutation = useMutation({
		mutationFn: async () => {
			const { error } = await supabase.from("recommendations").insert({
				title,
				artist,
				url,
				platform,
				embed_id: embedId,
				tags: selectedTags,
				author_id: user!.id,
			});
			if (error) throw error;
		},
		onSuccess: () => {
			setSuccess(true);
			setTimeout(() => router.push("/"), 1500);
		},
	});

	const handleUrlChange = useCallback(
		async (value: string) => {
			setUrl(value);
			const parsed = parseMediaUrl(value);
			if (!parsed) return;

			setPlatform(parsed.platform);
			setEmbedId(parsed.embedId);
			setFetchingMeta(true);

			const meta = await fetchOembedData(parsed.url, parsed.platform);
			if (meta) {
				setTitle(meta.title);
				setArtist(meta.artist);
			}
			setFetchingMeta(false);
		},
		[],
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!platform || !embedId || !title || !artist) return;
		insertMutation.mutate();
	};

	const toggleTag = (tag: string) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
		);
	};

	if (loading || !user) {
		return (
			<>
				<MusicBackground />
				<Header />
			</>
		);
	}

	return (
		<>
			<MusicBackground />
			<Header />
			<main className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "6vh" }}>
				<motion.div
					className="glass-card"
					initial={{ opacity: 0, y: 30, scale: 0.96 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
					style={{ width: "100%", maxWidth: 580, padding: "2.5rem 2rem" }}
				>
					<motion.h1
						className="form-title"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
					>
						Add Recommendation
					</motion.h1>
					<motion.p
						className="form-subtitle"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						Paste a YouTube or Spotify link to get started
					</motion.p>

					<AnimatePresence>
						{success && (
							<motion.div
								className="form-success"
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
							>
								Added successfully! Redirecting...
							</motion.div>
						)}
					</AnimatePresence>

					<form onSubmit={handleSubmit} className="auth-form">
						{/* URL Input — prominent */}
						<motion.div
							className="form-group"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
						>
							<label htmlFor="url" className="form-label">
								Link
								{fetchingMeta && (
									<motion.span
										className="form-label-hint"
										animate={{ opacity: [1, 0.4, 1] }}
										transition={{ duration: 1, repeat: Infinity }}
									>
										{" "}fetching details...
									</motion.span>
								)}
							</label>
							<input
								id="url"
								type="url"
								value={url}
								onChange={(e) => handleUrlChange(e.target.value)}
								onPaste={(e) => {
									// Handle paste specifically to catch the pasted content
									const pasted = e.clipboardData.getData("text");
									if (pasted) {
										e.preventDefault();
										setUrl(pasted);
										handleUrlChange(pasted);
									}
								}}
								className="form-input form-input-prominent"
								placeholder="https://youtube.com/watch?v=... or https://open.spotify.com/track/..."
								required
							/>
						</motion.div>

						{/* Platform badge */}
						<AnimatePresence>
							{platform && (
								<motion.div
									className="platform-badge-row"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
								>
									<span className={`platform-badge platform-badge-${platform}`}>
										{platform === "youtube" ? "YouTube" : "Spotify"}
									</span>
									<span className="embed-id-hint">ID: {embedId}</span>
								</motion.div>
							)}
						</AnimatePresence>

						{/* Title */}
						<motion.div
							className="form-group"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
						>
							<label htmlFor="title" className="form-label">Title</label>
							<input
								id="title"
								type="text"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="form-input"
								placeholder="Song or video title"
								required
							/>
						</motion.div>

						{/* Artist */}
						<motion.div
							className="form-group"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
						>
							<label htmlFor="artist" className="form-label">Artist</label>
							<input
								id="artist"
								type="text"
								value={artist}
								onChange={(e) => setArtist(e.target.value)}
								className="form-input"
								placeholder="Artist or channel name"
								required
							/>
						</motion.div>

						{/* Tags */}
						<motion.div
							className="form-group"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
						>
							<label className="form-label">Tags</label>
							<div className="form-tags">
								{tags.map((tag: string) => (
									<motion.button
										key={tag}
										type="button"
										onClick={() => toggleTag(tag)}
										className={`form-tag-pill ${selectedTags.includes(tag) ? "form-tag-pill-active" : ""}`}
										whileHover={{ scale: 1.08, y: -1 }}
										whileTap={{ scale: 0.92 }}
										transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
									>
										{tag}
									</motion.button>
								))}
							</div>
						</motion.div>

						{/* Error */}
						<AnimatePresence>
							{insertMutation.error && (
								<motion.div
									className="form-error"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
								>
									{(insertMutation.error as Error).message}
								</motion.div>
							)}
						</AnimatePresence>

						{/* Submit */}
						<motion.button
							type="submit"
							className="form-submit-btn"
							disabled={insertMutation.isPending || !platform || !title || !artist || success}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.45, ease: [0.4, 0, 0.2, 1] }}
						>
							{insertMutation.isPending ? (
								<motion.span
									animate={{ opacity: [1, 0.5, 1] }}
									transition={{ duration: 1.2, repeat: Infinity }}
								>
									Adding...
								</motion.span>
							) : (
								"Add Recommendation"
							)}
						</motion.button>
					</form>
				</motion.div>
			</main>
		</>
	);
}
