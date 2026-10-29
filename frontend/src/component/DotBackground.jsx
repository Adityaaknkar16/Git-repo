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

// Color stops for Cyber Dark Theme
const DARK_GRADIENT_STOPS = [
  { pos: 0.0, r: 5, g: 3, b: 15 },
  { pos: 0.25, r: 42, g: 31, b: 214 },
  { pos: 0.50, r: 108, g: 99, b: 255 },
  { pos: 0.75, r: 185, g: 179, b: 245 },
  { pos: 1.0, r: 245, g: 217, b: 255 }
];

// Color stops for Black & White Neo-Brutalist Theme
const BW_GRADIENT_STOPS = [
  { pos: 0.0, r: 255, g: 255, b: 255 },
  { pos: 0.25, r: 235, g: 235, b: 235 },
  { pos: 0.50, r: 200, g: 200, b: 200 },
  { pos: 0.75, r: 140, g: 140, b: 140 },
  { pos: 1.0, r: 40, g: 40, b: 40 }
];

function buildLUT(stops) {
  const lut = new Array(256);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let s = 0;
    while (s < stops.length - 2 && t > stops[s + 1].pos) {
      s++;
    }
    const stopA = stops[s];
    const stopB = stops[s + 1];
    const factor = (t - stopA.pos) / (stopB.pos - stopA.pos);
    const r = Math.round(stopA.r + (stopB.r - stopA.r) * factor);
    const g = Math.round(stopA.g + (stopB.g - stopA.g) * factor);
    const b = Math.round(stopA.b + (stopB.b - stopA.b) * factor);
    lut[i] = `rgb(${r},${g},${b})`;
  }
  return lut;
}

const DARK_COLOR_LUT = buildLUT(DARK_GRADIENT_STOPS);
const BW_COLOR_LUT = buildLUT(BW_GRADIENT_STOPS);

const TWO_PI = Math.PI * 2;
const LOOP_DURATION = 9.0;

export default function DotBackground({ theme = 'bw' }) {
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

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    let width = 0;
    let height = 0;
    let pitch = 20;
    let baseRadius = 8;
    let dots = [];

    const isBW = theme === 'bw';
    const activeLUT = isBW ? BW_COLOR_LUT : DARK_COLOR_LUT;

    const setupGrid = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const isMobile = width < 600;
      pitch = isMobile ? 14 : 20;
      baseRadius = pitch * 0.38;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      dots = [];
      const cols = Math.ceil(width / pitch) + 1;
      const rows = Math.ceil(height / pitch) + 1;

      for (let r = 0; r < rows; r++) {
        const y = r * pitch + pitch * 0.5;
        for (let c = 0; c < cols; c++) {
          const x = c * pitch + pitch * 0.5;
          const nx = x / width;
          const fade = nx < 0.6 ? 0 : Math.min(1, (nx - 0.6) / 0.35);
          dots.push({ x, y, nx, fade });
        }
      }
    };

    const draw = (tSeconds) => {
      const tau = ((tSeconds % LOOP_DURATION) / LOOP_DURATION) * TWO_PI;
      const sinTau = Math.sin(tau);
      const cosTau = Math.cos(tau);

      // Fill background
      ctx.fillStyle = isBW ? '#ffffff' : '#05030f';
      ctx.fillRect(0, 0, width, height);

      const driftX1 = 1.4 * cosTau + 1.2 * sinTau;
      const driftY1 = 1.4 * cosTau - 1.2 * sinTau;
      const driftZ1 = 0.9 * sinTau;

      const driftX2 = 2.5 * cosTau;
      const driftY2 = 2.5 * sinTau;
      const driftZ2 = 1.5 * cosTau;

      const numDots = dots.length;
      for (let i = 0; i < numDots; i++) {
        const dot = dots[i];

        const n1 = simplex3D(
          dot.x * 0.0014 + driftX1,
          dot.y * 0.0014 + driftY1,
          (dot.x + dot.y) * 0.0006 + driftZ1
        );

        const n2 = simplex3D(
          dot.x * 0.005 + driftX2,
          dot.y * 0.005 + driftY2,
          dot.y * 0.003 + driftZ2
        );

        let combined = 0.78 * n1 + 0.22 * n2;
        let v = Math.min(1.0, Math.max(0.0, (combined + 1.0) * 0.5));

        if (dot.fade > 0) {
          const targetV = isBW ? 0.3 : 0.65;
          v = v * (1.0 - dot.fade * 0.65) + targetV * (dot.fade * 0.65);
        }

        const lutIdx = Math.min(255, Math.max(0, Math.floor(v * 255)));
        const radius = baseRadius * (0.65 + 0.5 * v);

        ctx.fillStyle = activeLUT[lutIdx];
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, radius, 0, TWO_PI);
        ctx.fill();
      }
    };

    setupGrid();

    if (prefersReducedMotion) {
      draw(0);
      return;
    }

    const tick = (now) => {
      const elapsed = now - lastFrameTime;
      if (elapsed >= FRAME_INTERVAL) {
        lastFrameTime = now - (elapsed % FRAME_INTERVAL);
        const tSeconds = (now - startTime) * 0.001;
        draw(tSeconds);
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setupGrid();
        if (prefersReducedMotion) {
          draw(0);
        }
      }, 100);
    };
    window.addEventListener('resize', handleResize, { passive: true });

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

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      clearTimeout(resizeTimeout);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [theme]);

  return (
    <div className={`dot-bg-container ${theme}`} aria-hidden="true">
      <canvas ref={canvasRef} className="dot-bg-canvas" />
      <div className={`dot-bg-overlay ${theme}`} />
    </div>
  );
}
