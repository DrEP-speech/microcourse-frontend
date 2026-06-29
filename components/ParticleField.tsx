"use client";

import { useEffect, useRef, useState } from "react";

type Shape = "circle" | "triangle" | "diamond" | "square";
type ClusterShape = "sphere" | "brain";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  color: string;
  shape: Shape;
  alpha: number;
  lobeId: string;    // which functional region this particle belongs to (drives color)
  baseDX: number;     // resting offset from center, x (in px)
  baseDY: number;     // resting offset from center, y (in px)
  targetX: number;
  targetY: number;
}

const SHAPES: Shape[] = ["circle", "triangle", "diamond", "square"];

/* One micro-lesson worth of facts: each lobe gets its own color so the
   constellation doubles as an infographic — color tells you which
   region you're looking at, a hover tooltip tells you what it does. */
export const LOBE_INFO = [
  { id: "frontal",    name: "Frontal Lobe",    color: "#ffb829", blurb: "Decision-making, planning, and self-control." },
  { id: "parietal",   name: "Parietal Lobe",   color: "#8052ff", blurb: "Sensory processing and spatial awareness." },
  { id: "temporal",   name: "Temporal Lobe",   color: "#15846e", blurb: "Hearing, memory, and language." },
  { id: "occipital",  name: "Occipital Lobe",  color: "#5b8def", blurb: "Visual processing." },
  { id: "cerebellum", name: "Cerebellum",      color: "#ffffff", blurb: "Balance, coordination, and fine motor control." },
  { id: "brainstem",  name: "Brainstem",       color: "#ffffff", blurb: "Breathing, heart rate, and other survival functions." },
] as const;

const LOBE_MAP: Record<string, (typeof LOBE_INFO)[number]> = Object.fromEntries(
  LOBE_INFO.map((l) => [l.id, l])
);

function pickColor(lobeId: string) {
  const info = LOBE_MAP[lobeId];
  if (!info) return "rgba(255,255,255,0.6)";
  /* Mostly the lobe's own color, with an occasional bone-white sparkle
     to keep some depth/shimmer in the field. */
  return Math.random() < 0.78 ? info.color : "rgba(255,255,255,0.6)";
}

/* Reference constellation is triangle-dominant with circles/diamonds as
   secondary texture and squares as a rare accent — matches the Dala
   "thousands of tiny geometric shapes" brief more closely than an even
   split across all four shapes. */
function pickShape(): Shape {
  const r = Math.random();
  if (r < 0.55) return "triangle";
  if (r < 0.8) return "circle";
  if (r < 0.93) return "diamond";
  return "square";
}

function drawShape(ctx: CanvasRenderingContext2D, p: Particle, alpha: number, size: number) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = p.color;
  ctx.beginPath();

  const s = size;
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
    lobeId: "parietal",
  };
}

/* ── Anatomical brain (lateral / side-on view) ────────────────────────
   Instead of sculpting a blob out of sphere math (which reliably reads
   as "a ball" no matter how it's perturbed), particles are rejection-
   sampled *inside an actual brain silhouette* — a real outline plus a
   cerebellum and brainstem, drawn straight from SVG path data. Each
   cortex lobe is an ellipse that's ANDed against the outline, so every
   resting particle position is guaranteed to land inside the brain's
   true contour. This is what makes the cluster read as a brain rather
   than a sphere with confetti on it. Coordinate space is a fixed
   600×460 box, fitted into the canvas at mount time. */
const BOX_W = 600;
const BOX_H = 460;

const BRAIN_OUTLINE_D =
  "M 80,210 C 70,140 130,70 220,55 C 290,42 360,55 410,85 " +
  "C 460,60 540,90 555,150 C 565,190 545,215 525,225 " +
  "C 545,250 540,280 515,300 C 520,330 500,355 465,365 " +
  "C 460,395 430,415 395,410 C 385,430 350,440 320,425 " +
  "C 290,440 250,435 230,415 C 190,420 150,400 135,365 " +
  "C 100,355 75,320 75,275 C 65,250 70,225 80,210 Z";

const BRAINSTEM_D =
  "M428,378 C418,400 416,428 428,448 L450,448 C456,428 454,400 448,378 Z";

/* A handful of short curved strokes to suggest gyri folds — cheap,
   drawn once per frame as plain path strokes (no per-particle cost). */
const SULCI_D = [
  "M150,120 C175,140 195,128 222,148",
  "M260,80 C288,102 300,86 332,104",
  "M120,250 C158,262 188,246 218,260",
  "M340,150 C368,168 392,156 420,172",
  "M210,330 C242,344 270,330 300,342",
  "M430,210 C455,228 478,214 500,230",
];

function buildEllipsePath(cx: number, cy: number, rx: number, ry: number, rotDeg = 0) {
  const path = new Path2D();
  path.ellipse(cx, cy, rx, ry, (rotDeg * Math.PI) / 180, 0, Math.PI * 2);
  return path;
}

/* ── Pure-math inclusion tests ─────────────────────────────────────────
   Rejection sampling originally went through ctx.isPointInPath against
   hand-drawn bezier Path2D objects, but that came back almost always
   false (self-overlapping curves + winding-rule edge cases), so nearly
   every particle fell through to its single fallback point — which is
   exactly the "everything collapsed into one dot per lobe" look in the
   screenshot. Doing the inclusion test in plain JS, independent of any
   canvas state, removes that failure mode entirely. */
function pointInEllipse(cx: number, cy: number, rx: number, ry: number, rotDeg: number, x: number, y: number) {
  const rad = (rotDeg * Math.PI) / 180;
  const dx = x - cx, dy = y - cy;
  const cos = Math.cos(-rad), sin = Math.sin(-rad);
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;
  return (lx * lx) / (rx * rx) + (ly * ly) / (ry * ry) <= 1;
}

/* Flattens our "M C C ... Z" path strings into a polygon (cubic beziers
   sampled at a fixed resolution), once, at module load. */
function flattenPathToPolygon(d: string, samplesPerCurve = 16): { x: number; y: number }[] {
  const tokens = d.match(/[MCLZ]|-?\d*\.?\d+/g) || [];
  const pts: { x: number; y: number }[] = [];
  let cur = { x: 0, y: 0 };
  let i = 0;
  const num = () => parseFloat(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i];
    if (cmd === "M") {
      i++;
      cur = { x: num(), y: num() };
      pts.push({ ...cur });
    } else if (cmd === "L") {
      i++;
      cur = { x: num(), y: num() };
      pts.push({ ...cur });
    } else if (cmd === "C") {
      i++;
      const x1 = num(), y1 = num(), x2 = num(), y2 = num(), x = num(), y = num();
      for (let s = 1; s <= samplesPerCurve; s++) {
        const t = s / samplesPerCurve;
        const mt = 1 - t;
        pts.push({
          x: mt * mt * mt * cur.x + 3 * mt * mt * t * x1 + 3 * mt * t * t * x2 + t * t * t * x,
          y: mt * mt * mt * cur.y + 3 * mt * mt * t * y1 + 3 * mt * t * t * y2 + t * t * t * y,
        });
      }
      cur = { x, y };
    } else {
      i++; // "Z" or stray token
    }
  }
  return pts;
}

function pointInPolygon(poly: { x: number; y: number }[], x: number, y: number) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x, yi = poly[i].y, xj = poly[j].x, yj = poly[j].y;
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

interface CortexLobe {
  id: string;
  pct: number;
  cx: number; cy: number; rx: number; ry: number; rot?: number;
}

const CORTEX_LOBES: CortexLobe[] = [
  { id: "frontal",   pct: 0.29, cx: 185, cy: 165, rx: 125, ry: 115 },
  { id: "parietal",  pct: 0.33, cx: 345, cy: 115, rx: 135, ry: 85, rot: -5 },
  { id: "temporal",  pct: 0.19, cx: 255, cy: 325, rx: 145, ry: 62, rot: -14 },
  { id: "occipital", pct: 0.19, cx: 505, cy: 225, rx: 95,  ry: 85 },
];
const CEREBELLUM = { cx: 478, cy: 358, rx: 62, ry: 46, rot: 8, pct: 0.13 };
const BRAINSTEM_PCT = 0.05;

/* Rejection-sample a random point inside an ellipse (optionally also
   requiring it sit inside the outline polygon), falling back to the
   ellipse center if we somehow run out of tries. */
function sampleInEllipse(
  lobe: { cx: number; cy: number; rx: number; ry: number; rot?: number },
  outlinePoly?: { x: number; y: number }[],
  maxTries = 60
) {
  const bbox = { x: lobe.cx - lobe.rx, y: lobe.cy - lobe.ry, w: lobe.rx * 2, h: lobe.ry * 2 };
  for (let t = 0; t < maxTries; t++) {
    const x = bbox.x + Math.random() * bbox.w;
    const y = bbox.y + Math.random() * bbox.h;
    if (
      pointInEllipse(lobe.cx, lobe.cy, lobe.rx, lobe.ry, lobe.rot ?? 0, x, y) &&
      (!outlinePoly || pointInPolygon(outlinePoly, x, y))
    ) {
      return { x, y };
    }
  }
  return { x: lobe.cx, y: lobe.cy };
}

/* Rejection-sample a random point inside an arbitrary flattened polygon
   (used for the brainstem, which isn't a clean ellipse). */
function sampleInPolygon(
  poly: { x: number; y: number }[],
  bbox: { x: number; y: number; w: number; h: number },
  fallback: { x: number; y: number },
  maxTries = 60
) {
  for (let t = 0; t < maxTries; t++) {
    const x = bbox.x + Math.random() * bbox.w;
    const y = bbox.y + Math.random() * bbox.h;
    if (pointInPolygon(poly, x, y)) return { x, y };
  }
  return fallback;
}

interface HoverInfo { lobeId: string; x: number; y: number; }

export default function ParticleField({
  count = 700,
  shape = "sphere",
}: {
  count?: number;
  shape?: ClusterShape;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hover, setHover] = useState<HoverInfo | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isBrain = shape === "brain";

    let raf = 0;
    let t = 0;
    let hoveredLobe: string | null = null;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width  = canvas.offsetWidth  * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // avoid compounding scale on repeat resizes
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;
    const r = Math.min(W(), H()) * 0.38;

    /* ── Brain silhouette setup (mount-time only) ── */
    const fitScale = isBrain ? (Math.min(W(), H()) / Math.max(BOX_W, BOX_H)) * 1.55 : 1;
    const offX = isBrain ? (W() - BOX_W * fitScale) / 2 : 0;
    const offY = isBrain ? (H() - BOX_H * fitScale) / 2 : 0;
    const toCanvas = (x: number, y: number) => ({ x: offX + x * fitScale, y: offY + y * fitScale });

    /* Path2D objects are kept only for the decorative outline/stroke
       render (drawTexture) — actual particle placement now goes through
       the pure-math polygon/ellipse tests above, which can't silently
       fail the way ctx.isPointInPath did. */
    const outlinePath = isBrain ? new Path2D(BRAIN_OUTLINE_D) : null;
    const brainstemPath = isBrain ? new Path2D(BRAINSTEM_D) : null;
    const cerebellumPath = isBrain
      ? buildEllipsePath(CEREBELLUM.cx, CEREBELLUM.cy, CEREBELLUM.rx, CEREBELLUM.ry, CEREBELLUM.rot)
      : null;
    const sulciPaths = isBrain ? SULCI_D.map((d) => new Path2D(d)) : [];

    const outlinePoly = isBrain ? flattenPathToPolygon(BRAIN_OUTLINE_D) : [];
    const brainstemPoly = isBrain ? flattenPathToPolygon(BRAINSTEM_D) : [];

    const particles: Particle[] = [];

    if (isBrain) {
      const total = count;
      const brainstemCount = Math.round(total * BRAINSTEM_PCT);
      const cerebellumCount = Math.round(total * CEREBELLUM.pct);
      const cortexCount = total - brainstemCount - cerebellumCount;

      const pushParticle = (px: number, py: number, lobeId: string) => {
        const c = toCanvas(px, py);
        const baseDX = c.x - W() / 2;
        const baseDY = c.y - H() / 2;
        particles.push({
          x: Math.random() * W(),
          y: Math.random() * H(),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2.6 + 1.5,
          color: pickColor(lobeId),
          shape: pickShape(),
          alpha: Math.random() * 0.4 + 0.5,
          lobeId,
          baseDX,
          baseDY,
          targetX: W() / 2 + baseDX,
          targetY: H() / 2 + baseDY,
        });
      };

      /* Brainstem — narrow trailing shape beneath the cerebellum. */
      const stemBBox = { x: 408, y: 374, w: 54, h: 80 };
      for (let i = 0; i < brainstemCount; i++) {
        const pt = sampleInPolygon(brainstemPoly, stemBBox, { x: 438, y: 410 });
        pushParticle(pt.x, pt.y, "brainstem");
      }

      /* Cerebellum — ridged mass tucked under the occipital pole. */
      for (let i = 0; i < cerebellumCount; i++) {
        const pt = sampleInEllipse(CEREBELLUM);
        pushParticle(pt.x, pt.y, "cerebellum");
      }

      /* Cortex lobes — each ellipse ANDed against the true outline so
         nothing escapes the silhouette's edge. */
      let remaining = cortexCount;
      CORTEX_LOBES.forEach((lobe, idx) => {
        const isLast = idx === CORTEX_LOBES.length - 1;
        const n = isLast ? remaining : Math.round(lobe.pct * cortexCount);
        remaining -= n;
        for (let i = 0; i < n; i++) {
          const pt = sampleInEllipse(lobe, outlinePoly);
          pushParticle(pt.x, pt.y, lobe.id);
        }
      });
      /* Sparse ambient drift outside the silhouette — small, dim,
         scattered across the full canvas — so density "varies, thick in
         the center, sparse at the edges" instead of stopping hard at the
         brain's contour. Not part of any lobe; never brightens on
         hover. */
      const ambientCount = Math.round(total * 0.16);
      for (let i = 0; i < ambientCount; i++) {
        const ax = Math.random() * W();
        const ay = Math.random() * H();
        particles.push({
          x: ax,
          y: ay,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: Math.random() * 1.6 + 0.8,
          color: Math.random() < 0.5 ? "rgba(255,255,255,0.4)" : pickColor(
            CORTEX_LOBES[Math.floor(Math.random() * CORTEX_LOBES.length)].id
          ),
          shape: pickShape(),
          alpha: Math.random() * 0.18 + 0.05,
          lobeId: "__ambient",
          baseDX: ax - W() / 2,
          baseDY: ay - H() / 2,
          targetX: ax,
          targetY: ay,
        });
      }
    } else {
      for (let i = 0; i < count; i++) {
        const off = sphereOffset(i, count, r);
        particles.push({
          x: Math.random() * W(),
          y: Math.random() * H(),
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2.5 + 1,
          color: pickColor(off.lobeId),
          shape: pickShape(),
          alpha: Math.random() * 0.6 + 0.3,
          lobeId: off.lobeId,
          baseDX: off.dx,
          baseDY: off.dy,
          targetX: W() / 2 + off.dx,
          targetY: H() / 2 + off.dy,
        });
      }
    }

    /* Hover lights up the lobe under the cursor instead of the brain
       animating on its own — particles in the hovered lobe brighten and
       grow, everything else dims so the active region pops. */
    const HOVER_RADIUS_SQ = isBrain ? (Math.max(BOX_W, BOX_H) * fitScale * 0.55) ** 2 : Infinity;

    const nearestLobe = (mx: number, my: number): string | null => {
      let best: Particle | null = null;
      let bestD = Infinity;
      for (const p of particles) {
        if (p.lobeId === "__ambient") continue;
        const dx = p.x - mx;
        const dy = p.y - my;
        const d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = p; }
      }
      return best && bestD < HOVER_RADIUS_SQ ? best.lobeId : null;
    };

    /* Reference constellation is pure particle mass — no vector outline
       or sulci strokes drawn over it, the brain silhouette is implied
       entirely by where particles cluster vs. thin out. Kept as a no-op
       (rather than deleted) so the Path2D setup above stays available if
       a future pass wants a faint outline back. */
    const drawTexture = () => {};

    const drawFrame = () => {
      ctx.clearRect(0, 0, W(), H());
      drawTexture();
      particles.forEach((p) => {
        let alpha = p.alpha;
        let size = p.size;
        if (hoveredLobe) {
          if (p.lobeId === hoveredLobe) {
            alpha = Math.min(1, p.alpha + 0.5);
            size = p.size * 1.7;
          } else {
            alpha = p.alpha * 0.18;
          }
        }
        drawShape(ctx, p, alpha, size);
      });
    };

    const handleMove = (e: MouseEvent) => {
      if (!isBrain) return;
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left);
      const my = (e.clientY - rect.top);
      const lobeId = nearestLobe(mx, my);
      hoveredLobe = lobeId;
      setHover(lobeId ? { lobeId, x: mx, y: my } : null);
      if (prefersReduced) drawFrame();
    };
    const handleLeave = () => {
      hoveredLobe = null;
      setHover(null);
      if (prefersReduced) drawFrame();
    };
    if (isBrain) {
      canvas.addEventListener("mousemove", handleMove);
      canvas.addEventListener("mouseleave", handleLeave);
    }

    const tick = () => {
      t += 0.004;
      const cx = W() / 2;
      const cy = H() / 2;

      particles.forEach((p, i) => {
        p.targetX = cx + p.baseDX;
        p.targetY = cy + p.baseDY;

        /* gentle ambient drift — just a living texture, no shape motion */
        const drift = Math.sin(t + i * 0.1) * 3;
        const dx = (p.targetX + drift) - p.x;
        const dy = (p.targetY + Math.cos(t * 0.7 + i * 0.07) * 2) - p.y;
        p.vx += dx * 0.012;
        p.vy += dy * 0.012;
        p.vx *= 0.92;
        p.vy *= 0.92;
        p.x += p.vx;
        p.y += p.vy;
      });

      drawFrame();
      raf = requestAnimationFrame(tick);
    };

    if (prefersReduced) {
      /* static snapshot — settle at rest position, hover still works */
      particles.forEach(p => {
        p.x = W() / 2 + p.baseDX;
        p.y = H() / 2 + p.baseDY;
      });
      drawFrame();
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      if (isBrain) {
        canvas.removeEventListener("mousemove", handleMove);
        canvas.removeEventListener("mouseleave", handleLeave);
      }
    };
  }, [count, shape]);

  const info = hover ? LOBE_MAP[hover.lobeId] : null;

  return (
    <div className="hero-canvas-wrap" aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
      {info && hover && (
        <div
          className="brain-hover-tip"
          style={{ left: hover.x, top: hover.y, borderLeftColor: info.color }}
        >
          <strong>{info.name}</strong>
          <span>{info.blurb}</span>
        </div>
      )}
    </div>
  );
}
