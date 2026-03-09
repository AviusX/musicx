"use client";

import {
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
} from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
	theme: Theme;
	toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): Theme {
	if (typeof window === "undefined") return "dark";
	return window.matchMedia("(prefers-color-scheme: dark)").matches
		? "dark"
		: "light";
}

function getStoredTheme(): Theme | null {
	if (typeof window === "undefined") return null;
	const stored = localStorage.getItem("musicx-theme");
	if (stored === "light" || stored === "dark") return stored;
	return null;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setTheme] = useState<Theme>("dark");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const stored = getStoredTheme();
		const initial = stored ?? getSystemTheme();
		setTheme(initial);
		setMounted(true);
	}, []);

	useEffect(() => {
		if (!mounted) return;
		document.documentElement.setAttribute("data-theme", theme);
	}, [theme, mounted]);

	// Listen for system theme changes (only when no manual override)
	useEffect(() => {
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = (e: MediaQueryListEvent) => {
			if (!getStoredTheme()) {
				setTheme(e.matches ? "dark" : "light");
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);

	const toggleTheme = useCallback(() => {
		setTheme((prev) => {
			const next = prev === "dark" ? "light" : "dark";
			localStorage.setItem("musicx-theme", next);
			return next;
		});
	}, []);

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
	return ctx;
}
