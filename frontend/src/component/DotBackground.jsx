import React, { useEffect, useRef } from 'react';

/**
 * 3D Simplex Noise Implementation (Self-contained, fast, zero-dependency)
 * Based on Stefan Gustavson's classic algorithm.
 */
const F3 = 1.0 / 3.0;
const G3 = 1.0 / 6.0;

const p = new Uint8Array(256);
for (let i = 0; i < 256; i++) p[i] = i;
let seed = 42;
for (let i = 255; i > 0; i--) {
  seed = (seed * 16807) % 2147483647;
  const j = seed % (i + 1);
  const temp = p[i];
  p[i] = p[j];
  p[j] = temp;
}

const perm = new Uint8Array(512);
const permMod12 = new Uint8Array(512);
const grad3 = [
  [1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0],
  [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1],
  [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]
];

for (let i = 0; i < 512; i++) {
  perm[i] = p[i & 255];
  permMod12[i] = perm[i] % 12;
}

function simplex3D(xin, yin, zin) {
  let n0, n1, n2, n3;
  const s = (xin + yin + zin) * F3;
  const i = Math.floor(xin + s);
  const j = Math.floor(yin + s);
  const k = Math.floor(zin + s);
  const t = (i + j + k) * G3;
  const X0 = i - t;
  const Y0 = j - t;
  const Z0 = k - t;
  const x0 = xin - X0;
  const y0 = yin - Y0;
  const z0 = zin - Z0;

  let i1, j1, k1;
  let i2, j2, k2;
  if (x0 >= y0) {
    if (y0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    } else if (x0 >= z0) {
      i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1;
    } else {
      i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1;
    }
  } else {
    if (y0 < z0) {
      i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1;
    } else if (x0 < z0) {
      i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1;
    } else {
      i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0;
    }
  }

  const x1 = x0 - i1 + G3;
  const y1 = y0 - j1 + G3;
  const z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2.0 * G3;
  const y2 = y0 - j2 + 2.0 * G3;
  const z2 = z0 - k2 + 2.0 * G3;
  const x3 = x0 - 1.0 + 3.0 * G3;
  const y3 = y0 - 1.0 + 3.0 * G3;
  const z3 = z0 - 1.0 + 3.0 * G3;

  const ii = i & 255;
  const jj = j & 255;
  const kk = k & 255;

  let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
  if (t0 < 0) n0 = 0.0;
  else {
    t0 *= t0;
    const gi0 = permMod12[ii + perm[jj + perm[kk]]];
    const g0 = grad3[gi0];
    n0 = t0 * t0 * (g0[0] * x0 + g0[1] * y0 + g0[2] * z0);
  }

  let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
  if (t1 < 0) n1 = 0.0;
  else {
    t1 *= t1;
    const gi1 = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]];
    const g1 = grad3[gi1];
    n1 = t1 * t1 * (g1[0] * x1 + g1[1] * y1 + g1[2] * z1);
  }

  let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
  if (t2 < 0) n2 = 0.0;
  else {
    t2 *= t2;
    const gi2 = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]];
    const g2 = grad3[gi2];
    n2 = t2 * t2 * (g2[0] * x2 + g2[1] * y2 + g2[2] * z2);
  }

  let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
  if (t3 < 0) n3 = 0.0;
  else {
    t3 *= t3;
    const gi3 = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]];
    const g3 = grad3[gi3];
    n3 = t3 * t3 * (g3[0] * x3 + g3[1] * y3 + g3[2] * z3);
  }

  return 32.0 * (n0 + n1 + n2 + n3);
}

/**
 * Precomputed 256-entry gradient lookup table (LUT)
 * Dark to light:
 * 0.00: #05030f (near-black)
 * 0.25: #2a1fd6 (deep indigo)
 * 0.50: #6c63ff (electric periwinkle)
 * 0.75: #b9b3f5 (lavender)
 * 1.00: #f5d9ff (pale pink-white)
 */
const GRADIENT_STOPS = [
  { pos: 0.0, r: 5, g: 3, b: 15 },
  { pos: 0.25, r: 42, g: 31, b: 214 },
  { pos: 0.50, r: 108, g: 99, b: 255 },
  { pos: 0.75, r: 185, g: 179, b: 245 },
  { pos: 1.0, r: 245, g: 217, b: 255 }
];

const COLOR_LUT = new Array(256);
for (let i = 0; i < 256; i++) {
  const t = i / 255;
  let s = 0;
  while (s < GRADIENT_STOPS.length - 2 && t > GRADIENT_STOPS[s + 1].pos) {
    s++;
  }
  const stopA = GRADIENT_STOPS[s];
  const stopB = GRADIENT_STOPS[s + 1];
  const factor = (t - stopA.pos) / (stopB.pos - stopA.pos);
  const r = Math.round(stopA.r + (stopB.r - stopA.r) * factor);
  const g = Math.round(stopA.g + (stopB.g - stopA.g) * factor);
  const b = Math.round(stopA.b + (stopB.b - stopA.b) * factor);
  COLOR_LUT[i] = `rgb(${r},${g},${b})`;
}

const TWO_PI = Math.PI * 2;
const LOOP_DURATION = 9.0; // Seconds for seamless loop

export default function DotBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId = null;
    let resizeTimeout = null;
    let lastFrameTime = performance.now();
    let startTime = performance.now();
    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    // Check prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    let width = 0;
    let height = 0;
    let pitch = 20;
    let baseRadius = 8;
    let dots = [];

    // Rebuild grid & adjust canvas dimensions
    const setupGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const isMobile = width < 600;
      pitch = isMobile ? 14 : 20;
      baseRadius = pitch * 0.40;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // Precalculate dot grid positions and fade parameters
      dots = [];
      const cols = Math.ceil(width / pitch) + 1;
      const rows = Math.ceil(height / pitch) + 1;

      for (let r = 0; r < rows; r++) {
        const y = r * pitch + pitch * 0.5;
        for (let c = 0; c < cols; c++) {
          const x = c * pitch + pitch * 0.5;
          const nx = x / width;
          // Right third leans toward calm, flat grayish-lavender
          const fade = nx < 0.6 ? 0 : Math.min(1, (nx - 0.6) / 0.35);
          dots.push({ x, y, nx, fade });
        }
      }
    };

    // Render single frame given timestamp
    const draw = (tSeconds) => {
      // Loop phase parameter tau in [0, 2*PI]
      const tau = ((tSeconds % LOOP_DURATION) / LOOP_DURATION) * TWO_PI;
      const sinTau = Math.sin(tau);
      const cosTau = Math.cos(tau);

      // Fill background
      ctx.fillStyle = '#05030f';
      ctx.fillRect(0, 0, width, height);

      // Octave 1: Large-scale broad color regions drifting diagonally
      const driftX1 = 1.4 * cosTau + 1.2 * sinTau;
      const driftY1 = 1.4 * cosTau - 1.2 * sinTau;
      const driftZ1 = 0.9 * sinTau;

      // Octave 2: Small-scale speckled pixel-art clusters
      const driftX2 = 2.5 * cosTau;
      const driftY2 = 2.5 * sinTau;
      const driftZ2 = 1.5 * cosTau;

      const numDots = dots.length;
      for (let i = 0; i < numDots; i++) {
        const dot = dots[i];

        // Octave 1
        const n1 = simplex3D(
          dot.x * 0.0014 + driftX1,
          dot.y * 0.0014 + driftY1,
          (dot.x + dot.y) * 0.0006 + driftZ1
        );

        // Octave 2
        const n2 = simplex3D(
          dot.x * 0.008 + driftX2,
          dot.y * 0.008 + driftY2,
          (dot.x + dot.y) * 0.003 + driftZ2
        );

        // Combined raw noise roughly in [-1, 1]
        const raw = 0.72 * n1 + 0.28 * n2;
        let norm = (raw + 1.0) * 0.5;
        if (norm < 0) norm = 0;
        else if (norm > 1) norm = 1;

        // Contrast enhancement on left/center
        // S-curve smoothstep
        norm = norm * norm * (3 - 2 * norm);

        // Right third fade towards calm grayish-lavender (LUT index ~190, value ~0.75)
        const targetVal = 0.75;
        const val = dot.fade > 0 ? norm * (1 - dot.fade * 0.88) + targetVal * (dot.fade * 0.88) : norm;

        // Color lookup (no per-frame string allocation)
        const colorIdx = (val * 255) | 0;
        ctx.fillStyle = COLOR_LUT[colorIdx < 0 ? 0 : colorIdx > 255 ? 255 : colorIdx];

        // Radius slightly varies with noise (darker = smaller, brighter = fuller)
        const radius = baseRadius * (0.68 + 0.32 * val);

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, TWO_PI);
        ctx.fill();
      }
    };

    // Animation loop capped at 30 FPS
    const tick = (now) => {
      animationFrameId = requestAnimationFrame(tick);
      const delta = now - lastFrameTime;
      if (delta < FRAME_INTERVAL) return;

      lastFrameTime = now - (delta % FRAME_INTERVAL);
      const elapsedSeconds = (now - startTime) / 1000;
      draw(elapsedSeconds);
    };

    // Setup initial grid
    setupGrid();

    if (prefersReducedMotion) {
      draw(0);
    } else {
      animationFrameId = requestAnimationFrame(tick);
    }

    // Debounced window resize
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setupGrid();
        const elapsedSeconds = (performance.now() - startTime) / 1000;
        draw(prefersReducedMotion ? 0 : elapsedSeconds);
      }, 150);
    };
    window.addEventListener('resize', handleResize);

    // Pause on document.hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      } else {
        if (!animationFrameId && !prefersReducedMotion) {
          lastFrameTime = performance.now();
          animationFrameId = requestAnimationFrame(tick);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle motion preference changes dynamically
    const handleMotionChange = (e) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
        draw(0);
      } else {
        if (!animationFrameId) {
          lastFrameTime = performance.now();
          animationFrameId = requestAnimationFrame(tick);
        }
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Cleanup on unmount
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  return (
    <div className="dot-bg-container" aria-hidden="true">
      <canvas ref={canvasRef} className="dot-bg-canvas" />
      <div className="dot-bg-overlay" />
    </div>
  );
}
