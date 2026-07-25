"use client";

import Link from "next/link";
import { signOut } from "@/app/actions";
import { useOwner } from "@/lib/useOwner";

const links = [
	{ label: "aviusx.dev", url: "https://aviusx.dev" },
	{ label: "Instagram", url: "https://instagram.com/aviusgx" },
	{ label: "X", url: "https://x.com/AviusX" },
];

export default function Footer() {
	const isOwner = useOwner();

	return (
		<footer className="border-t border-line px-5 py-8 sm:px-8">
			<div className="mx-auto flex max-w-[110rem] flex-wrap items-center justify-between gap-4">
				<p className="label !normal-case !tracking-normal">
					© {new Date().getFullYear()} Hrijul Bhatnagar
				</p>
				<p className="serif-accent text-sm text-muted">
					tuned by <span className="text-accent">AviusX</span>
				</p>
				<ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
					{links.map((link) => (
						<li key={link.label}>
							<a
								href={link.url}
								target="_blank"
								rel="noopener noreferrer"
								className="label !text-foreground/70 transition-colors hover:!text-accent"
							>
								{link.label}
							</a>
						</li>
					))}
					<li>
						{isOwner ? (
							<form action={signOut} className="inline">
								<button
									type="submit"
									className="label !text-foreground/60 transition-colors hover:!text-accent"
								>
									Sign out
								</button>
							</form>
						) : (
							<Link
								href="/login"
								className="label !text-foreground/60 transition-colors hover:!text-accent"
							>
								Sign in
							</Link>
						)}
					</li>
				</ul>
			</div>
		</footer>
	);
}
