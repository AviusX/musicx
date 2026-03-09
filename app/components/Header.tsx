"use client";

import { motion } from "motion/react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
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
				<ThemeToggle />
			</div>
		</motion.header>
	);
}
