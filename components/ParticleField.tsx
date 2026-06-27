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

export default function ParticleField({ count = 700 }: { count?: number }) {
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

    const particles: Particle[] = Array.from({ length: count }, (_, i) => {
      const tgt = sphereTarget(i, count, W() / 2, H() / 2, Math.min(W(), H()) * 0.38);
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
  }, [count]);

  return (
    <div className="hero-canvas-wrap" aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
