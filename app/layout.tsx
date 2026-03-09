import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import "./globals.css";

const dmSans = DM_Sans({
	variable: "--font-dm-sans",
	subsets: ["latin"],
	weight: ["400", "500", "600"],
});

const sora = Sora({
	variable: "--font-sora",
	subsets: ["latin"],
	weight: ["600", "700"],
});

export const metadata: Metadata = {
	title: "MusicX — Hrijul's music recommendations",
	description:
		"A curated collection of music recommendations — Spotify tracks and YouTube videos.",
	icons: {
		icon: "/icon.svg",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${dmSans.variable} ${sora.variable}`}>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
