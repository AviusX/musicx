"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/hooks/useAuth";
import Header from "../components/Header";
import MusicBackground from "../components/MusicBackground";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSignUp, setIsSignUp] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);
	const router = useRouter();
	const supabase = createClient();
	const { user } = useAuth();

	if (user) {
		router.push("/");
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setMessage(null);
		setLoading(true);

		if (isSignUp) {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					emailRedirectTo: `${window.location.origin}/auth/callback`,
				},
			});
			if (error) {
				setError(error.message);
			} else {
				setMessage("Check your email for a confirmation link!");
			}
		} else {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) {
				setError(error.message);
			} else {
				router.push("/");
				router.refresh();
			}
		}

		setLoading(false);
	};

	return (
		<>
			<MusicBackground />
			<Header />
			<main className="page-container">
				<motion.div
					className="auth-card"
					initial={{ opacity: 0, y: 30, scale: 0.95 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
				>
					<div className="auth-header">
						<motion.span
							className="auth-icon"
							animate={{ rotate: [0, -10, 10, -5, 0] }}
							transition={{
								duration: 2,
								repeat: Infinity,
								repeatDelay: 6,
								ease: "easeInOut",
							}}
						>
							♪
						</motion.span>
						<h1 className="auth-title">
							{isSignUp ? "Create account" : "Welcome back"}
						</h1>
						<p className="auth-subtitle">
							{isSignUp
								? "Sign up to add your own recommendations"
								: "Sign in to your MusicX account"}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="auth-form">
						<div className="form-group">
							<label htmlFor="email" className="form-label">
								Email
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="form-input"
								placeholder="you@example.com"
								required
							/>
						</div>

						<div className="form-group">
							<label htmlFor="password" className="form-label">
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="form-input"
								placeholder="••••••••"
								required
								minLength={6}
							/>
						</div>

						{error && (
							<motion.div
								className="auth-error"
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
							>
								{error}
							</motion.div>
						)}

						{message && (
							<motion.div
								className="auth-success"
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
							>
								{message}
							</motion.div>
						)}

						<motion.button
							type="submit"
							className="auth-submit-btn"
							disabled={loading}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							{loading
								? "Loading..."
								: isSignUp
									? "Sign up"
									: "Sign in"}
						</motion.button>
					</form>

					<div className="auth-footer">
						<p className="auth-toggle-text">
							{isSignUp
								? "Already have an account?"
								: "Don't have an account?"}
						</p>
						<button
							onClick={() => {
								setIsSignUp(!isSignUp);
								setError(null);
								setMessage(null);
							}}
							className="auth-toggle-btn"
						>
							{isSignUp ? "Sign in" : "Sign up"}
						</button>
					</div>
				</motion.div>
			</main>
		</>
	);
}
