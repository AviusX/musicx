import { ImageResponse } from "next/og";

export const alt = "musicx — Hrijul's Sound Archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "space-between",
					background: "#0d0c0a",
					color: "#f0eee8",
					padding: 64,
					fontFamily: "sans-serif",
				}}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						fontSize: 22,
						letterSpacing: 4,
						textTransform: "uppercase",
						color: "#8d887c",
					}}
				>
					<span>Curated Sound Archive</span>
					<span style={{ color: "#ff5c1a" }}>music.aviusx.dev</span>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: 56 }}>
					<div style={{ display: "flex", flexDirection: "column", flexGrow: 1 }}>
						<div style={{ fontSize: 148, fontWeight: 800, lineHeight: 1 }}>
							SOUND
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: 24,
								margin: "14px 0",
							}}
						>
							<div style={{ height: 2, flexGrow: 1, background: "#33312d" }} />
							<div
								style={{ fontSize: 28, color: "#ff5c1a", fontStyle: "italic" }}
							>
								what Hrijul keeps on repeat
							</div>
						</div>
						<div style={{ fontSize: 148, fontWeight: 800, lineHeight: 1 }}>
							ARCHIVE
						</div>
					</div>

					{/* Vinyl */}
					<div
						style={{
							width: 220,
							height: 220,
							borderRadius: "50%",
							background: "#f0eee8",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							flexShrink: 0,
						}}
					>
						<div
							style={{
								width: 158,
								height: 158,
								borderRadius: "50%",
								border: "4px solid rgba(13,12,10,0.3)",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
							}}
						>
							<div
								style={{
									width: 86,
									height: 86,
									borderRadius: "50%",
									background: "#ff4b00",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
								}}
							>
								<div
									style={{
										width: 18,
										height: 18,
										borderRadius: "50%",
										background: "#0d0c0a",
									}}
								/>
							</div>
						</div>
					</div>
				</div>

				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						fontSize: 24,
						color: "#8d887c",
					}}
				>
					<span>Tracks · Videos · Hidden Gems</span>
					<span>tuned by AviusX</span>
				</div>
			</div>
		),
		size,
	);
}
