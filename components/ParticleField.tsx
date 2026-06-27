"use client";

import { useEffect, useRef } from "react";

type Shape = "circle" | "triangle" | "diamond" | "square";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  shape: Shape;
  alpha: number;
  targetX: number;
  targetY: number;
}

const COLORS = [
  "#8052ff", "#8052ff", "#8052ff",   // Plum Voltage — dominant
  "#ffb829", "#ffb829",              // Amber Spark
  "#15846e",                         // Lichen
  "rgba(255,255,255,0.7)",           // Bone
];

const SHAPES: Shape[] = ["circle", "triangle", "diamond", "square"];

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

/* Sphere cluster target positions */
function sphereTarget(i: number, total: number, cx: number, cy: number, r: number) {
  const phi   = Math.acos(1 - (2 * (i + 0.5)) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return {
    x: cx + r * Math.sin(phi) * Math.cos(theta),
    y: cy + r * Math.sin(phi) * Math.sin(theta) * 0.55, // flatten to ellipse
  };
}

/* Anatomical lobe map for the "brain" cluster — cerebrum, frontal lobe,
   temporal lobe, occipital lobe, cerebellum + brainstem — each rendered
   as its own wrinkled golden-spiral mass so the silhouette reads as a
   real (if stylized, digital) brain rather than a single bumpy sphere.
   Offsets/radii are in units of `r`. */
const BRAIN_LOBES = [
  { ox: 0,     oy: -0.10, rx: 0.86, ry: 0.64, w: 0.40, wrinkle: 0.95 }, // cerebrum
  { ox: 0.66,  oy: -0.30, rx: 0.46, ry: 0.38, w: 0.20, wrinkle: 1.25 }, // frontal lobe
  { ox: 0.30,  oy: 0.32,  rx: 0.48, ry: 0.28, w: 0.17, wrinkle: 0.7 },  // temporal lobe
  { ox: -0.70, oy: -0.05, rx: 0.36, ry: 0.32, w: 0.13, wrinkle: 1.05 }, // occipital lobe
  { ox: -0.15, oy: 0.54,  rx: 0.24, ry: 0.18, w: 0.10, wrinkle: 1.8 },  // cerebellum
] as const;

function brainTarget(i: number, total: number, cx: number, cy: number, r: number) {
  const stemCount = Math.floor(total * 0.05);
  const cerebellum = BRAIN_LOBES[4];

  /* Brainstem — trails down from the cerebellum, not the center mass. */
  if (i < stemCount) {
    const f = i / stemCount;
    const wobble = Math.sin(f * 14) * r * 0.04;
    return {
      x: cx + cerebellum.ox * r + wobble,
      y: cy + cerebellum.oy * r + f * r * 0.55,
    };
  }

  const j = i - stemCount;
  const jt = Math.max(total - stemCount, 1);
  const totalW = BRAIN_LOBES.reduce((s, l) => s + l.w, 0);

  let lobe = BRAIN_LOBES[BRAIN_LOBES.length - 1];
  let kLocal = j;
  let kCount = jt;
  let acc = 0;
  for (let n = 0; n < BRAIN_LOBES.length; n++) {
    const share = Math.round((BRAIN_LOBES[n].w / totalW) * jt);
    if (j < acc + share || n === BRAIN_LOBES.length - 1) {
      lobe = BRAIN_LOBES[n];
      kLocal = j - acc;
      kCount = Math.max(share, 1);
      break;
    }
    acc += share;
  }

  const phi = Math.acos(1 - (2 * (kLocal + 0.5)) / kCount);
  const theta = Math.PI * (1 + Math.sqrt(5)) * kLocal;

  /* Multi-frequency surface noise = gyri/sulci wrinkle texture, denser
     and sharper than a plain sphere bump for a more "etched circuitry"
     read on each lobe. */
  const wrinkle =
    1 +
    lobe.wrinkle *
      (0.09 * Math.sin(theta * 9 + phi * 5) +
        0.06 * Math.sin(theta * 5 - phi * 8) +
        0.04 * Math.sin(theta * 13 + 1.7));

  return {
    x: cx + lobe.ox * r + lobe.rx * r * wrinkle * Math.sin(phi) * Math.cos(theta),
    y: cy + lobe.oy * r + lobe.ry * r * wrinkle * Math.sin(phi) * Math.sin(theta),
  };
}

type ClusterShape = "sphere" | "brain";

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

    const targetFn = shape === "brain" ? brainTarget : sphereTarget;

    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const tgt = targetFn(i, count, W() / 2, H() / 2, Math.min(W(), H()) * 0.38);
      return {
        x: Math.random() * W(),
        y: Math.random() * H(),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2.5 + 1,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        alpha: Math.random() * 0.6 + 0.3,
        targetX: tgt.x,
        targetY: tgt.y,
      };
    });

    const tick = () => {
      ctx.clearRect(0, 0, W(), H());
      t += 0.004;

      particles.forEach((p, i) => {
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
      /* static snapshot only */
      particles.forEach(p => { p.x = p.targetX; p.y = p.targetY; drawShape(ctx, p); });
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
