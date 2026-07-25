"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { cssColor, onThemeChange, GL_NOISE, GL_VERTEX, type RGB } from "@/lib/gl";

/**
 * Soundwave interference field: horizontal "strings" displaced by
 * travelling waves and noise — like an oscilloscope caught mid-song.
 * More energetic than the parent site's topographic field.
 */
const fragment = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec2 uRes;
uniform vec2 uPointer;
uniform vec3 uBg;
uniform vec3 uInk;
uniform vec3 uAccent;
uniform float uIntro;

varying vec2 vUv;

${GL_NOISE}

void main() {
  vec2 uv = vUv;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 m = vec2(uPointer.x * aspect, uPointer.y);

  float d = distance(p, m);
  float pull = exp(-d * 1.9);

  float t = uTime * 0.14;

  // Travelling waves layered with drifting noise — the "song".
  float wave =
      0.16 * sin(p.x * 5.2 - t * 1.9) +
      0.09 * sin(p.x * 11.5 + t * 1.2) +
      0.05 * sin(p.x * 23.0 - t * 2.6);
  wave *= 0.55 + 0.45 * sin(p.x * 0.9 + t * 0.5);
  wave += 0.22 * (fbm(p * 1.3 + vec2(t * 0.35, -t * 0.2)) - 0.5);
  wave += pull * 0.22 * sin(p.x * 16.0 - t * 4.0);

  // Horizontal strings displaced by the wave field.
  float bands = abs(fract((uv.y + wave * uIntro) * 13.0) - 0.5);
  float line = smoothstep(0.075, 0.0, bands);

  // Amplitude estimate drives brightness — louder near the pointer.
  float energy = clamp(abs(wave) * 2.2 + pull * 0.7, 0.0, 1.0);

  vec3 col = uBg;
  col = mix(col, uInk, line * (0.10 + 0.06 * (1.0 - uv.y)));
  col = mix(col, uAccent, line * energy * 0.55);
  col = mix(col, uAccent, pull * pull * 0.05);

  // Dither grain to avoid banding
  float g = hash(uv * uRes + mod(uTime, 100.0));
  col += (g - 0.5) * 0.028;

  gl_FragColor = vec4(mix(uBg, col, uIntro), 1.0);
}
`;

export default function HeroCanvas() {
	const wrapRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const wrap = wrapRef.current;
		if (!wrap) return;

		let renderer: Renderer;
		try {
			const coarse = window.matchMedia("(pointer: coarse)").matches;
			renderer = new Renderer({
				dpr: Math.min(window.devicePixelRatio || 1, coarse ? 1.25 : 1.5),
				alpha: false,
				antialias: false,
				powerPreference: "high-performance",
			});
		} catch {
			return;
		}

		const gl = renderer.gl;
		wrap.appendChild(gl.canvas);
		gl.canvas.style.width = "100%";
		gl.canvas.style.height = "100%";
		gl.canvas.style.display = "block";

		const readColors = () => ({
			bg: cssColor("--background", [0.95, 0.94, 0.91]),
			ink: cssColor("--foreground", [0.08, 0.07, 0.06]),
			accent: cssColor("--accent", [1, 0.29, 0]),
		});

		let target = readColors();
		const current: { bg: RGB; ink: RGB; accent: RGB } = {
			bg: [...target.bg],
			ink: [...target.ink],
			accent: [...target.accent],
		};

		const program = new Program(gl, {
			vertex: GL_VERTEX,
			fragment,
			uniforms: {
				uTime: { value: 0 },
				uRes: { value: [1, 1] },
				uPointer: { value: [0.5, 0.5] },
				uBg: { value: current.bg },
				uInk: { value: current.ink },
				uAccent: { value: current.accent },
				uIntro: { value: 0 },
			},
		});
		const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

		const resize = () => {
			renderer.setSize(wrap.clientWidth, wrap.clientHeight);
			program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
		};
		resize();
		const ro = new ResizeObserver(resize);
		ro.observe(wrap);

		const stopThemeWatch = onThemeChange(() => {
			target = readColors();
		});

		// Pointer, smoothed in the render loop
		const pointer = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6 };
		const onPointer = (e: PointerEvent) => {
			pointer.tx = e.clientX / window.innerWidth;
			pointer.ty = 1 - e.clientY / window.innerHeight;
		};
		window.addEventListener("pointermove", onPointer, { passive: true });

		let visible = true;
		const io = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
		});
		io.observe(wrap);

		let revealed = false;
		const lerp3 = (a: RGB, b: RGB, t: number) => {
			a[0] += (b[0] - a[0]) * t;
			a[1] += (b[1] - a[1]) * t;
			a[2] += (b[2] - a[2]) * t;
		};

		const tick = (time: number) => {
			if (!visible || document.hidden) return;

			pointer.x += (pointer.tx - pointer.x) * 0.06;
			pointer.y += (pointer.ty - pointer.y) * 0.06;
			program.uniforms.uPointer.value = [pointer.x, pointer.y];

			lerp3(current.bg, target.bg, 0.08);
			lerp3(current.ink, target.ink, 0.08);
			lerp3(current.accent, target.accent, 0.08);

			const intro = program.uniforms.uIntro.value as number;
			if (intro < 1) {
				program.uniforms.uIntro.value = Math.min(1, intro + 0.008);
			}

			program.uniforms.uTime.value = time;
			renderer.render({ scene: mesh });

			if (!revealed) {
				revealed = true;
				wrap.style.opacity = "1";
			}
		};
		gsap.ticker.add(tick);

		return () => {
			gsap.ticker.remove(tick);
			window.removeEventListener("pointermove", onPointer);
			ro.disconnect();
			io.disconnect();
			stopThemeWatch();
			gl.getExtension("WEBGL_lose_context")?.loseContext();
			gl.canvas.remove();
		};
	}, []);

	return (
		<div
			ref={wrapRef}
			aria-hidden
			className="absolute inset-0 opacity-0 transition-opacity duration-1000 ease-out"
		/>
	);
}
