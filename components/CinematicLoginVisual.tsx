"use client";

import { useEffect, useRef } from "react";

/**
 * Full-bleed, generative "cinematic video" backdrop for the login screen.
 * No video asset is used — a canvas renders a living scene that stands in
 * for one: a drifting neural network (cognition), a glowing wireframe
 * figure in slow continuous movement (the body/physical), both reacting
 * to the cursor (interaction). Matches the Dala void design system —
 * Plum Voltage / Amber Spark / Lichen / Bone — and the sizing convention
 * used by ParticleField (a `.hero-canvas-wrap` square canvas). Respects
 * prefers-reduced-motion.
 */
export default function CinematicLoginVisual() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const PLUM = "128,82,255";   // --color-plum-voltage
    const AMBER = "255,184,41";  // --color-amber-spark
    const LICHEN = "21,132,110"; // --color-lichen
    const BONE = "255,255,255"; // --color-bone

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);

    type Node = { x: number; y: number; vx: number; vy: number; phase: number };
    let nodes: Node[] = [];
    const NODE_COUNT = 46;

    const mouse = { x: -9999, y: -9999, active: false };

    function resize() {
      const parent = canvas!.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = width + "px";
      canvas!.style.height = height + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function seedNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        phase: Math.random() * Math.PI * 2,
      }));
    }

    resize();
    seedNodes();

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    }
    function onLeave() {
      mouse.active = false;
    }
    function onResize() {
      resize();
    }

    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);

    // ── Wireframe figure (forward-kinematics stick figure: the body/physical) ──
    function drawFigure(t: number, originX: number, originY: number, scale: number) {
      const breathe = Math.sin(t * 0.6) * 0.04;
      const headR = 9 * scale;
      const spine = 70 * scale * (1 + breathe * 0.15);
      const shoulderW = 36 * scale;
      const hipW = 24 * scale;
      const upperArm = 34 * scale;
      const forearm = 30 * scale;
      const thigh = 42 * scale;
      const shin = 40 * scale;

      const headY = originY - spine - headR;
      const shoulderY = originY - spine;
      const hipY = originY;

      const armSwingL = Math.sin(t * 0.5) * 0.7 + 0.3;
      const armSwingR = Math.sin(t * 0.5 + Math.PI * 0.8) * 0.7 + 0.3;
      const legShift = Math.sin(t * 0.4) * 0.12;

      const lShoulder = { x: originX - shoulderW / 2, y: shoulderY };
      const rShoulder = { x: originX + shoulderW / 2, y: shoulderY };
      const lHip = { x: originX - hipW / 2, y: hipY };
      const rHip = { x: originX + hipW / 2, y: hipY };

      const lElbow = {
        x: lShoulder.x - upperArm * Math.sin(0.4 + armSwingL * 0.6),
        y: lShoulder.y + upperArm * Math.cos(0.4 + armSwingL * 0.6) * 0.6 - upperArm * armSwingL * 0.5,
      };
      const lHand = {
        x: lElbow.x - forearm * Math.sin(0.2 + armSwingL * 0.9),
        y: lElbow.y - forearm * armSwingL * 0.7,
      };
      const rElbow = {
        x: rShoulder.x + upperArm * Math.sin(0.4 + armSwingR * 0.6),
        y: rShoulder.y + upperArm * Math.cos(0.4 + armSwingR * 0.6) * 0.6 - upperArm * armSwingR * 0.5,
      };
      const rHand = {
        x: rElbow.x + forearm * Math.sin(0.2 + armSwingR * 0.9),
        y: rElbow.y - forearm * armSwingR * 0.7,
      };

      const lKnee = { x: lHip.x - 6 * scale, y: lHip.y + thigh * (1 - legShift * 0.3) };
      const lFoot = { x: lKnee.x - 4 * scale, y: lKnee.y + shin };
      const rKnee = { x: rHip.x + 6 * scale, y: rHip.y + thigh * (1 + legShift * 0.3) };
      const rFoot = { x: rKnee.x + 4 * scale, y: rKnee.y + shin };

      ctx!.save();
      ctx!.strokeStyle = `rgba(${PLUM},0.6)`;
      ctx!.lineWidth = 2 * scale;
      ctx!.lineCap = "round";
      ctx!.shadowColor = `rgba(${PLUM},0.55)`;
      ctx!.shadowBlur = 12 * scale;

      function seg(a: { x: number; y: number }, b: { x: number; y: number }) {
        ctx!.beginPath();
        ctx!.moveTo(a.x, a.y);
        ctx!.lineTo(b.x, b.y);
        ctx!.stroke();
      }

      seg({ x: originX, y: shoulderY }, { x: originX, y: hipY });
      seg(lShoulder, rShoulder);
      seg(lHip, rHip);
      seg({ x: originX, y: shoulderY }, lHip);
      seg({ x: originX, y: shoulderY }, rHip);
      seg(lShoulder, lElbow);
      seg(lElbow, lHand);
      seg(rShoulder, rElbow);
      seg(rElbow, rHand);
      seg(lHip, lKnee);
      seg(lKnee, lFoot);
      seg(rHip, rKnee);
      seg(rKnee, rFoot);

      // joints — amber pulse nodes (where cognition meets motion)
      ctx!.fillStyle = `rgba(${AMBER},0.85)`;
      ctx!.shadowColor = `rgba(${AMBER},0.65)`;
      ctx!.shadowBlur = 9 * scale;
      [lShoulder, rShoulder, lElbow, rElbow, lHand, rHand, lHip, rHip, lKnee, rKnee, lFoot, rFoot].forEach((p) => {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 2.6 * scale, 0, Math.PI * 2);
        ctx!.fill();
      });

      // head
      ctx!.beginPath();
      ctx!.strokeStyle = `rgba(${BONE},0.75)`;
      ctx!.shadowColor = `rgba(${BONE},0.5)`;
      ctx!.shadowBlur = 14 * scale;
      ctx!.arc(originX, headY, headR, 0, Math.PI * 2);
      ctx!.stroke();

      ctx!.restore();
    }

    let raf = 0;
    let start = performance.now();

    function frame(now: number) {
      const t = (now - start) / 1000;
      ctx!.clearRect(0, 0, width, height);

      // drifting neural network — cognition
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0) n.x = width;
        if (n.x > width) n.x = 0;
        if (n.y < 0) n.y = height;
        if (n.y > height) n.y = 0;

        if (mouse.active) {
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 26000) {
            const f = (1 - d2 / 26000) * 0.6;
            n.x -= dx * f * 0.02;
            n.y -= dy * f * 0.02;
          }
        }
      }

      ctx!.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < 16000) {
            const alpha = (1 - dist2 / 16000) * 0.22;
            ctx!.strokeStyle = `rgba(${LICHEN},${alpha})`;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
        if (mouse.active) {
          const dx = nodes[i].x - mouse.x;
          const dy = nodes[i].y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 30000) {
            const alpha = (1 - d2 / 30000) * 0.4;
            ctx!.strokeStyle = `rgba(${AMBER},${alpha})`;
            ctx!.beginPath();
            ctx!.moveTo(nodes[i].x, nodes[i].y);
            ctx!.lineTo(mouse.x, mouse.y);
            ctx!.stroke();
          }
        }
      }

      for (const n of nodes) {
        const r = 1.4 + Math.sin(t * 1.4 + n.phase) * 0.8 + 0.8;
        ctx!.beginPath();
        ctx!.fillStyle = `rgba(${PLUM},0.6)`;
        ctx!.arc(n.x, n.y, Math.max(r, 0.6), 0, Math.PI * 2);
        ctx!.fill();
      }

      // the body that moves, offset so it reads as a presence behind the form
      const figScale = Math.min(width, 560) / 560;
      drawFigure(t, width * 0.55, height * 0.86, Math.max(figScale, 0.55) * 1.1);

      if (!reduceMotion) raf = requestAnimationFrame(frame);
    }

    if (reduceMotion) {
      frame(start + 1000);
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="hero-canvas-wrap" aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
