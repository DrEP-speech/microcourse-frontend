"use client";

import { useEffect, useRef } from "react";

type Shape = "circle" | "triangle" | "diamond" | "square";
type ClusterShape = "sphere" | "brain";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  shape: Shape;
  alpha: number;
  side: number;      // -1 left hemisphere, 0 midline (cerebellum/stem), +1 right hemisphere
  baseDX: number;     // resting offset from center, x (in px, pre-split)
  baseDY: number;     // resting offset from center, y (in px)
  targetX: number;    // resolved per-frame target (center + offset + live split)
  targetY: number;
}

const SHAPES: Shape[] = ["circle", "triangle", "diamond", "square"];

/* Hemisphere-distinct palettes so the split reads instantly as two
   separate masses — left runs cool/violet, right runs warm/amber,
   midline structures (cerebellum, brainstem) blend both. */
const LEFT_COLORS  = ["#8052ff", "#8052ff", "#8052ff", "#8052ff", "rgba(255,255,255,0.65)"];
const RIGHT_COLORS = ["#ffb829", "#ffb829", "#ffb829", "#ffb829", "#15846e"];
const MID_COLORS   = ["#15846e", "#15846e", "rgba(255,255,255,0.6)", "#8052ff", "#ffb829"];

function pickColor(side: number) {
  const pool = side < 0 ? LEFT_COLORS : side > 0 ? RIGHT_COLORS : MID_COLORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

function drawShape(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.globalAlpha = p.alpha;
  ctx.fillStyle = p.color;
  ctx.beginPath();

  const s = p.size;
  switch (p.shape) {
    case "circle":
      ctx.arc(p.x, p.y, s, 0, Math.PI * 2);
      break;
    case "triangle":
      ctx.moveTo(p.x, p.y - s);
      ctx.lineTo(p.x + s, p.y + s);
      ctx.lineTo(p.x - s, p.y + s);
      ctx.closePath();
      break;
    case "diamond":
      ctx.moveTo(p.x, p.y - s * 1.2);
      ctx.lineTo(p.x + s * 0.7, p.y);
      ctx.lineTo(p.x, p.y + s * 1.2);
      ctx.lineTo(p.x - s * 0.7, p.y);
      ctx.closePath();
      break;
    case "square":
      ctx.rect(p.x - s * 0.7, p.y - s * 0.7, s * 1.4, s * 1.4);
      break;
  }
  ctx.fill();
  ctx.globalAlpha = 1;
}

/* ── Sphere cluster (legacy / generic) ──────────────────────────────── */
function sphereOffset(i: number, total: number, r: number) {
  const phi   = Math.acos(1 - (2 * (i + 0.5)) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return {
    dx: r * Math.sin(phi) * Math.cos(theta),
    dy: r * Math.sin(phi) * Math.sin(theta) * 0.55,
    side: 0,
  };
}

/* ── Anatomical brain (top-down view) ───────────────────────────────
   Two mirrored hemispheres, each built from four sub-masses (cerebral
   bulk, frontal pole, temporal lobe, occipital pole) with independent
   wrinkle frequencies for a folded-cortex texture, plus a shared
   cerebellum + brainstem on the midline. Offsets/radii are in units
   of `r`, resolved relative to hemisphere-local x = 0 (the fissure). */
const HEMI_LOBES = [
  { ox: 0.50, oy: -0.05, rx: 0.58, ry: 0.82, w: 0.42, wrinkle: 1.0 },  // cerebral mass
  { ox: 0.36, oy: -0.72, rx: 0.36, ry: 0.30, w: 0.18, wrinkle: 1.3 },  // frontal pole
  { ox: 0.52, oy: 0.18,  rx: 0.40, ry: 0.28, w: 0.16, wrinkle: 0.8 },  // temporal lobe
  { ox: 0.40, oy: 0.76,  rx: 0.32, ry: 0.28, w: 0.14, wrinkle: 1.1 },  // occipital pole
] as const;
const HEMI_TOTAL_W = HEMI_LOBES.reduce((s, l) => s + l.w, 0);

function hemisphereOffset(localIndex: number, localTotal: number, mirror: 1 | -1) {
  let lobe = HEMI_LOBES[HEMI_LOBES.length - 1];
  let kLocal = localIndex;
  let kCount = localTotal;
  let acc = 0;
  for (let n = 0; n < HEMI_LOBES.length; n++) {
    const share = Math.round((HEMI_LOBES[n].w / HEMI_TOTAL_W) * localTotal);
    if (localIndex < acc + share || n === HEMI_LOBES.length - 1) {
      lobe = HEMI_LOBES[n];
      kLocal = localIndex - acc;
      kCount = Math.max(share, 1);
      break;
    }
    acc += share;
  }

  const phi = Math.acos(1 - (2 * (kLocal + 0.5)) / kCount);
  const theta = Math.PI * (1 + Math.sqrt(5)) * kLocal;

  /* Multi-frequency surface noise = gyri/sulci wrinkle texture. */
  const wrinkle =
    1 +
    lobe.wrinkle *
      (0.09 * Math.sin(theta * 9 + phi * 5) +
        0.06 * Math.sin(theta * 5 - phi * 8) +
        0.04 * Math.sin(theta * 13 + 1.7));

  const localDX = lobe.ox + lobe.rx * wrinkle * Math.sin(phi) * Math.cos(theta);
  const dy = lobe.oy + lobe.ry * wrinkle * Math.sin(phi) * Math.sin(theta);

  return { dx: mirror * localDX, dy };
}

const CEREBELLUM_OY = 1.05;

function brainOffset(i: number, total: number) {
  const stemCount = Math.floor(total * 0.05);
  const cerebellumCount = Math.floor(total * 0.08);

  /* Brainstem — trails down from the cerebellum, on the midline. */
  if (i < stemCount) {
    const f = i / stemCount;
    const wobble = Math.sin(f * 14) * 0.04;
    return { dx: wobble, dy: CEREBELLUM_OY + f * 0.55, side: 0 };
  }

  let j = i - stemCount;

  /* Cerebellum — small ridged mass beneath the occipital poles. */
  if (j < cerebellumCount) {
    const kt = Math.max(cerebellumCount, 1);
    const phi = Math.acos(1 - (2 * (j + 0.5)) / kt);
    const theta = Math.PI * (1 + Math.sqrt(5)) * j;
    const wrinkle = 1 + 1.7 * (0.09 * Math.sin(theta * 9 + phi * 5) + 0.05 * Math.sin(theta * 6 - phi * 9));
    return {
      dx: 0.3 * wrinkle * Math.sin(phi) * Math.cos(theta),
      dy: CEREBELLUM_OY + 0.22 * wrinkle * Math.sin(phi) * Math.sin(theta),
      side: 0,
    };
  }
  j -= cerebellumCount;

  /* Two hemispheres, evenly split across the remaining particles. */
  const hemiTotal = total - stemCount - cerebellumCount;
  const leftCount = Math.floor(hemiTotal / 2);
  const rightCount = hemiTotal - leftCount;

  if (j < leftCount) {
    const off = hemisphereOffset(j, leftCount, -1);
    return { dx: off.dx, dy: off.dy, side: -1 };
  }
  const off = hemisphereOffset(j - leftCount, rightCount, 1);
  return { dx: off.dx, dy: off.dy, side: 1 };
}

export default function ParticleField({
  count = 700,
  shape = "sphere",
}: {
  count?: number;
  shape?: ClusterShape;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isBrain = shape === "brain";

    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    /* Brain runs a smaller base radius than a plain sphere so the
       hemisphere-split animation has room to breathe without clipping
       the canvas at full separation. */
    const r = Math.min(W(), H()) * (isBrain ? 0.34 : 0.38);

    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const off = isBrain ? brainOffset(i, count) : sphereOffset(i, count, r);
      const baseDX = isBrain ? off.dx * r : off.dx;
      const baseDY = isBrain ? off.dy * r : off.dy;
      return {
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 1,
        color: pickColor(off.side),
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        alpha: Math.random() * 0.6 + 0.3,
        side: off.side,
        baseDX,
        baseDY,
        targetX: W() / 2 + baseDX,
        targetY: H() / 2 + baseDY,
      };
    });

    /* Hemispheres drift apart and back together on a slow breathing
       cycle — side === 0 (cerebellum/stem) stays anchored on the
       midline throughout. */
    const SPLIT_MAX = r * 0.32;
    const SPLIT_SPEED = 4.4;

    const tick = () => {
      ctx.clearRect(0, 0, W(), H());
      t += 0.004;

      const cx = W() / 2;
      const cy = H() / 2;
      const splitExtra = isBrain ? SPLIT_MAX * 0.5 * (1 + Math.sin(t * SPLIT_SPEED)) : 0;

      particles.forEach((p, i) => {
        p.targetX = cx + p.baseDX + p.side * splitExtra;
        p.targetY = cy + p.baseDY;

        /* slow drift toward target with a gentle sine offset */
        const drift = Math.sin(t + i * 0.1) * 6;
        const dx = (p.targetX + drift) - p.x;
        const dy = (p.targetY + Math.cos(t * 0.7 + i * 0.07) * 4) - p.y;
        p.vx += dx * 0.012;
        p.vy += dy * 0.012;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;
        drawShape(ctx, p);
      });

      raf = requestAnimationFrame(tick);
    };

    if (prefersReduced) {
      /* static snapshot only — settle at rest position, no split */
      particles.forEach(p => {
        p.x = W() / 2 + p.baseDX;
        p.y = H() / 2 + p.baseDY;
        drawShape(ctx, p);
      });
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [count, shape]);

  return (
    <div className="hero-canvas-wrap" aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
