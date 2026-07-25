"use client";

import { useEffect, useRef, type ReactNode } from "react";

export default function Modal({
	title,
	onClose,
	children,
	wide,
}: {
	title: string;
	onClose: () => void;
	children: ReactNode;
	wide?: boolean;
}) {
	const panelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		const prevOverflow = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = prevOverflow;
		};
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6"
			role="dialog"
			aria-modal="true"
			aria-label={title}
		>
			<button
				type="button"
				aria-label="Close dialog"
				onClick={onClose}
				className="absolute inset-0 cursor-default bg-background/70 backdrop-blur-sm"
			/>
			<div
				ref={panelRef}
				data-lenis-prevent
				className={`relative flex max-h-[92svh] w-full flex-col border border-line bg-surface shadow-2xl ${
					wide ? "sm:max-w-2xl" : "sm:max-w-lg"
				}`}
			>
				<div className="flex items-center justify-between border-b border-line px-5 py-4 sm:px-6">
					<h2 className="display text-xl text-foreground">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close"
						className="flex h-8 w-8 items-center justify-center border border-line text-muted transition-colors hover:border-accent hover:text-accent"
					>
						<svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div className="overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
			</div>
		</div>
	);
}
