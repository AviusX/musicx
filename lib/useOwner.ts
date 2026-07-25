"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { OWNER_EMAIL } from "./types";

/**
 * Client-side owner detection for progressive admin UI.
 * Purely cosmetic — every mutation is re-checked server-side and by RLS.
 */
export function useOwner(): boolean {
	const [isOwner, setIsOwner] = useState(false);

	useEffect(() => {
		const supabase = createClient();

		supabase.auth.getSession().then(({ data: { session } }) => {
			setIsOwner(session?.user.email?.toLowerCase() === OWNER_EMAIL);
		});

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setIsOwner(session?.user.email?.toLowerCase() === OWNER_EMAIL);
		});

		return () => subscription.unsubscribe();
	}, []);

	return isOwner;
}
