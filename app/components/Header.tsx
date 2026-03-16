"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/providers/AuthProvider";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	const { user, loading, signOut } = useAuth();

	return (
		<motion.header
			className="site-header"
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
		>
			<div className="header-inner">
				<Link href="/" style={{ textDecoration: "none" }}>
					<motion.div
						className="header-left"
						whileHover={{ scale: 1.03 }}
						transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
					>
						<motion.span
							className="header-logo"
							animate={{
								rotate: [0, -10, 10, -5, 0],
								scale: [1, 1.1, 1, 1.05, 1],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								repeatDelay: 8,
								ease: "easeInOut",
							}}
						>
							♪
						</motion.span>
						<span className="header-title">musicx</span>
					</motion.div>
				</Link>

				<div className="header-right">
					<AnimatePresence>
						{!loading && user && (
							<motion.div
								initial={{ opacity: 0, scale: 0.8, x: 10 }}
								animate={{ opacity: 1, scale: 1, x: 0 }}
								exit={{ opacity: 0, scale: 0.8, x: 10 }}
								transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
							>
								<Link href="/add" className="header-add-btn">
									<motion.span
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="header-add-btn-inner"
									>
										+ Add
									</motion.span>
								</Link>
							</motion.div>
						)}
					</AnimatePresence>
					<AnimatePresence>
						{!loading && user && (
							<motion.button
								className="header-logout-btn"
								onClick={signOut}
								aria-label="Sign out"
								title="Sign out"
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								whileHover={{ scale: 1.08 }}
								whileTap={{ scale: 0.92 }}
								transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
							>
								<svg
									width="18"
									height="18"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
									<polyline points="16 17 21 12 16 7" />
									<line x1="21" y1="12" x2="9" y2="12" />
								</svg>
							</motion.button>
						)}
					</AnimatePresence>
					<ThemeToggle />
				</div>
			</div>
		</motion.header>
	);
}
