"use client";

import { useEffect, useRef, useCallback } from "react";

// ─── Types ───

interface FloatingNote {
	x: number;
	y: number;
	size: number;
	speed: number;
	drift: number;
	opacity: number;
	rotation: number;
	rotationSpeed: number;
	symbol: string;
	phase: number;
}

interface GlowOrb {
	x: number;
	y: number;
	radius: number;
	baseRadius: number;
	speed: number;
	angle: number;
	orbitRadius: number;
	hueShift: number;
	pulseSpeed: number;
	pulsePhase: number;
}

interface WaveRibbon {
	yOffset: number;
	amplitude: number;
	frequency: number;
	speed: number;
	phase: number;
	opacity: number;
	width: number;
}

interface EqBar {
	x: number;
	width: number;
	maxHeight: number;
	currentHeight: number;
	speed: number;
	phase: number;
}

// ─── Config ───

const NOTE_SYMBOLS = ["♪", "♫", "♩", "♬", "♭", "♮", "♯"];
const NOTE_COUNT = 22;
const ORB_COUNT = 6;
const RIBBON_COUNT = 5;
const EQ_BAR_COUNT = 56;

// ─── Helpers ───

function randomBetween(min: number, max: number) {
	return Math.random() * (max - min) + min;
}

function getThemeColors(): {
	accent: string;
	accentRgb: [number, number, number];
	isDark: boolean;
} {
	if (typeof document === "undefined") {
		return { accent: "#9b7cf5", accentRgb: [155, 124, 245], isDark: true };
	}
	const theme = document.documentElement.getAttribute("data-theme");
	const isDark = theme === "dark";
	return {
		accent: isDark ? "#9b7cf5" : "#7c5ce0",
		accentRgb: isDark ? [155, 124, 245] : [124, 92, 224],
		isDark,
	};
}

// ─── Particle factories ───

function createNote(w: number, h: number): FloatingNote {
	return {
		x: randomBetween(0, w),
		y: randomBetween(h, h * 1.3),
		size: randomBetween(14, 34),
		speed: randomBetween(0.2, 0.6),
		drift: randomBetween(-0.4, 0.4),
		opacity: randomBetween(0.08, 0.25),
		rotation: randomBetween(0, 360),
		rotationSpeed: randomBetween(-0.5, 0.5),
		symbol: NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)],
		phase: randomBetween(0, Math.PI * 2),
	};
}

function createOrb(w: number, h: number): GlowOrb {
	return {
		x: randomBetween(w * 0.15, w * 0.85),
		y: randomBetween(h * 0.15, h * 0.85),
		radius: 0,
		baseRadius: randomBetween(80, 250),
		speed: randomBetween(0.0003, 0.001),
		angle: randomBetween(0, Math.PI * 2),
		orbitRadius: randomBetween(30, 120),
		hueShift: randomBetween(-20, 20),
		pulseSpeed: randomBetween(0.008, 0.02),
		pulsePhase: randomBetween(0, Math.PI * 2),
	};
}

function createRibbon(h: number): WaveRibbon {
	return {
		yOffset: randomBetween(h * 0.15, h * 0.85),
		amplitude: randomBetween(25, 75),
		frequency: randomBetween(0.002, 0.006),
		speed: randomBetween(0.006, 0.018),
		phase: randomBetween(0, Math.PI * 2),
		opacity: randomBetween(0.04, 0.12),
		width: randomBetween(1.5, 4),
	};
}

function createEqBar(i: number, w: number): EqBar {
	const spacing = w / EQ_BAR_COUNT;
	return {
		x: i * spacing,
		width: spacing * 0.55,
		maxHeight: randomBetween(25, 90),
		currentHeight: 0,
		speed: randomBetween(0.02, 0.06),
		phase: randomBetween(0, Math.PI * 2),
	};
}

// ─── Component ───

export default function MusicBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animRef = useRef<number>(0);
	const notesRef = useRef<FloatingNote[]>([]);
	const orbsRef = useRef<GlowOrb[]>([]);
	const ribbonsRef = useRef<WaveRibbon[]>([]);
	const eqBarsRef = useRef<EqBar[]>([]);
	const timeRef = useRef(0);

	const init = useCallback((w: number, h: number) => {
		notesRef.current = Array.from({ length: NOTE_COUNT }, () =>
			createNote(w, h),
		);
		// Spread notes across the full height initially
		notesRef.current.forEach((n, i) => {
			n.y = randomBetween(0, h * 1.2);
		});
		orbsRef.current = Array.from({ length: ORB_COUNT }, () => createOrb(w, h));
		ribbonsRef.current = Array.from({ length: RIBBON_COUNT }, () =>
			createRibbon(h),
		);
		eqBarsRef.current = Array.from({ length: EQ_BAR_COUNT }, (_, i) =>
			createEqBar(i, w),
		);
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let dpr = window.devicePixelRatio || 1;

		function resize() {
			dpr = window.devicePixelRatio || 1;
			const w = window.innerWidth;
			const h = window.innerHeight;
			canvas!.width = w * dpr;
			canvas!.height = h * dpr;
			canvas!.style.width = `${w}px`;
			canvas!.style.height = `${h}px`;
			ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
			init(w, h);
		}

		resize();
		window.addEventListener("resize", resize);

		function draw() {
			const w = canvas!.width / dpr;
			const h = canvas!.height / dpr;
			const { accentRgb, isDark } = getThemeColors();
			const [r, g, b] = accentRgb;

			timeRef.current += 1;
			const t = timeRef.current;

			ctx!.clearRect(0, 0, w, h);

			// ─── Layer 1: Glowing Orbs ───
			for (const orb of orbsRef.current) {
				orb.angle += orb.speed;
				orb.pulsePhase += orb.pulseSpeed;

				const pulse = Math.sin(orb.pulsePhase) * 0.35 + 0.65;
				orb.radius = orb.baseRadius * pulse;

				const ox = orb.x + Math.cos(orb.angle) * orb.orbitRadius;
				const oy = orb.y + Math.sin(orb.angle * 0.7) * orb.orbitRadius;

				const gradient = ctx!.createRadialGradient(
					ox,
					oy,
					0,
					ox,
					oy,
					orb.radius,
				);
				const alpha = isDark ? 0.12 : 0.08;
				gradient.addColorStop(
					0,
					`rgba(${r + orb.hueShift}, ${g + orb.hueShift}, ${b}, ${alpha * 1.5})`,
				);
				gradient.addColorStop(
					0.5,
					`rgba(${r + orb.hueShift}, ${g + orb.hueShift}, ${b}, ${alpha * 0.5})`,
				);
				gradient.addColorStop(
					1,
					`rgba(${r + orb.hueShift}, ${g + orb.hueShift}, ${b}, 0)`,
				);

				ctx!.fillStyle = gradient;
				ctx!.beginPath();
				ctx!.arc(ox, oy, orb.radius, 0, Math.PI * 2);
				ctx!.fill();
			}

			// ─── Layer 2: Sound Wave Ribbons ───
			for (const ribbon of ribbonsRef.current) {
				ribbon.phase += ribbon.speed;

				ctx!.beginPath();
				ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${ribbon.opacity})`;
				ctx!.lineWidth = ribbon.width;
				ctx!.lineCap = "round";

				for (let x = 0; x <= w; x += 3) {
					const y =
						ribbon.yOffset +
						Math.sin(x * ribbon.frequency + ribbon.phase) * ribbon.amplitude +
						Math.sin(x * ribbon.frequency * 2.3 + ribbon.phase * 1.5) *
							(ribbon.amplitude * 0.35) +
						Math.sin(x * ribbon.frequency * 0.5 + ribbon.phase * 0.7) *
							(ribbon.amplitude * 0.5);

					if (x === 0) ctx!.moveTo(x, y);
					else ctx!.lineTo(x, y);
				}
				ctx!.stroke();
			}

			// ─── Layer 3: Equalizer Bars (bottom) ───
			const barFadeHeight = 80;
			for (const bar of eqBarsRef.current) {
				bar.phase += bar.speed;
				bar.currentHeight =
					bar.maxHeight *
					(Math.sin(bar.phase) * 0.4 + 0.5) *
					(Math.sin(bar.phase * 0.3) * 0.3 + 0.7);

				const barGrad = ctx!.createLinearGradient(
					bar.x,
					h,
					bar.x,
					h - bar.currentHeight,
				);
				const barAlpha = isDark ? 0.14 : 0.09;
				barGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${barAlpha})`);
				barGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

				ctx!.fillStyle = barGrad;
				ctx!.beginPath();
				const barRadius = Math.min(bar.width * 0.4, 3);
				const bx = bar.x;
				const by = h - bar.currentHeight;
				const bw = bar.width;
				const bh = bar.currentHeight;

				// Rounded top corners
				ctx!.moveTo(bx + barRadius, by);
				ctx!.lineTo(bx + bw - barRadius, by);
				ctx!.quadraticCurveTo(bx + bw, by, bx + bw, by + barRadius);
				ctx!.lineTo(bx + bw, by + bh);
				ctx!.lineTo(bx, by + bh);
				ctx!.lineTo(bx, by + barRadius);
				ctx!.quadraticCurveTo(bx, by, bx + barRadius, by);
				ctx!.fill();
			}

			// ─── Layer 4: Floating Music Notes ───
			for (const note of notesRef.current) {
				note.y -= note.speed;
				note.x += note.drift + Math.sin(t * 0.01 + note.phase) * 0.15;
				note.rotation += note.rotationSpeed;

				// Subtle horizontal wave
				const waveX = Math.sin(t * 0.008 + note.phase) * 8;

				if (note.y < -50) {
					Object.assign(note, createNote(w, h));
					note.y = h + 20;
				}

				ctx!.save();
				ctx!.translate(note.x + waveX, note.y);
				ctx!.rotate((note.rotation * Math.PI) / 180);
				ctx!.font = `${note.size}px serif`;
				ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${note.opacity})`;
				ctx!.textAlign = "center";
				ctx!.textBaseline = "middle";
				ctx!.fillText(note.symbol, 0, 0);
				ctx!.restore();
			}

			// ─── Layer 5: Connecting Lines (constellation) ───
			const connectionDistance = 200;
			const notePositions = notesRef.current.map((n) => ({
				x: n.x + Math.sin(t * 0.008 + n.phase) * 8,
				y: n.y,
				opacity: n.opacity,
			}));

			for (let i = 0; i < notePositions.length; i++) {
				for (let j = i + 1; j < notePositions.length; j++) {
					const dx = notePositions[i].x - notePositions[j].x;
					const dy = notePositions[i].y - notePositions[j].y;
					const dist = Math.sqrt(dx * dx + dy * dy);

					if (dist < connectionDistance) {
						const lineAlpha =
							(1 - dist / connectionDistance) *
							0.06 *
							Math.min(notePositions[i].opacity, notePositions[j].opacity) *
							10;
						ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${lineAlpha})`;
						ctx!.lineWidth = 0.5;
						ctx!.beginPath();
						ctx!.moveTo(notePositions[i].x, notePositions[i].y);
						ctx!.lineTo(notePositions[j].x, notePositions[j].y);
						ctx!.stroke();
					}
				}
			}

			// ─── Layer 6: Spinning Vinyl Ring (top-right) ───
			const vinylX = w - 120;
			const vinylY = 140;
			const vinylOuterR = 70;
			const vinylInnerR = 12;
			const vinylRotation = t * 0.003;

			ctx!.save();
			ctx!.translate(vinylX, vinylY);
			ctx!.rotate(vinylRotation);

			// Grooves
			for (let ring = vinylInnerR + 4; ring < vinylOuterR; ring += 6) {
				const ringAlpha = isDark ? 0.05 : 0.03;
				ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${ringAlpha})`;
				ctx!.lineWidth = 0.5;
				ctx!.beginPath();
				ctx!.arc(0, 0, ring, 0, Math.PI * 2);
				ctx!.stroke();
			}

			// Outer ring
			const outerAlpha = isDark ? 0.08 : 0.05;
			ctx!.strokeStyle = `rgba(${r}, ${g}, ${b}, ${outerAlpha})`;
			ctx!.lineWidth = 1.5;
			ctx!.beginPath();
			ctx!.arc(0, 0, vinylOuterR, 0, Math.PI * 2);
			ctx!.stroke();

			// Center dot
			const centerGrad = ctx!.createRadialGradient(0, 0, 0, 0, 0, vinylInnerR);
			const centerAlpha = isDark ? 0.12 : 0.08;
			centerGrad.addColorStop(
				0,
				`rgba(${r}, ${g}, ${b}, ${centerAlpha * 1.5})`,
			);
			centerGrad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${centerAlpha})`);
			ctx!.fillStyle = centerGrad;
			ctx!.beginPath();
			ctx!.arc(0, 0, vinylInnerR, 0, Math.PI * 2);
			ctx!.fill();

			ctx!.restore();

			animRef.current = requestAnimationFrame(draw);
		}

		animRef.current = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(animRef.current);
			window.removeEventListener("resize", resize);
		};
	}, [init]);

	return (
		<canvas ref={canvasRef} className="music-bg-canvas" aria-hidden="true" />
	);
}
