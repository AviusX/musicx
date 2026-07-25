"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const HeroCanvas = dynamic(() => import("./gl/HeroCanvas"), { ssr: false });

function Chars({
	text,
	base = 0,
	step = 0.04,
}: {
	text: string;
	base?: number;
	step?: number;
}) {
	return (
		<>
			{text.split("").map((char, i) => (
				<span key={i} className="hero-mask">
					<span
						className="hero-char"
						style={{ "--d": `${base + i * step}s` } as CSSProperties}
					>
						{char}
					</span>
				</span>
			))}
		</>
	);
}

/** Spinning vinyl standing in for the "O" of SOUND. */
function Vinyl({ delay }: { delay: number }) {
	return (
		<span className="hero-mask">
			<span
				className="hero-char"
				style={{ "--d": `${delay}s` } as CSSProperties}
			>
				<svg
					viewBox="0 0 100 100"
					aria-hidden
					className="vinyl-spin inline-block h-[0.74em] w-[0.74em] translate-y-[0.075em]"
				>
					<circle cx="50" cy="50" r="48" fill="currentColor" />
					<circle
						cx="50"
						cy="50"
						r="38"
						fill="none"
						stroke="var(--background)"
						strokeOpacity="0.35"
						strokeWidth="1.5"
					/>
					<circle
						cx="50"
						cy="50"
						r="31"
						fill="none"
						stroke="var(--background)"
						strokeOpacity="0.35"
						strokeWidth="1.5"
					/>
					<circle
						cx="50"
						cy="50"
						r="24"
						fill="none"
						stroke="var(--background)"
						strokeOpacity="0.35"
						strokeWidth="1.5"
					/>
					<circle cx="50" cy="50" r="16" fill="var(--accent)" />
					<circle cx="50" cy="50" r="3.5" fill="var(--background)" />
					<circle
						cx="63"
						cy="42"
						r="2.2"
						fill="var(--accent-ink)"
						opacity="0.85"
					/>
				</svg>
			</span>
		</span>
	);
}

export default function Hero({ trackCount }: { trackCount: number }) {
	const sectionRef = useRef<HTMLElement>(null);
	const line1Ref = useRef<HTMLSpanElement>(null);
	const line2Ref = useRef<HTMLSpanElement>(null);
	const bottomRef = useRef<HTMLDivElement>(null);
	const [showGL, setShowGL] = useState(false);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		// Mount the WebGL background only after the browser is idle, so the
		// SSR'd hero text always paints first.
		const hasRic = "requestIdleCallback" in window;
		const id = hasRic
			? window.requestIdleCallback(() => setShowGL(true))
			: window.setTimeout(() => setShowGL(true), 250);
		const cancel = (handle: number) =>
			hasRic ? window.cancelIdleCallback(handle) : clearTimeout(handle);

		const ctx = gsap.context(() => {
			const scrub = {
				trigger: sectionRef.current,
				start: "top top",
				end: "bottom top",
				scrub: 0.6,
			};
			gsap.to(line1Ref.current, {
				xPercent: -6,
				ease: "none",
				scrollTrigger: scrub,
			});
			gsap.to(line2Ref.current, {
				xPercent: 6,
				ease: "none",
				scrollTrigger: scrub,
			});
			gsap.to(bottomRef.current, {
				yPercent: 30,
				opacity: 0,
				ease: "none",
				scrollTrigger: scrub,
			});
		}, sectionRef);

		return () => {
			cancel(id);
			ctx.revert();
		};
	}, []);

	return (
		<section
			id="top"
			ref={sectionRef}
			className="relative flex min-h-svh flex-col overflow-hidden"
		>
			{showGL && <HeroCanvas />}

			<div className="relative z-10 mx-auto flex w-full max-w-[110rem] grow flex-col justify-between px-5 pb-20 pt-28 sm:px-8 sm:pt-32">
				{/* Badge */}
				<div className="hero-fade" style={{ "--d": "0.1s" } as CSSProperties}>
					<span className="inline-flex items-center gap-2.5 border border-line bg-surface/70 px-4 py-2 backdrop-blur-sm">
						<span className="relative flex h-1.5 w-1.5 rounded-full bg-accent text-accent ping-dot" />
						<span className="label !text-foreground/80">
							Now spinning — {trackCount} track{trackCount === 1 ? "" : "s"}
						</span>
					</span>
				</div>

				{/* Kinetic title */}
				<div className="my-10">
					<h1 className="display select-none text-foreground">
						<span className="sr-only">
							Sound Archive — music recommendations by Hrijul
						</span>
						<span
							ref={line1Ref}
							aria-hidden
							className="flex items-center justify-between text-[clamp(4rem,15vw,17rem)] will-change-transform"
						>
							<Chars text="S" base={0.05} />
							<Vinyl delay={0.09} />
							<Chars text="UND" base={0.13} />
						</span>

						<span
							aria-hidden
							className="hero-fade my-1 flex items-center gap-5 sm:my-2"
							style={{ "--d": "0.5s" } as CSSProperties}
						>
							<span
								className="hero-rule h-px grow bg-line"
								style={{ "--d": "0.55s" } as CSSProperties}
							/>
							<span className="serif-accent text-[clamp(1.1rem,2.4vw,2rem)] text-muted">
								what <span className="text-accent">Hrijul</span> keeps on repeat
							</span>
						</span>

						<span
							ref={line2Ref}
							aria-hidden
							className="flex justify-between text-[clamp(4rem,15vw,17rem)] will-change-transform"
						>
							<Chars text="ARCHIVE" base={0.2} />
						</span>
					</h1>
				</div>

				{/* Bottom grid */}
				<div
					ref={bottomRef}
					className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
				>
					<div>
						{/* Paints immediately — the page's LCP element. */}
						<p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
							A hand-picked archive of{" "}
							<em className="serif-accent text-[1.15em] text-foreground">
								music worth your ears
							</em>{" "}
							— tracks, videos, and hidden gems. Filter by vibe, press play,
							stay a while.
						</p>

						<div
							className="hero-fade mt-8 flex flex-wrap items-center gap-6"
							style={{ "--d": "0.6s" } as CSSProperties}
						>
							<a
								href="#catalog"
								className="group inline-flex h-12 items-center gap-3 bg-foreground px-7 text-sm font-medium text-background transition-colors duration-300 hover:bg-accent hover:text-accent-ink"
							>
								Browse the archive
								<svg
									className="h-4 w-4 transition-transform duration-300 group-hover:translate-y-1"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									strokeWidth={2}
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
									/>
								</svg>
							</a>
						</div>
					</div>

					{/* Terminal status line */}
					<div
						className="hero-fade justify-self-start font-mono text-xs text-muted lg:justify-self-end"
						style={{ "--d": "0.7s" } as CSSProperties}
					>
						<div className="border border-line bg-surface/70 px-4 py-3 backdrop-blur-sm">
							<span className="text-accent">$</span> curated_by:{" "}
							<span className="text-foreground">aviusx</span> | tracks:{" "}
							<span className="text-foreground">{trackCount}</span> | status:{" "}
							<span className="text-accent">on repeat</span>
							<span className="caret ml-1 inline-block h-3 w-[7px] translate-y-0.5 bg-accent" />
						</div>
					</div>
				</div>
			</div>

			{/* Scroll indicator */}
			<div
				className="hero-fade absolute bottom-5 left-1/2 z-10 -translate-x-1/2"
				style={{ "--d": "1s" } as CSSProperties}
			>
				<div className="scroll-nudge flex flex-col items-center gap-1.5">
					<span className="label !text-[0.55rem]">Scroll</span>
					<svg
						className="h-3.5 w-3.5 text-muted"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						strokeWidth={1.5}
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3"
						/>
					</svg>
				</div>
			</div>
		</section>
	);
}
