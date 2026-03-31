"use client";

import { useRef, useEffect, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

interface CloudPoint {
  x3d: number;
  y3d: number;
  z3d: number;
  radius: number;
  baseAlpha: number;
  color: string;
  // animation
  phase: number;
  floatSpeed: number;
  floatAmpY: number;
  originY: number;
}

interface Connection {
  a: number; // index into points
  b: number;
  alpha: number;
}

// ── Constants ────────────────────────────────────────────────────────────────

const COLORS = [
  "148,163,184",
  "100,116,139",
  "71,85,105",
  "129,140,160",
  "165,180,200",
  "120,140,170",
];

const GRID_SPACING = 55;
const PERSPECTIVE = 700;
const CAMERA_HEIGHT = 240;
const CAMERA_TILT = 0.52;
const MOUSE_RADIUS = 200;
const CONNECTION_DIST = 120; // 3D distance for auto-connecting points
const POINT_COUNT_BASE = 180;

// ── Helpers ──────────────────────────────────────────────────────────────────

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function dist2d(ax: number, ay: number, bx: number, by: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function dist3d(ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
}

function project(
  x3d: number,
  y3d: number,
  z3d: number,
  cx: number,
  cy: number,
): { x: number; y: number; scale: number; depth: number } | null {
  const dx = x3d - cx;
  const dy = y3d - CAMERA_HEIGHT;
  const dz = z3d;

  const cosT = Math.cos(CAMERA_TILT);
  const sinT = Math.sin(CAMERA_TILT);
  const ry = dy * cosT - dz * sinT;
  const rz = dy * sinT + dz * cosT;

  const depth = rz + PERSPECTIVE;
  if (depth < 40) return null;

  const scale = PERSPECTIVE / depth;
  return { x: cx + dx * scale, y: cy + ry * scale, scale, depth };
}

// ── Scene generation ─────────────────────────────────────────────────────────

function generateScene(w: number, h: number) {
  const cx = w / 2;
  const extent = Math.max(w, h) * 0.7;
  const half = extent / 2;

  // -- Point cloud: scattered data points on and above the grid plane --
  const points: CloudPoint[] = [];
  const count = POINT_COUNT_BASE + Math.floor((w * h) / 60000);

  for (let i = 0; i < count; i++) {
    const x = cx + rand(-half, half);
    const z = rand(-half * 0.65, half * 0.45);
    // Most points sit near the grid (y~0), some float above
    const isElevated = Math.random() < 0.35;
    const y = isElevated ? -rand(15, 130) : -rand(0, 12);
    const distFromCenter = dist2d(x, z, cx, 0);
    const centralness = 1 - Math.min(distFromCenter / half, 1);

    points.push({
      x3d: x,
      y3d: y,
      z3d: z,
      radius: rand(1, 3.5) * (0.7 + centralness * 0.6),
      baseAlpha: rand(0.03, 0.09) * (0.6 + centralness * 0.6),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      phase: rand(0, Math.PI * 2),
      floatSpeed: rand(0.005, 0.02),
      floatAmpY: isElevated ? rand(3, 12) : rand(0.5, 3),
      originY: y,
    });
  }

  // -- Connections: link nearby points --
  const connections: Connection[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = dist3d(
        points[i].x3d, points[i].originY, points[i].z3d,
        points[j].x3d, points[j].originY, points[j].z3d,
      );
      if (d < CONNECTION_DIST && Math.random() < 0.3) {
        connections.push({
          a: i,
          b: j,
          alpha: Math.max(0.01, 0.05 * (1 - d / CONNECTION_DIST)),
        });
      }
    }
  }

  return { points, connections, half, cx };
}

type Scene = ReturnType<typeof generateScene>;

// ── Component ────────────────────────────────────────────────────────────────

export function SubwayMapBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const sceneRef = useRef<Scene | null>(null);
  const rafRef = useRef<number>(0);
  const sizeRef = useRef({ w: 0, h: 0 });
  const timeRef = useRef(0);


  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      sizeRef.current = { w, h };
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sceneRef.current = generateScene(w, h);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    if (prefersReduced) {
      drawStatic(ctx, sceneRef.current!, sizeRef.current.w, sizeRef.current.h);
      return () => ro.disconnect();
    }

    // Projected point cache (reused each frame)
    let projCache: ({ x: number; y: number; scale: number; depth: number } | null)[] = [];

    const animate = () => {
      const scene = sceneRef.current;
      if (!scene) { rafRef.current = requestAnimationFrame(animate); return; }

      const { w, h } = sizeRef.current;
      const mx = -1000;
      const my = -1000;
      const cx = w / 2;
      const cy = h / 2;
      timeRef.current += 1;
      const t = timeRef.current;

      ctx.clearRect(0, 0, w, h);

      // ── 1. Grid plane ───────────────────────────────────────────
      const half = scene.half;

      for (let gx = -half; gx <= half; gx += GRID_SPACING) {
        const p1 = project(cx + gx, 0, -half * 0.65, cx, cy);
        const p2 = project(cx + gx, 0, half * 0.45, cx, cy);
        if (p1 && p2) {
          const midD = dist2d((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, mx, my);
          const hover = Math.max(0, 1 - midD / MOUSE_RADIUS);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(100,116,139,${0.015 + hover * 0.04})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      for (let gz = -half * 0.65; gz <= half * 0.45; gz += GRID_SPACING) {
        const p1 = project(cx - half, 0, gz, cx, cy);
        const p2 = project(cx + half, 0, gz, cx, cy);
        if (p1 && p2) {
          const midD = dist2d((p1.x + p2.x) / 2, (p1.y + p2.y) / 2, mx, my);
          const hover = Math.max(0, 1 - midD / MOUSE_RADIUS);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(100,116,139,${0.015 + hover * 0.04})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      // ── 2. Project all points (with float animation) ────────────
      projCache.length = 0;
      for (let i = 0; i < scene.points.length; i++) {
        const pt = scene.points[i];
        // Gentle float
        pt.y3d = pt.originY + Math.sin(t * pt.floatSpeed + pt.phase) * pt.floatAmpY;
        const p = project(pt.x3d, pt.y3d, pt.z3d, cx, cy);
        projCache.push(p);
      }

      // ── 3. Draw connections (lines between nearby points) ───────
      for (const conn of scene.connections) {
        const pa = projCache[conn.a];
        const pb = projCache[conn.b];
        if (!pa || !pb) continue;

        // Mouse proximity boost on midpoint
        const midX = (pa.x + pb.x) / 2;
        const midY = (pa.y + pb.y) / 2;
        const d = dist2d(midX, midY, mx, my);
        const hover = Math.max(0, 1 - d / MOUSE_RADIUS);
        const alpha = conn.alpha + hover * 0.05;

        ctx.beginPath();
        ctx.moveTo(pa.x, pa.y);
        ctx.lineTo(pb.x, pb.y);
        ctx.strokeStyle = `rgba(100,116,139,${alpha})`;
        ctx.lineWidth = 0.4 + hover * 0.4;
        ctx.stroke();
      }

      // ── 4. Draw point cloud (sorted by depth, back to front) ───
      const sortedIndices = Array.from({ length: scene.points.length }, (_, i) => i)
        .filter((i) => projCache[i] != null)
        .sort((a, b) => projCache[b]!.depth - projCache[a]!.depth);

      for (const i of sortedIndices) {
        const pt = scene.points[i];
        const p = projCache[i]!;

        const d = dist2d(p.x, p.y, mx, my);
        const hover = Math.max(0, 1 - d / MOUSE_RADIUS);

        const r = Math.max(0.5, pt.radius * p.scale) + hover * 1.5;
        const alpha = pt.baseAlpha + hover * 0.12;

        // Outer glow (faint halo)
        if (r > 1.2) {
          const glowR = r * 2.5 + hover * 3;
          const grd = ctx.createRadialGradient(p.x, p.y, r * 0.3, p.x, p.y, glowR);
          grd.addColorStop(0, `rgba(${pt.color},${alpha * 0.15})`);
          grd.addColorStop(1, `rgba(${pt.color},0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = grd;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pt.color},${alpha})`;
        ctx.fill();

        // Bright center pip for larger points
        if (r > 1.8) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.5, r * 0.35), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${pt.color},${Math.min(1, alpha * 2.5)})`;
          ctx.fill();
        }
      }

      // ── 5. Vertical drop-lines for elevated points ──────────────
      for (const i of sortedIndices) {
        const pt = scene.points[i];
        if (pt.originY > -12) continue; // skip ground-level points

        const p = projCache[i]!;
        const groundP = project(pt.x3d, 0, pt.z3d, cx, cy);
        if (!groundP) continue;

        const d = dist2d(p.x, p.y, mx, my);
        const hover = Math.max(0, 1 - d / MOUSE_RADIUS);
        const alpha = 0.02 + hover * 0.04;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(groundP.x, groundP.y);
        ctx.strokeStyle = `rgba(100,116,139,${alpha})`;
        ctx.lineWidth = 0.3 + hover * 0.3;
        ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Tiny ground dot
        ctx.beginPath();
        ctx.arc(groundP.x, groundP.y, Math.max(0.5, 1 * groundP.scale), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,116,139,${0.04 + hover * 0.06})`;
        ctx.fill();
      }

      // ── 6. Depth fog ────────────────────────────────────────────
      const fogTop = ctx.createLinearGradient(0, 0, 0, h * 0.2);
      fogTop.addColorStop(0, "rgba(255,255,255,0.4)");
      fogTop.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = fogTop;
      ctx.fillRect(0, 0, w, h * 0.2);

      const fogBottom = ctx.createLinearGradient(0, h * 0.85, 0, h);
      fogBottom.addColorStop(0, "rgba(255,255,255,0)");
      fogBottom.addColorStop(1, "rgba(255,255,255,0.25)");
      ctx.fillStyle = fogBottom;
      ctx.fillRect(0, h * 0.85, w, h * 0.15);

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0, opacity: 0.3 }}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

// ── Static fallback ──────────────────────────────────────────────────────────

function drawStatic(ctx: CanvasRenderingContext2D, scene: Scene, w: number, h: number) {
  const cx = w / 2;
  const cy = h / 2;
  const half = scene.half;

  // Grid
  for (let gx = -half; gx <= half; gx += GRID_SPACING) {
    const p1 = project(cx + gx, 0, -half * 0.65, cx, cy);
    const p2 = project(cx + gx, 0, half * 0.45, cx, cy);
    if (p1 && p2) {
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = "rgba(100,116,139,0.03)"; ctx.lineWidth = 0.5; ctx.stroke();
    }
  }
  for (let gz = -half * 0.65; gz <= half * 0.45; gz += GRID_SPACING) {
    const p1 = project(cx - half, 0, gz, cx, cy);
    const p2 = project(cx + half, 0, gz, cx, cy);
    if (p1 && p2) {
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = "rgba(100,116,139,0.03)"; ctx.lineWidth = 0.5; ctx.stroke();
    }
  }

  // Connections
  for (const conn of scene.connections) {
    const pa = project(scene.points[conn.a].x3d, scene.points[conn.a].originY, scene.points[conn.a].z3d, cx, cy);
    const pb = project(scene.points[conn.b].x3d, scene.points[conn.b].originY, scene.points[conn.b].z3d, cx, cy);
    if (pa && pb) {
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
      ctx.strokeStyle = `rgba(100,116,139,${conn.alpha})`; ctx.lineWidth = 0.4; ctx.stroke();
    }
  }

  // Points
  for (const pt of scene.points) {
    const p = project(pt.x3d, pt.originY, pt.z3d, cx, cy);
    if (!p) continue;
    const r = Math.max(0.5, pt.radius * p.scale);
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${pt.color},${pt.baseAlpha})`; ctx.fill();
  }
}
