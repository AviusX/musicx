"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/actions";

const initialState: SignInState = { error: null };

export default function LoginForm() {
	const [state, formAction, isPending] = useActionState(signIn, initialState);

	return (
		<form action={formAction} className="flex flex-col gap-5">
			<div className="flex flex-col gap-1.5">
				<label htmlFor="email" className="label">
					Email
				</label>
				<input
					id="email"
					name="email"
					type="email"
					autoComplete="email"
					className="field"
					required
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="password" className="label">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					autoComplete="current-password"
					className="field"
					required
				/>
			</div>

			{state.error && (
				<p
					className="border border-accent/40 bg-accent/5 px-4 py-2.5 text-sm text-accent"
					role="alert"
				>
					{state.error}
				</p>
			)}

			<button
				type="submit"
				disabled={isPending}
				className="mt-2 inline-flex h-12 items-center justify-center bg-foreground text-sm font-medium text-background transition-colors duration-300 hover:bg-accent hover:text-accent-ink disabled:opacity-50"
			>
				{isPending ? "Signing in…" : "Sign in"}
			</button>
		</form>
	);
}
