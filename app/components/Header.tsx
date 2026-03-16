"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "@/lib/providers/AuthProvider";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
	const { user, loading } = useAuth();

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
					<ThemeToggle />
				</div>
			</div>
		</motion.header>
	);
}
