"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ThemeToggle from "./ThemeToggle";

gsap.registerPlugin(ScrollTrigger);

export default function Nav() {
	const progressRef = useRef<HTMLDivElement>(null);
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 24);
		onScroll();
		window.addEventListener("scroll", onScroll, { passive: true });

		const st = gsap.to(progressRef.current, {
			scaleX: 1,
			ease: "none",
			scrollTrigger: {
				trigger: document.documentElement,
				start: 0,
				end: "max",
				scrub: 0.4,
			},
		});

		return () => {
			window.removeEventListener("scroll", onScroll);
			st.scrollTrigger?.kill();
			st.kill();
		};
	}, []);

	return (
		<header
			className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
				scrolled
					? "border-b border-line bg-background/80 backdrop-blur-md"
					: "border-b border-transparent"
			}`}
		>
			<div
				ref={progressRef}
				className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent"
			/>
			<nav
				aria-label="Main"
				className="mx-auto flex h-16 max-w-[110rem] items-center justify-between px-5 sm:px-8"
			>
				<a
					href="#top"
					className="display text-xl tracking-tight text-foreground"
				>
					music<span className="text-accent">x</span>
				</a>

				<div className="hidden items-center gap-8 md:flex">
					<a
						href="#catalog"
						className="group label flex items-baseline gap-1.5 !text-foreground/70 transition-colors hover:!text-foreground"
					>
						<span className="text-[0.55rem] text-accent">01</span>
						<span className="relative">
							The Archive
							<span className="absolute -bottom-1 left-0 h-px w-full origin-right scale-x-0 bg-accent transition-transform duration-300 group-hover:origin-left group-hover:scale-x-100" />
						</span>
					</a>
				</div>

				<div className="flex items-center gap-3">
					<a
						href="https://aviusx.dev"
						target="_blank"
						rel="noopener noreferrer"
						className="label hidden !text-foreground/70 transition-colors hover:!text-accent sm:block"
					>
						aviusx.dev ↗
					</a>
					<ThemeToggle />
				</div>
			</nav>
		</header>
	);
}
