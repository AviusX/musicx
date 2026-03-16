"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/providers/AuthProvider";
import Header from "../components/Header";
import MusicBackground from "../components/MusicBackground";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const { user, loading, signIn } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!loading && user) {
			router.replace("/");
		}
	}, [user, loading, router]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setSubmitting(true);

		const { error } = await signIn(email, password);
		if (error) {
			setError(error);
			setSubmitting(false);
		} else {
			router.replace("/");
		}
	};

	if (loading || user) {
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
			<main className="page-container" style={{ display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "8vh" }}>
				<motion.div
					className="glass-card"
					initial={{ opacity: 0, y: 30, scale: 0.96 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
					style={{ width: "100%", maxWidth: 420, padding: "2.5rem 2rem" }}
				>
					<motion.h1
						className="form-title"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
					>
						Sign In
					</motion.h1>
					<motion.p
						className="form-subtitle"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						Welcome back to musicx
					</motion.p>

					<form onSubmit={handleSubmit} className="auth-form">
						<motion.div
							className="form-group"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.25, ease: [0.4, 0, 0.2, 1] }}
						>
							<label htmlFor="email" className="form-label">Email</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="form-input"
								placeholder="you@example.com"
								required
								autoComplete="email"
							/>
						</motion.div>

						<motion.div
							className="form-group"
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.35, ease: [0.4, 0, 0.2, 1] }}
						>
							<label htmlFor="password" className="form-label">Password</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="form-input"
								placeholder="••••••••"
								required
								autoComplete="current-password"
							/>
						</motion.div>

						<AnimatePresence>
							{error && (
								<motion.div
									className="form-error"
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									exit={{ opacity: 0, height: 0 }}
									transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
								>
									{error}
								</motion.div>
							)}
						</AnimatePresence>

						<motion.button
							type="submit"
							className="form-submit-btn"
							disabled={submitting}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: 0.45, ease: [0.4, 0, 0.2, 1] }}
						>
							{submitting ? (
								<motion.span
									animate={{ opacity: [1, 0.5, 1] }}
									transition={{ duration: 1.2, repeat: Infinity }}
								>
									Signing in...
								</motion.span>
							) : (
								"Sign In"
							)}
						</motion.button>
					</form>
				</motion.div>
			</main>
		</>
	);
}
