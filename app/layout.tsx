import type { Metadata, Viewport } from "next";
import { Anton, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
	display: "swap",
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
	display: "swap",
});

const anton = Anton({
	variable: "--font-anton",
	subsets: ["latin"],
	weight: "400",
	display: "swap",
});

const instrumentSerif = Instrument_Serif({
	variable: "--font-instrument-serif",
	subsets: ["latin"],
	weight: "400",
	style: ["normal", "italic"],
	display: "swap",
});

const siteUrl = "https://music.aviusx.dev";
const title = "musicx — Hrijul's Sound Archive";
const description =
	"A hand-picked archive of music worth your ears — tracks, videos, and hidden gems curated by Hrijul (AviusX). Filter by vibe, press play, stay a while.";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		template: "%s | musicx",
		default: title,
	},
	description,
	keywords: [
		"music",
		"recommendations",
		"curated music",
		"playlist",
		"Hrijul",
		"AviusX",
		"spotify",
		"youtube",
	],
	authors: [{ name: "Hrijul Bhatnagar", url: "https://aviusx.dev" }],
	creator: "Hrijul Bhatnagar",
	alternates: {
		canonical: siteUrl,
	},
	openGraph: {
		title,
		description,
		url: siteUrl,
		siteName: "musicx",
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
		creator: "@AviusX",
	},
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport: Viewport = {
	themeColor: [
		{ media: "(prefers-color-scheme: light)", color: "#f2f0e9" },
		{ media: "(prefers-color-scheme: dark)", color: "#0d0c0a" },
	],
};

const websiteJsonLd = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	"@id": `${siteUrl}/#website`,
	url: siteUrl,
	name: "musicx",
	description,
	author: {
		"@type": "Person",
		name: "Hrijul Bhatnagar",
		alternateName: "AviusX",
		url: "https://aviusx.dev",
	},
};

const themeScript = `(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("dark",d)}catch(e){}})();`;

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${geistSans.variable} ${geistMono.variable} ${anton.variable} ${instrumentSerif.variable} antialiased`}
		>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
				/>
			</head>
			<body className="noise min-h-screen">{children}</body>
		</html>
	);
}
