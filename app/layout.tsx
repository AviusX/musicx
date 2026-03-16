import type { Metadata } from "next";
import { DM_Sans, Sora } from "next/font/google";
import { ThemeProvider } from "./components/ThemeProvider";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { AuthProvider } from "@/lib/providers/AuthProvider";
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
	metadataBase: new URL(
		process.env.NEXT_PUBLIC_APP_URL ||
			(process.env.VERCEL_URL
				? `https://${process.env.VERCEL_URL}`
				: "http://localhost:3000"),
	),
	title: {
		template: "%s | MusicX",
		default: "MusicX — Hrijul's music recommendations",
	},
	description:
		"A curated collection of music recommendations — Spotify tracks and YouTube videos handpicked by Hrijul. Discover new music, artists, and hidden gems.",
	keywords: [
		"music",
		"recommendations",
		"spotify",
		"youtube",
		"playlist",
		"artists",
	],
	authors: [{ name: "Hrijul", url: "https://instagram.com/aviusgx" }],
	creator: "Hrijul",
	openGraph: {
		title: "MusicX — Hrijul's music recommendations",
		description:
			"A curated collection of music recommendations — Spotify tracks and YouTube videos handpicked by Hrijul.",
		url: "/",
		siteName: "MusicX",
		locale: "en_US",
		type: "website",
		images: [
			{
				url: "/opengraph-image.png",
				width: 1200,
				height: 630,
				alt: "MusicX — Hrijul's music recommendations",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "MusicX — Music Recommendations",
		description:
			"A curated collection of music recommendations. Discover new Spotify tracks and YouTube videos.",
		creator: "@aviusx",
		images: ["/opengraph-image.png"],
	},
	icons: {
		icon: "/icon.svg",
		shortcut: "/icon.svg",
		apple: "/icon.svg",
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
				<ThemeProvider>
					<QueryProvider>
						<AuthProvider>{children}</AuthProvider>
					</QueryProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
