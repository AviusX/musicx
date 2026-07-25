"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

function Row({
	items,
	outlined,
	trackClass,
}: {
	items: string[];
	outlined?: boolean;
	trackClass: string;
}) {
	return (
		<div className="overflow-hidden">
			<div className={`${trackClass} flex w-max items-center will-change-transform`}>
				{[0, 1].map((copy) => (
					<div
						key={copy}
						aria-hidden={copy === 1}
						className="flex shrink-0 items-center"
					>
						{items.map((item, i) => (
							<span key={`${item}-${i}`} className="flex items-center">
								<span
									className={`display whitespace-nowrap px-6 text-[clamp(2.2rem,4.5vw,4.5rem)] sm:px-9 ${
										outlined ? "text-outline-strong" : "text-foreground"
									}`}
								>
									{item}
								</span>
								<span className="text-xl text-accent">♪</span>
							</span>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

/** Velocity-reactive marquee of the archive's vibes. */
export default function TagMarquee({ tagNames }: { tagNames: string[] }) {
	const sectionRef = useRef<HTMLElement>(null);

	useEffect(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

		const ctx = gsap.context(() => {
			const t1 = gsap.to(".marquee-a", {
				xPercent: -50,
				ease: "none",
				duration: 38,
				repeat: -1,
			});
			const t2 = gsap.fromTo(
				".marquee-b",
				{ xPercent: -50 },
				{ xPercent: 0, ease: "none", duration: 44, repeat: -1 },
			);

			// Scroll velocity feeds marquee speed and skew
			const skewTo = gsap.quickTo(".marquee-wrap", "skewX", {
				duration: 0.4,
				ease: "power2.out",
			});
			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: "top bottom",
				end: "bottom top",
				onUpdate: (self) => {
					const v = self.getVelocity();
					const boost = gsap.utils.clamp(1, 5, 1 + Math.abs(v) / 900);
					gsap.to([t1, t2], {
						timeScale: boost,
						duration: 0.3,
						overwrite: true,
					});
					skewTo(gsap.utils.clamp(-5, 5, v / 350));
				},
			});
		}, sectionRef);

		return () => ctx.revert();
	}, []);

	const rowA = tagNames.length > 0 ? tagNames : ["Music"];
	const rowB = ["Now Spinning", "On Repeat", "Turn It Up", "Hidden Gems"];

	return (
		<section
			ref={sectionRef}
			aria-label="Vibes in the archive"
			className="cv-auto overflow-hidden border-t border-line py-16 sm:py-20"
		>
			<p className="label mb-10 px-5 text-center sm:px-8">
				Every vibe in the archive
			</p>
			<div className="marquee-wrap space-y-4 will-change-transform">
				<Row items={rowA} trackClass="marquee-a" />
				<Row items={rowB} outlined trackClass="marquee-b" />
			</div>
		</section>
	);
}
