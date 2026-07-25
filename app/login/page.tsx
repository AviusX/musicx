import type { Metadata } from "next";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
	title: "Sign in",
	robots: { index: false, follow: false },
};

export default function LoginPage() {
	return (
		<main className="flex min-h-svh flex-col items-center justify-center px-5 py-16">
			<div className="w-full max-w-sm">
				<Link
					href="/"
					className="label mb-10 inline-block !text-muted transition-colors hover:!text-accent"
				>
					← Back to the archive
				</Link>

				<h1 className="display mb-2 text-5xl text-foreground">
					Access<span className="text-accent">.</span>
				</h1>
				<p className="serif-accent mb-10 text-muted">
					curators only beyond this point
				</p>

				<LoginForm />
			</div>
		</main>
	);
}
