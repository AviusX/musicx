import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "MusicX — Hrijul's music recommendations";
export const size = {
	width: 1200,
	height: 630,
};

export const contentType = "image/png";

export default async function Image() {
	return new ImageResponse(
		<div
			style={{
				background: "linear-gradient(to bottom right, #000000, #111827)",
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				padding: "80px",
			}}
		>
			<div
				style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}
			>
				<svg
					width="120"
					height="120"
					viewBox="0 0 24 24"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M9 18V5L21 3V16"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M6 21C7.65685 21 9 19.6569 9 18C9 16.3431 7.65685 15 6 15C4.34315 15 3 16.3431 3 18C3 19.6569 4.34315 21 6 21Z"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
					<path
						d="M18 19C19.6569 19 21 17.6569 21 16C21 14.3431 19.6569 13 18 13C16.3431 13 15 14.3431 15 16C15 17.6569 16.3431 19 18 19Z"
						stroke="white"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
				<h1
					style={{
						fontSize: "120px",
						marginLeft: "40px",
						fontWeight: "bold",
						color: "white",
						letterSpacing: "-0.05em",
					}}
				>
					MusicX
				</h1>
			</div>
			<p
				style={{
					fontSize: "48px",
					color: "#9ca3af",
					textAlign: "center",
					maxWidth: "900px",
					lineHeight: 1.4,
				}}
			>
				A curated collection of music recommendations
			</p>
		</div>,
		{
			...size,
		},
	);
}
