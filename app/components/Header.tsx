"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/hooks/useAuth";
import { createClient } from "@/lib/supabase/client";

export default function Header() {
	const { user, loading } = useAuth();
	const pathname = usePathname();
	const router = useRouter();
	const supabase = createClient();

	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.push("/");
		router.refresh();
	};

	return (
		<motion.header
			className="site-header"
			initial={{ y: -20, opacity: 0 }}
			animate={{ y: 0, opacity: 1 }}
			transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
		>
			<div className="header-inner">
				<motion.div
					className="header-left"
					whileHover={{ scale: 1.03 }}
					transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
				>
					<Link href="/" className="header-link">
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
					</Link>
				</motion.div>
				<div className="header-right">
					<nav className="header-nav">
						<Link
							href="/"
							className={`nav-link ${pathname === "/" ? "nav-link-active" : ""}`}
						>
							Home
						</Link>
						<Link
							href="/add"
							className={`nav-link ${pathname === "/add" ? "nav-link-active" : ""}`}
						>
							+ Add
						</Link>
						{!loading && (
							<>
								{user ? (
									<button
										onClick={handleSignOut}
										className="nav-link nav-link-btn"
									>
										Sign out
									</button>
								) : (
									<Link
										href="/login"
										className={`nav-link nav-link-accent ${pathname === "/login" ? "nav-link-active" : ""}`}
									>
										Sign in
									</Link>
								)}
							</>
						)}
					</nav>
					<ThemeToggle />
				</div>
			</div>
		</motion.header>
	);
}
