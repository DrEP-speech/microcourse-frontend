"use client";

import { useEffect, useState } from "react";

/* Same lobe identities used across the app — color is the single source
   of truth that ties this diagram, any future legend, and tooltips
   together. */
export const LOBE_INFO = [
  { id: "frontal",    name: "Frontal Lobe",    color: "#ffb829", blurb: "Decision-making, planning, and self-control." },
  { id: "parietal",   name: "Parietal Lobe",   color: "#8052ff", blurb: "Sensory processing and spatial awareness." },
  { id: "temporal",   name: "Temporal Lobe",   color: "#15846e", blurb: "Hearing, memory, and language." },
  { id: "occipital",  name: "Occipital Lobe",  color: "#5b8def", blurb: "Visual processing." },
  { id: "cerebellum", name: "Cerebellum",      color: "#ffffff", blurb: "Balance, coordination, and fine motor control." },
  { id: "brainstem",  name: "Brainstem",       color: "#ffffff", blurb: "Breathing, heart rate, and other survival functions." },
] as const;

type LobeId = (typeof LOBE_INFO)[number]["id"];

const LOBE_MAP: Record<string, (typeof LOBE_INFO)[number]> = Object.fromEntries(
  LOBE_INFO.map((l) => [l.id, l])
);

/* Hand-drawn lateral silhouette: a translucent "glass" head in profile
   (facing left, like an anatomy-model bust) with the brain seated
   inside the cranium so the relationship between skull and brain is
   immediately legible — rendered as a glowing hologram rather than
   flat paint, since this is meant to look like a projected scan, not
   a literal photo. */
const HEAD_D =
  "M 258,28 C 300,30 338,48 356,78 C 370,100 374,124 372,150 " +
  "C 388,160 396,178 392,198 C 389,213 380,224 368,230 " +
  "C 372,250 370,272 360,292 C 348,316 328,334 304,344 " +
  "L 304,400 C 304,440 310,500 322,560 L 322,584 L 184,584 L 184,560 " +
  "C 178,520 174,470 176,430 L 176,392 " +
  "C 158,386 142,376 130,362 C 118,374 102,376 92,366 " +
  "C 84,358 84,346 90,338 C 80,330 76,318 80,308 " +
  "C 70,300 66,288 70,278 C 60,268 58,254 64,244 " +
  "C 56,232 58,216 70,208 C 66,194 72,178 86,170 " +
  "C 92,148 106,128 126,114 C 122,128 128,138 138,140 " +
  "C 146,118 162,98 184,84 C 188,98 198,106 210,106 " +
  "C 214,82 232,62 258,28 Z";

const LOBE_PATHS: Record<LobeId, string> = {
  frontal:
    "M 150,150 C 130,140 112,150 100,172 C 90,192 92,216 106,234 " +
    "C 120,250 142,256 162,250 C 158,228 158,206 164,186 C 168,170 160,156 150,150 Z",
  parietal:
    "M 162,250 C 158,228 158,206 164,186 C 168,170 160,156 150,150 " +
    "C 168,128 196,112 228,108 C 262,104 296,114 318,136 " +
    "C 330,150 334,168 328,184 C 322,200 306,210 290,212 " +
    "C 286,228 274,242 256,248 C 226,258 192,258 162,250 Z",
  temporal:
    "M 162,250 C 192,258 226,258 256,248 C 264,266 264,284 254,298 " +
    "C 240,318 214,326 190,320 C 168,314 152,296 150,274 C 150,264 154,256 162,250 Z",
  occipital:
    "M 290,212 C 306,210 322,200 328,184 C 334,168 330,150 318,136 " +
    "C 336,144 350,160 354,180 C 358,202 350,222 334,234 " +
    "C 320,244 302,244 290,236 C 290,228 290,220 290,212 Z",
  cerebellum:
    "M 290,236 C 302,244 320,244 334,234 C 342,248 340,264 328,274 " +
    "C 314,284 296,282 286,270 C 280,258 282,246 290,236 Z",
  brainstem:
    "M 286,270 C 282,282 278,296 272,306 C 268,314 262,318 256,316 " +
    "C 252,308 254,296 258,286 C 262,276 270,266 280,262 C 282,265 284,267 286,270 Z",
};

/* Short curved strokes suggesting gyri folds, doubling as the "neural
   pathway" tracks that the animated synapse sparks travel along. */
const SULCI_D = [
  "M120,180 C135,186 150,180 160,190",
  "M115,205 C130,212 145,206 158,214",
  "M180,135 C200,145 222,138 238,148",
  "M195,160 C218,170 244,162 262,172",
  "M250,140 C270,150 292,144 306,156",
  "M170,275 C188,284 208,280 222,288",
  "M300,160 C314,168 326,164 336,172",
];

/* Faint holographic grid, clipped to the head silhouette — decorative,
   drawn once, costs nothing at runtime. */
const GRID_H = [120, 200, 280, 360, 440, 520];
const GRID_V = [120, 180, 240, 300];

interface HoverInfo { lobeId: LobeId; x: number; y: number; }

export default function BrainDiagram() {
  const [hover, setHover] = useState<HoverInfo | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const info = hover ? LOBE_MAP[hover.lobeId] : null;

  const handleEnter = (lobeId: LobeId) => (e: React.MouseEvent<SVGPathElement>) => {
    const wrap = e.currentTarget.closest(".brain-diagram-wrap") as HTMLElement | null;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    setHover({ lobeId, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleMove = (lobeId: LobeId) => (e: React.MouseEvent<SVGPathElement>) => {
    const wrap = e.currentTarget.closest(".brain-diagram-wrap") as HTMLElement | null;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    setHover({ lobeId, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };
  const handleLeave = () => setHover(null);

  return (
    <div className="brain-diagram-wrap" aria-hidden="true">
      <svg
        viewBox="0 0 480 600"
        className="brain-diagram-svg"
        role="img"
        aria-label="Holographic diagram of a brain seated inside a translucent head, with lobes color-coded by function"
      >
        <title>Brain anatomy hologram</title>
        <defs>
          <clipPath id="headClip">
            <path d={HEAD_D} />
          </clipPath>
          <radialGradient id="brainGlow" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#9ab8ff" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#9ab8ff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="rimGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5b8def" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#8052ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#15846e" stopOpacity="0.7" />
          </linearGradient>
          <linearGradient id="scanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#9ab8ff" stopOpacity="0" />
            <stop offset="50%" stopColor="#cfe0ff" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#9ab8ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Glass head silhouette */}
        <path d={HEAD_D} className="head-outline" />
        <path d={HEAD_D} className="head-rim" stroke="url(#rimGradient)" />

        {/* Faint holographic grid + scan sweep, clipped to the head */}
        <g clipPath="url(#headClip)">
          <g className="grid-lines">
            {GRID_H.map((y) => <line key={`h${y}`} x1="40" y1={y} x2="420" y2={y} />)}
            {GRID_V.map((x) => <line key={`v${x}`} x1={x} y1="20" x2={x} y2="590" />)}
          </g>
          {!reducedMotion && <rect className="scan-sweep" x="20" y="-40" width="440" height="60" />}
        </g>

        {/* Faint spinal/neck hint for anatomical continuity */}
        <line x1="220" y1="400" x2="220" y2="560" className="neck-line" />
        <line x1="280" y1="400" x2="280" y2="560" className="neck-line" />

        {/* Brain, lobe by lobe, screen-blended for a luminous hologram look */}
        <g className="brain-group">
          <ellipse cx="230" cy="190" rx="170" ry="150" fill="url(#brainGlow)" />

          {LOBE_INFO.map(({ id, color }) => (
            <path
              key={id}
              d={LOBE_PATHS[id as LobeId]}
              className={`lobe-shape lobe-${id}${hover && hover.lobeId !== id ? " is-dimmed" : ""}${hover && hover.lobeId === id ? " is-active" : ""}`}
              style={{ fill: color, stroke: color, color }}
              onMouseEnter={handleEnter(id as LobeId)}
              onMouseMove={handleMove(id as LobeId)}
              onMouseLeave={handleLeave}
            >
              <title>{LOBE_MAP[id].name}</title>
            </path>
          ))}

          {/* Gyri / neural-pathway texture */}
          <g className="gyri" aria-hidden="true">
            {SULCI_D.map((d, i) => (
              <path key={i} id={`gyri-${i}`} d={d} />
            ))}
          </g>

          {/* Traveling synapse sparks along the neural pathways */}
          {!reducedMotion &&
            SULCI_D.map((d, i) => (
              <circle key={`spark-${i}`} r="2.4" className="synapse-spark">
                <animateMotion
                  dur={`${2.4 + (i % 3) * 0.6}s`}
                  begin={`${i * 0.35}s`}
                  repeatCount="indefinite"
                  path={d}
                />
              </circle>
            ))}
        </g>
      </svg>

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
