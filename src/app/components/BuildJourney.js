'use client';

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { RoundedBox, useTexture } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '../styles_css/BuildJourney.module.css';

// ---------------------------------------------------------------------------
// "Watch it get built" — a scroll-driven 3D story. The section is 520vh tall;
// a sticky full-screen canvas plays a five-chapter film scrubbed by scroll:
// energy-star idea → artboard blueprint assembly → a scan-line renders the
// design → the page SHREDS into a particle stream that flies through a plexus
// network tunnel → the particles reassemble on a monitor in a desk mockup
// scene. One progress value drives it all. Everything stays inside the site's
// palette: deep navy, indigo, periwinkle, warm white.
// ---------------------------------------------------------------------------

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const ease = (u) => u * u * (3 - 2 * u);
// 0 before a, eased 0→1 across [a, b], 1 after b.
const ramp = (p, a, b) => ease(clamp01((p - a) / (b - a)));
// Overshoots ~8% past 1 then settles — gives assembling panels a lively snap.
const backOut = (x) => {
  const c1 = 1.15;
  const u = x - 1;
  return 1 + (c1 + 1) * u * u * u + c1 * u * u;
};
// Cubic Bézier on one axis — the particle flight paths.
const bez = (a, b, c, d, t) => {
  const it = 1 - t;
  return it * it * it * a + 3 * it * it * t * b + 3 * it * t * t * c + t * t * t * d;
};

// Deterministic RNG so generated layouts match across mounts.
function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleVec3(keys, t, out) {
  if (t <= keys[0][0]) return out.copy(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [ta, va] = keys[i - 1];
      const [tb, vb] = keys[i];
      return out.lerpVectors(va, vb, ease((t - ta) / (tb - ta)));
    }
  }
  return out.copy(keys[keys.length - 1][1]);
}

function sampleNum(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [ta, va] = keys[i - 1];
      const [tb, vb] = keys[i];
      return va + (vb - va) * ease((t - ta) / (tb - ta));
    }
  }
  return keys[keys.length - 1][1];
}

function sampleColor(keys, t, out) {
  if (t <= keys[0][0]) return out.copy(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [ta, ca] = keys[i - 1];
      const [tb, cb] = keys[i];
      return out.lerpColors(ca, cb, ease((t - ta) / (tb - ta)));
    }
  }
  return out.copy(keys[keys.length - 1][1]);
}

const v3 = (x, y, z) => new THREE.Vector3(x, y, z);

// Camera flight path and where it looks, keyed by scroll progress. The
// design-chapter moves are gentle three-quarter arcs; after the shred the
// camera follows the particle stream down the tunnel to the desk scene.
const CAM_POS = [
  [0.0, v3(0, 0.3, 7.5)],
  [0.14, v3(0.6, 0.45, 6.2)],
  [0.24, v3(2.8, 0.9, 4.4)],
  [0.34, v3(-2.6, -0.3, 4.4)],
  [0.44, v3(-1.4, 0.35, 5.0)],
  [0.56, v3(0, 0.15, 5.4)],
  [0.66, v3(0, 0.1, 2.2)],
  [0.74, v3(0, 0.1, -4.5)],
  [0.86, v3(0, 0.1, -20.5)],
  [0.93, v3(0, 0.55, -23.4)],
  [1.0, v3(0, 0.35, -22.6)],
];

const CAM_LOOK = [
  [0.0, v3(0, 0.1, 0)],
  [0.6, v3(0, 0.05, 0)],
  [0.68, v3(0, 0.1, -3)],
  [0.76, v3(0, 0.1, -10)],
  [0.86, v3(0, 0.25, -27)],
  [1.0, v3(0, 0.1, -30)],
];

const CAM_FOV = [
  [0.6, 45],
  [0.75, 62],
  [0.88, 45],
];

const CAM_ROLL = [
  [0.64, 0],
  [0.72, 0.13],
  [0.82, -0.09],
  [0.9, 0],
];

const BG_COLORS = [
  [0.0, new THREE.Color('#04050c')],
  [0.3, new THREE.Color('#0a0e28')],
  [0.52, new THREE.Color('#0a0d1f')],
  [0.72, new THREE.Color('#04060f')],
  [1.0, new THREE.Color('#100f1d')],
];

// The webpage the journey assembles: a desktop hero laid out from rounded
// panels. Skeleton bars stand in for typography — sample artwork from
// /public/grid supplies the imagery. build = progress where the panel rises
// into place; materialization is driven by the scan-line sweep.
const PANELS = [
  { x: 0, y: 1.62, w: 5.7, h: 0.3, color: '#1a2040', build: 0.16 },
  { x: -1.62, y: 0.82, w: 2.4, h: 0.26, color: '#e8ebff', build: 0.18 },
  { x: -1.78, y: 0.46, w: 2.05, h: 0.26, color: '#e8ebff', build: 0.2 },
  { x: -1.95, y: 0.12, w: 1.7, h: 0.16, color: '#8f9ac4', build: 0.22 },
  { x: -2.32, y: -0.42, w: 0.95, h: 0.34, color: '#6c7bff', emissive: '#4d5bff', build: 0.24 },
  { x: 1.5, y: 0.32, w: 2.6, h: 1.9, tex: 0, build: 0.21 },
  { x: -1.95, y: -1.28, w: 1.7, h: 1.0, tex: 1, build: 0.26 },
  { x: 0, y: -1.28, w: 1.7, h: 1.0, tex: 2, build: 0.28 },
  { x: 1.95, y: -1.28, w: 1.7, h: 1.0, tex: 3, build: 0.3 },
];

// One calm, uniform entry motion for every panel — rise up and settle.
const PANEL_ENTRY = { y: 0.42, z: 0.3 };

// The shred wave sweeps left→right across the page in world space. Every
// dissolve cell (see buildDissolveData) gets a departure scroll-progress
// from where it falls in that sweep, and that exact value drives two things
// in lockstep: the instant a hole opens in the panel's alpha mask, and the
// instant that same cell's particle takes flight — so the surface is never
// separately fading while dust floats nearby, it is visibly being carried
// away by the dust leaving it.
const SHRED_START = 0.58;
const SHRED_END = 0.74;
const SHRED_WORLD_MIN = -3.2;
const SHRED_WORLD_MAX = 3.2;
const SHRED_JITTER = 0.55; // world units of ragged, non-uniform edge spread
const FLIGHT_DURATION = 0.17; // scroll-progress span of one particle's flight

// The blast that masks the cut from the tunnel's end into the desk scene:
// a screen-glued shockwave + whiteout, peaking right as the tunnel finishes
// fading (0.92) so the room seems to detonate into view.
const BLAST_PEAK = 0.905;
const BLAST_RISE = 0.02;
const BLAST_FALL = 0.055;

// Alignment guides that flick on during assembly, like rulers in a design
// tool, and vanish before the scan-line pass.
const GUIDES = [
  { axis: 'h', pos: 1.47, in: 0.2 },
  { axis: 'h', pos: -0.78, in: 0.24 },
  { axis: 'v', pos: -2.85, in: 0.22 },
  { axis: 'v', pos: 2.85, in: 0.26 },
  { axis: 'v', pos: 0.2, in: 0.28 },
];

const TEX_PATHS = ['/grid/tech.webp', '/grid/creative.webp', '/grid/product.webp', '/grid/design.webp'];

// Desk-mockup finale: room group origin sits at desk-top height; the shred
// particles land on the monitor screen, where the site reassembles at
// SCREEN_SCALE of its mid-journey size.
const ROOM_Y = -0.85;
const ROOM_Z = -30;
const SCREEN_SCALE = 0.42;
const SCREEN_CENTER = { x: 0, y: ROOM_Y + 1.32, z: ROOM_Z - 0.455 };

// Chapter 4: a plexus tunnel — rings of glowing nodes joined by hairline
// links, converging on a light at the far end.
const PLEXUS_RINGS = 34;
const PLEXUS_NODES = 26;
const TOKENS = [
  { text: '</>', color: '#e8ebff' },
  { text: '{ }', color: '#aab6ff' },
  { text: '=>', color: '#8fa4ff' },
  { text: '( )', color: '#aab6ff' },
  { text: 'const', color: '#8fa4ff' },
  { text: '<div>', color: '#e8ebff' },
  { text: 'css', color: '#6c7bff' },
  { text: 'api', color: '#aab6ff' },
];
const TOKEN_COUNT = 12;

// Erosion-mask resolution: fixed columns per panel, rows scaled to its
// aspect ratio — this grid is also exactly where the departing particles
// are drawn from, so every "hole" in a panel has a matching piece of dust.
const DISSOLVE_COLS = 24;

const CHAPTERS = [
  { kicker: '01 · Discover', title: 'Every great site starts with an idea.', in: [0.02, 0.06], out: [0.115, 0.15] },
  { kicker: '02 · Design', title: 'We give it structure.', in: [0.19, 0.24], out: [0.36, 0.41] },
  { kicker: '03 · Craft', title: 'Then a personality.', in: [0.46, 0.51], out: [0.56, 0.6] },
  { kicker: '04 · Engineer', title: 'Built to fly.', in: [0.7, 0.75], out: [0.82, 0.86] },
  { kicker: '05 · Launch', title: "Let's build yours.", cta: true, in: [0.955, 0.99], out: [2, 3] },
];

function makeTokenTexture(text, color) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  ctx.font = '600 110px Consolas, "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, 256, 132);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

// Soft round sprite so points render as glowing dots, not hard squares.
function makeDotTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
  grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.85)');
  grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(canvas);
}

// Fine blueprint grid for the artboard, tiled via RepeatWrapping.
function makeGridTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const lines = (alpha, step) => {
    ctx.strokeStyle = `rgba(143, 164, 255, ${alpha})`;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 256; i += step) {
      ctx.beginPath();
      ctx.moveTo(i + 0.5, 0);
      ctx.lineTo(i + 0.5, 256);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i + 0.5);
      ctx.lineTo(256, i + 0.5);
      ctx.stroke();
    }
  };
  lines(0.16, 32);
  lines(0.3, 128);
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 3.3);
  return tex;
}

function makeGlowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(140, 158, 255, 0.5)');
  grad.addColorStop(0.4, 'rgba(108, 123, 255, 0.16)');
  grad.addColorStop(1, 'rgba(108, 123, 255, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Reads a texture's image down to a small pixel grid so shred particles can
// carry the artwork's real colors through the tunnel.
function samplePixels(texture, w, h) {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(texture.image, 0, 0, w, h);
    return ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }
}

// Builds, once, the data that makes each panel visibly shred into the exact
// particles that fly away. For every panel this samples a small grid of
// cells (real pixel colors for artwork panels, tinted color for solid ones)
// and gives each cell a departure scroll-progress from where it falls in
// the page-wide left→right wipe, with a jittered offset so the boundary
// reads as torn rather than a clean vertical cut. Each panel also gets a
// tiny canvas texture — its green channel doubles as an alphaMap — that
// PagePanels repaints per-cell as the wipe crosses it, so the same moment a
// cell's mask pixel goes transparent is the moment its particle departs.
function buildDissolveData(textures) {
  const rnd = mulberry32(64);
  const baseColor = new THREE.Color();

  return PANELS.map((spec) => {
    const cols = DISSOLVE_COLS;
    const rows = Math.max(3, Math.round(cols * (spec.h / spec.w)));
    const count = cols * rows;
    const px = spec.tex != null ? samplePixels(textures[spec.tex], cols, rows) : null;
    if (spec.tex == null) baseColor.set(spec.color);

    const localX = new Float32Array(count);
    const localY = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const pDepart = new Float32Array(count);
    let minP = Infinity;
    let maxP = -Infinity;

    for (let gy = 0; gy < rows; gy++) {
      for (let gx = 0; gx < cols; gx++) {
        const i = gy * cols + gx;
        const u = (gx + 0.5) / cols;
        const v = (gy + 0.5) / rows;
        const x = spec.x + (u - 0.5) * spec.w;
        localX[i] = x;
        localY[i] = spec.y + (0.5 - v) * spec.h;

        if (px) {
          const idx = i * 4;
          colors[i * 3] = px[idx] / 255;
          colors[i * 3 + 1] = px[idx + 1] / 255;
          colors[i * 3 + 2] = px[idx + 2] / 255;
        } else {
          const j = 0.82 + rnd() * 0.32;
          colors[i * 3] = Math.min(1, baseColor.r * j);
          colors[i * 3 + 1] = Math.min(1, baseColor.g * j);
          colors[i * 3 + 2] = Math.min(1, baseColor.b * j);
        }

        const frontX = x + (rnd() - 0.5) * SHRED_JITTER;
        const frac = clamp01((frontX - SHRED_WORLD_MIN) / (SHRED_WORLD_MAX - SHRED_WORLD_MIN));
        const dep = SHRED_START + frac * (SHRED_END - SHRED_START);
        pDepart[i] = dep;
        if (dep < minP) minP = dep;
        if (dep > maxP) maxP = dep;
      }
    }

    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(cols, rows);
    const buf = imgData.data;
    for (let i = 0; i < buf.length; i += 4) {
      buf[i] = 255;
      buf[i + 1] = 255;
      buf[i + 2] = 255;
      buf[i + 3] = 255;
    }
    ctx.putImageData(imgData, 0, 0);
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;

    return {
      spec,
      cols,
      rows,
      count,
      localX,
      localY,
      colors,
      pDepart,
      minP,
      maxP,
      ctx,
      imgData,
      buf,
      texture,
      paintedSolid: true,
      paintedGone: false,
    };
  });
}

// Repaints a panel's erosion mask for the current scroll position; returns
// the fraction of its cells already gone (0 = untouched, 1 = fully eroded).
// Static before/after the active window are painted once and then skipped.
function updateDissolveMask(d, p) {
  if (p <= d.minP) {
    if (!d.paintedSolid) {
      for (let i = 0; i < d.buf.length; i += 4) {
        d.buf[i] = 255;
        d.buf[i + 1] = 255;
        d.buf[i + 2] = 255;
        d.buf[i + 3] = 255;
      }
      d.ctx.putImageData(d.imgData, 0, 0);
      d.texture.needsUpdate = true;
      d.paintedSolid = true;
      d.paintedGone = false;
    }
    return 0;
  }
  if (p >= d.maxP) {
    if (!d.paintedGone) {
      for (let i = 0; i < d.buf.length; i += 4) {
        d.buf[i] = 0;
        d.buf[i + 1] = 0;
        d.buf[i + 2] = 0;
        d.buf[i + 3] = 255;
      }
      d.ctx.putImageData(d.imgData, 0, 0);
      d.texture.needsUpdate = true;
      d.paintedGone = true;
      d.paintedSolid = false;
    }
    return 1;
  }
  d.paintedSolid = false;
  d.paintedGone = false;
  let gone = 0;
  const { count, pDepart, buf } = d;
  for (let i = 0; i < count; i++) {
    const isGone = p >= pDepart[i];
    if (isGone) gone++;
    const v = isGone ? 0 : 255;
    const o = i * 4;
    buf[o] = v;
    buf[o + 1] = v;
    buf[o + 2] = v;
    buf[o + 3] = 255;
  }
  d.ctx.putImageData(d.imgData, 0, 0);
  d.texture.needsUpdate = true;
  return gone / count;
}

// --- 3D pieces --------------------------------------------------------------

// The idea as an energy star: bright core, slow geodesic shell, two tilted
// orbiting spark rings and a halo — layered enough to hold a close-up.
function Orb({ smoothRef }) {
  const groupRef = useRef();
  const coreRef = useRef();
  const shellRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring1MatRef = useRef();
  const ring2MatRef = useRef();
  const haloRef = useRef();
  const lightRef = useRef();

  const dotTexture = useMemo(makeDotTexture, []);
  useEffect(() => () => dotTexture.dispose(), [dotTexture]);
  const glowTexture = useMemo(makeGlowTexture, []);
  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  const ringPositions = useMemo(() => {
    const rnd = mulberry32(5);
    const make = (count, radius) => {
      const arr = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const r = radius + (rnd() - 0.5) * 0.08;
        arr[i * 3] = Math.cos(a) * r;
        arr[i * 3 + 1] = Math.sin(a) * r;
        arr[i * 3 + 2] = (rnd() - 0.5) * 0.06;
      }
      return arr;
    };
    return [make(90, 0.85), make(70, 1.15)];
  }, []);

  useFrame((state) => {
    const p = smoothRef.current;
    const t = state.clock.elapsedTime;
    const burst = ramp(p, 0.13, 0.21);
    const g = groupRef.current;
    g.visible = burst < 1;
    if (!g.visible) return;

    const fade = 1 - burst;
    // A short bright flash right as the star lets go — fully decayed before
    // the artboard fades in so the explosion never washes out the blueprint.
    const flash = ramp(p, 0.13, 0.15) * (1 - ramp(p, 0.15, 0.2));
    const pulse = 1 + Math.sin(t * 2.6) * 0.05;

    coreRef.current.scale.setScalar(0.34 * pulse * (1 + burst * 2));
    coreRef.current.material.opacity = fade;

    shellRef.current.scale.setScalar(0.6 * pulse * (1 + burst * 2));
    shellRef.current.rotation.y = t * 0.3;
    shellRef.current.rotation.x = t * 0.12;
    shellRef.current.material.opacity = 0.3 * fade;

    ring1Ref.current.rotation.z = t * 0.5;
    ring2Ref.current.rotation.z = -t * 0.35;
    ring1Ref.current.scale.setScalar(1 + burst * 1.6);
    ring2Ref.current.scale.setScalar(1 + burst * 1.2);
    ring1MatRef.current.opacity = 0.85 * fade;
    ring2MatRef.current.opacity = 0.6 * fade;

    haloRef.current.scale.setScalar(2.6 * (1 + burst * 2.2) + flash * 2.5);
    haloRef.current.material.opacity = Math.min(0.9, 0.5 * fade + flash);

    lightRef.current.intensity = 30 * fade + flash * 90;
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coreRef}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshStandardMaterial
          color="#eaf0ff"
          emissive="#aebfff"
          emissiveIntensity={3.2}
          roughness={0.2}
          transparent
        />
      </mesh>
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[1, 2]} />
        <meshBasicMaterial color="#8fa4ff" wireframe transparent opacity={0.3} />
      </mesh>
      <group ref={ring1Ref} rotation={[0.9, 0.2, 0]}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[ringPositions[0], 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={ring1MatRef}
            map={dotTexture}
            color="#cdd9ff"
            size={0.055}
            sizeAttenuation
            transparent
            opacity={0.85}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
      <group ref={ring2Ref} rotation={[-0.55, -0.35, 0]}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[ringPositions[1], 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={ring2MatRef}
            map={dotTexture}
            color="#8fa4ff"
            size={0.045}
            sizeAttenuation
            transparent
            opacity={0.6}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
      <mesh ref={haloRef} scale={2.6}>
        <planeGeometry />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </mesh>
      <pointLight ref={lightRef} color="#8fa4ff" intensity={30} distance={12} />
    </group>
  );
}

function Burst({ smoothRef }) {
  const pointsRef = useRef();
  const positions = useMemo(() => {
    const rnd = mulberry32(1234);
    const arr = new Float32Array(380 * 3);
    for (let i = 0; i < 380; i++) {
      // Random direction, biased toward the unit shell so the burst reads
      // as an expanding sphere rather than a filled cloud.
      const theta = rnd() * Math.PI * 2;
      const z = rnd() * 2 - 1;
      const r = 0.55 + Math.pow(rnd(), 0.6) * 0.45;
      const xy = Math.sqrt(1 - z * z);
      arr[i * 3] = Math.cos(theta) * xy * r;
      arr[i * 3 + 1] = z * r;
      arr[i * 3 + 2] = Math.sin(theta) * xy * r;
    }
    return arr;
  }, []);

  const dotTexture = useMemo(makeDotTexture, []);
  useEffect(() => () => dotTexture.dispose(), [dotTexture]);

  useFrame(() => {
    const p = smoothRef.current;
    const points = pointsRef.current;
    const vis = p > 0.135 && p < 0.38;
    points.visible = vis;
    if (!vis) return;
    const pr = ramp(p, 0.14, 0.34);
    points.scale.setScalar(0.3 + pr * 7.5);
    points.material.opacity = (1 - pr) * 0.85;
  });

  return (
    <points ref={pointsRef} visible={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={dotTexture}
        color="#9db2ff"
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  );
}

function Stars() {
  const pointsRef = useRef();
  const positions = useMemo(() => {
    const rnd = mulberry32(99);
    const arr = new Float32Array(520 * 3);
    for (let i = 0; i < 520; i++) {
      arr[i * 3] = (rnd() * 2 - 1) * 13;
      arr[i * 3 + 1] = (rnd() * 2 - 1) * 7;
      arr[i * 3 + 2] = 9 - rnd() * 47;
    }
    return arr;
  }, []);

  const dotTexture = useMemo(makeDotTexture, []);
  useEffect(() => () => dotTexture.dispose(), [dotTexture]);

  useFrame((state) => {
    pointsRef.current.rotation.z = state.clock.elapsedTime * 0.008;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        map={dotTexture}
        color="#93a1e8"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.45}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        fog={false}
      />
    </points>
  );
}

// Soft ambient halos: one behind the assembling page, one behind the desk
// scene, so both float in a pool of indigo light instead of flat darkness.
function Glows({ smoothRef }) {
  const pageGlowRef = useRef();
  const finaleGlowRef = useRef();
  const texture = useMemo(makeGlowTexture, []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    const p = smoothRef.current;
    const a = ramp(p, 0.02, 0.12) * (1 - ramp(p, 0.62, 0.7)) * 0.42;
    pageGlowRef.current.visible = a > 0.01;
    pageGlowRef.current.material.opacity = a;
    const b = ramp(p, 0.88, 0.97) * 0.4;
    finaleGlowRef.current.visible = b > 0.01;
    finaleGlowRef.current.material.opacity = b;
  });

  const material = (
    <meshBasicMaterial
      map={texture}
      transparent
      opacity={0}
      depthWrite={false}
      blending={THREE.AdditiveBlending}
      fog={false}
    />
  );

  return (
    <>
      <mesh ref={pageGlowRef} position={[0, 0, -1.8]} scale={11} visible={false}>
        <planeGeometry />
        {material}
      </mesh>
      <mesh ref={finaleGlowRef} position={[0, 0.5, -31.4]} scale={10} visible={false}>
        <planeGeometry />
        {material}
      </mesh>
    </>
  );
}

function PagePanels({ smoothRef, textures, dissolve }) {
  const pageRef = useRef();
  const groupRefs = useRef([]);
  const solidRefs = useRef([]);
  const outlineRefs = useRef([]);
  const shadowRefs = useRef([]);
  const guideMats = useRef([]);
  const backdropRef = useRef();
  const backdropLineRef = useRef();
  const gridRef = useRef();
  const scanRef = useRef();
  const scanGlowRef = useRef();

  // Clean rectangle outlines (EdgesGeometry drops the plane's internal
  // diagonal) — reads as a designer's blueprint, not a triangulated mesh.
  const outlineGeoms = useMemo(
    () => PANELS.map((s) => new THREE.EdgesGeometry(new THREE.PlaneGeometry(s.w, s.h))),
    []
  );
  const backdropOutline = useMemo(() => new THREE.EdgesGeometry(new THREE.PlaneGeometry(6.7, 4.4)), []);
  useEffect(
    () => () => {
      outlineGeoms.forEach((g) => g.dispose());
      backdropOutline.dispose();
    },
    [outlineGeoms, backdropOutline]
  );

  const gridTexture = useMemo(makeGridTexture, []);
  useEffect(() => () => gridTexture.dispose(), [gridTexture]);

  useFrame((state) => {
    const p = smoothRef.current;
    const t = state.clock.elapsedTime;

    const page = pageRef.current;
    // Everything here is dust by SHRED_END — skip the whole subtree after.
    page.visible = p < SHRED_END + 0.02;
    if (!page.visible) return;

    // Idle breathing so the page never feels frozen mid-scroll.
    page.position.y = Math.sin(t * 0.55) * 0.045;
    page.rotation.y = Math.sin(t * 0.28) * 0.018;
    page.rotation.x = Math.cos(t * 0.33) * 0.01;

    // The artboard appears first — a glass frame with a blueprint grid — so
    // panels assemble onto a stage instead of into a void. It fades out as
    // the shred begins.
    const board = ramp(p, 0.16, 0.22) * (1 - ramp(p, 0.56, 0.62));
    backdropRef.current.visible = backdropLineRef.current.visible = board > 0.01;
    backdropRef.current.material.opacity = board * 0.55;
    backdropLineRef.current.material.opacity = board * 0.5;
    const grid = ramp(p, 0.18, 0.24) * (1 - ramp(p, 0.5, 0.58));
    gridRef.current.visible = grid > 0.01;
    gridRef.current.material.opacity = grid * 0.4;

    for (let i = 0; i < GUIDES.length; i++) {
      const gm = guideMats.current[i];
      if (!gm) continue;
      gm.opacity = ramp(p, GUIDES[i].in, GUIDES[i].in + 0.05) * (1 - ramp(p, 0.4, 0.46)) * 0.7;
    }

    // The scan-line sweeps top→bottom across chapter 3; each panel
    // materializes the moment the line passes it.
    const sweep = ramp(p, 0.44, 0.56);
    const sweepY = 2.1 - sweep * 4.6;
    const scanOn = ramp(p, 0.44, 0.47) * (1 - ramp(p, 0.54, 0.58));
    const scan = scanRef.current;
    const scanGlow = scanGlowRef.current;
    scan.visible = scanGlow.visible = scanOn > 0.01;
    if (scan.visible) {
      scan.position.y = sweepY;
      scanGlow.position.y = sweepY - 0.12;
      scan.material.opacity = scanOn;
      scanGlow.material.opacity = scanOn * 0.22;
    }

    for (let i = 0; i < PANELS.length; i++) {
      const spec = PANELS[i];
      const g = groupRefs.current[i];
      if (!g) continue;
      // The panel's own surface erodes here — this repaints its alphaMap so
      // cells vanish from the mesh at the exact scroll position their
      // matching particle (built from the same cell grid) takes flight.
      const erosion = updateDissolveMask(dissolve[i], p);
      const bLin = clamp01((p - spec.build) / 0.11);
      g.visible = bLin > 0.001 && erosion < 1;
      if (!g.visible) continue;
      const top = spec.y + spec.h / 2;
      const m = ease(clamp01((top - sweepY) / (spec.h + 0.35)));
      const bb = backOut(bLin);
      g.position.set(spec.x, spec.y + PANEL_ENTRY.y * (1 - bb), PANEL_ENTRY.z * (1 - bb) + m * 0.03);
      g.scale.setScalar(0.94 + 0.06 * bb);
      outlineRefs.current[i].material.opacity = 0.9 * ease(bLin) * (1 - m) * (1 - erosion);
      solidRefs.current[i].material.opacity = m;
      const sh = shadowRefs.current[i];
      if (sh) sh.material.opacity = m * 0.35 * (1 - erosion);
    }
  });

  return (
    <group ref={pageRef}>
      <RoundedBox
        ref={backdropRef}
        args={[6.7, 4.4, 0.04]}
        radius={0.06}
        smoothness={4}
        position={[0, 0.1, -0.1]}
        visible={false}
      >
        <meshPhysicalMaterial
          color="#0c1126"
          roughness={0.3}
          clearcoat={0.6}
          clearcoatRoughness={0.3}
          transparent
          opacity={0}
        />
      </RoundedBox>
      <lineSegments ref={backdropLineRef} geometry={backdropOutline} position={[0, 0.1, -0.07]} visible={false}>
        <lineBasicMaterial color="#6c7bff" transparent opacity={0} />
      </lineSegments>
      <mesh ref={gridRef} position={[0, 0.1, -0.075]} visible={false}>
        <planeGeometry args={[6.7, 4.4]} />
        <meshBasicMaterial map={gridTexture} transparent opacity={0} depthWrite={false} />
      </mesh>

      {GUIDES.map((g, i) => (
        <mesh key={i} position={g.axis === 'h' ? [0, g.pos, -0.02] : [g.pos, 0.1, -0.02]}>
          <boxGeometry args={g.axis === 'h' ? [7.4, 0.006, 0.006] : [0.006, 5.2, 0.006]} />
          <meshBasicMaterial
            ref={(el) => (guideMats.current[i] = el)}
            color="#8fa4ff"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}

      {PANELS.map((spec, i) => (
        <group key={i} ref={(el) => (groupRefs.current[i] = el)} visible={false}>
          {/* Flat boxGeometry (not RoundedBox — its UVs smear both photo
              textures and the erosion alphaMap) so the dissolve mask lines
              up pixel-for-pixel with the departing particles. */}
          <mesh ref={(el) => (solidRefs.current[i] = el)}>
            <boxGeometry args={[spec.w, spec.h, 0.06]} />
            <meshPhysicalMaterial
              map={spec.tex != null ? textures[spec.tex] : undefined}
              color={spec.tex != null ? '#ffffff' : spec.color}
              emissive={spec.emissive || '#000000'}
              emissiveIntensity={spec.emissive ? 1.6 : 0}
              roughness={spec.tex != null ? 0.35 : 0.45}
              metalness={spec.tex != null ? 0.05 : 0}
              clearcoat={0.5}
              clearcoatRoughness={0.35}
              alphaMap={dissolve[i].texture}
              transparent
              opacity={0}
            />
          </mesh>
          {spec.tex != null && (
            <mesh ref={(el) => (shadowRefs.current[i] = el)} position={[0.04, -0.05, -0.045]}>
              <planeGeometry args={[spec.w * 1.03, spec.h * 1.03]} />
              <meshBasicMaterial color="#000000" transparent opacity={0} depthWrite={false} />
            </mesh>
          )}
          <lineSegments
            ref={(el) => (outlineRefs.current[i] = el)}
            geometry={outlineGeoms[i]}
            position={[0, 0, 0.045]}
          >
            <lineBasicMaterial color="#8fa4ff" transparent opacity={0} />
          </lineSegments>
        </group>
      ))}

      <mesh ref={scanRef} position={[0, 2.1, 0.09]} visible={false}>
        <boxGeometry args={[6.3, 0.018, 0.015]} />
        <meshBasicMaterial
          color="#dfe6ff"
          transparent
          opacity={0}
          toneMapped={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={scanGlowRef} position={[0, 2.1, 0.08]} visible={false}>
        <planeGeometry args={[6.3, 0.35]} />
        <meshBasicMaterial
          color="#8fa4ff"
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// The page's matter in transit. Every particle here is one exact cell from
// buildDissolveData — same position, same color, same departure time as the
// hole that opens in its panel's alphaMap — so what you see is the surface
// itself carried away, not dust layered over a separately fading page. Each
// one flies: page → funnel behind the page → swirl in the tunnel core → its
// matching spot on the monitor screen.
function ShredStream({ smoothRef, dissolve }) {
  const pointsRef = useRef();
  const matRef = useRef();
  const dotTexture = useMemo(makeDotTexture, []);
  useEffect(() => () => dotTexture.dispose(), [dotTexture]);

  const data = useMemo(() => {
    const total = dissolve.reduce((sum, d) => sum + d.count, 0);
    const colors = new Float32Array(total * 3);
    const ctrl = new Float32Array(total * 12); // 4 control points × xyz
    const timing = new Float32Array(total * 2); // start, end
    const phase = new Float32Array(total);
    const rnd = mulberry32(91);

    let o = 0;
    for (const d of dissolve) {
      for (let i = 0; i < d.count; i++, o++) {
        const sx = d.localX[i];
        const sy = d.localY[i];
        colors[o * 3] = d.colors[i * 3];
        colors[o * 3 + 1] = d.colors[i * 3 + 1];
        colors[o * 3 + 2] = d.colors[i * 3 + 2];

        const theta = Math.atan2(sy, sx) + (rnd() - 0.5) * 1.2;
        const radius = 0.25 + rnd() * 1.05;
        const c = o * 12;
        ctrl[c] = sx;
        ctrl[c + 1] = sy;
        ctrl[c + 2] = 0;
        ctrl[c + 3] = sx * 0.5;
        ctrl[c + 4] = sy * 0.5 + 0.1;
        ctrl[c + 5] = -3.5 - rnd() * 2;
        ctrl[c + 6] = Math.cos(theta) * radius;
        ctrl[c + 7] = Math.sin(theta) * radius + 0.1;
        ctrl[c + 8] = -11 - rnd() * 7;
        ctrl[c + 9] = SCREEN_CENTER.x + sx * SCREEN_SCALE;
        ctrl[c + 10] = SCREEN_CENTER.y + sy * SCREEN_SCALE;
        ctrl[c + 11] = SCREEN_CENTER.z + 0.03;

        // Departure is the exact scroll position this cell's mask pixel
        // goes transparent; flight length is fixed so the stream flows
        // continuously rather than everything landing at once.
        const t0 = d.pDepart[i];
        timing[o * 2] = t0;
        timing[o * 2 + 1] = t0 + FLIGHT_DURATION + rnd() * 0.03;
        phase[o] = rnd() * Math.PI * 2;
      }
    }

    return { positions: new Float32Array(total * 3), colors, ctrl, timing, phase, total };
  }, [dissolve]);

  useFrame(() => {
    const p = smoothRef.current;
    const points = pointsRef.current;
    const vis = p > SHRED_START - 0.005 && p < 0.96;
    points.visible = vis;
    if (!vis) return;

    matRef.current.opacity = ramp(p, SHRED_START, SHRED_START + 0.04) * (1 - ramp(p, 0.9, 0.96));

    const pos = points.geometry.attributes.position;
    const { ctrl, timing, phase, total } = data;
    for (let i = 0; i < total; i++) {
      const t0 = timing[i * 2];
      const t1 = timing[i * 2 + 1];
      const o = i * 3;
      if (p < t0 || p >= t1) {
        // Parked out of sight before takeoff and after landing.
        pos.array[o] = 0;
        pos.array[o + 1] = -999;
        pos.array[o + 2] = 0;
        continue;
      }
      const e = ease((p - t0) / (t1 - t0));
      const c = i * 12;
      const turb = Math.sin(Math.PI * e) * 0.16;
      pos.array[o] = bez(ctrl[c], ctrl[c + 3], ctrl[c + 6], ctrl[c + 9], e) + Math.sin(e * 11 + phase[i]) * turb;
      pos.array[o + 1] =
        bez(ctrl[c + 1], ctrl[c + 4], ctrl[c + 7], ctrl[c + 10], e) + Math.cos(e * 9 + phase[i]) * turb;
      pos.array[o + 2] = bez(ctrl[c + 2], ctrl[c + 5], ctrl[c + 8], ctrl[c + 11], e);
    }
    pos.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} visible={false} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        map={dotTexture}
        vertexColors
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0}
        depthWrite={false}
      />
    </points>
  );
}

// Chapter 4: flying through a constellation of connected nodes — the network
// behind every launched site. Rings of glowing points joined by hairline
// links converge on a light at the end of the tunnel; sparse code tokens
// drift between them.
function PlexusTunnel({ smoothRef }) {
  const wrapRef = useRef();
  const rotRef = useRef();
  const outerRef = useRef();
  const nodesMatRef = useRef();
  const linesMatRef = useRef();
  const outerMatRef = useRef();
  const glowRef = useRef();
  const tokensRef = useRef();
  const tokenMats = useRef([]);

  const glowTexture = useMemo(makeGlowTexture, []);
  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  const dotTexture = useMemo(makeDotTexture, []);
  useEffect(() => () => dotTexture.dispose(), [dotTexture]);

  const tokenTextures = useMemo(() => TOKENS.map((tk) => makeTokenTexture(tk.text, tk.color)), []);
  useEffect(() => () => tokenTextures.forEach((t) => t.dispose()), [tokenTextures]);

  const tokenSpecs = useMemo(() => {
    const rnd = mulberry32(21);
    return Array.from({ length: TOKEN_COUNT }, () => {
      const theta = rnd() * Math.PI * 2;
      const radius = 1.7 + rnd() * 2.0;
      return {
        tex: (rnd() * TOKENS.length) | 0,
        x: Math.cos(theta) * radius,
        y: Math.sin(theta) * radius,
        z: -4.5 - rnd() * 19,
        rotZ: (rnd() - 0.5) * 0.5,
        scale: 0.45 + rnd() * 0.45,
      };
    });
  }, []);

  // One connected web: jittered rings of nodes along the flight path, each
  // node linked to its ring neighbour and (usually) forward to the next ring,
  // with occasional diagonals so the triangulation looks organic.
  const web = useMemo(() => {
    const rnd = mulberry32(7);
    const pickColor = () => {
      const r = rnd();
      if (r < 0.4) return '#8fa4ff';
      if (r < 0.65) return '#e8ebff';
      if (r < 0.85) return '#6c7bff';
      return '#7fd0ff';
    };
    const nodes = [];
    for (let r = 0; r < PLEXUS_RINGS; r++) {
      const phase = rnd() * Math.PI * 2;
      for (let n = 0; n < PLEXUS_NODES; n++) {
        const a = (n / PLEXUS_NODES) * Math.PI * 2 + phase + (rnd() - 0.5) * 0.18;
        const rad = 1.9 + rnd() * 1.5;
        nodes.push({
          x: Math.cos(a) * rad,
          y: Math.sin(a) * rad,
          z: -3 - r * 0.7 + (rnd() - 0.5) * 0.3,
          c: new THREE.Color(pickColor()),
        });
      }
    }

    const nodePos = new Float32Array(nodes.length * 3);
    const nodeCol = new Float32Array(nodes.length * 3);
    nodes.forEach((nd, i) => {
      nodePos.set([nd.x, nd.y, nd.z], i * 3);
      nodeCol.set([nd.c.r, nd.c.g, nd.c.b], i * 3);
    });

    const lp = [];
    const lc = [];
    const dim = new THREE.Color();
    const idx = (r, n) => r * PLEXUS_NODES + n;
    const link = (a, b) => {
      const A = nodes[a];
      const B = nodes[b];
      lp.push(A.x, A.y, A.z, B.x, B.y, B.z);
      dim.copy(A.c).multiplyScalar(0.6);
      lc.push(dim.r, dim.g, dim.b);
      dim.copy(B.c).multiplyScalar(0.6);
      lc.push(dim.r, dim.g, dim.b);
    };
    for (let r = 0; r < PLEXUS_RINGS; r++) {
      for (let n = 0; n < PLEXUS_NODES; n++) {
        if (rnd() > 0.15) link(idx(r, n), idx(r, (n + 1) % PLEXUS_NODES));
        if (r < PLEXUS_RINGS - 1) {
          if (rnd() < 0.8) link(idx(r, n), idx(r + 1, n));
          if (rnd() < 0.35) link(idx(r, n), idx(r + 1, (n + 1) % PLEXUS_NODES));
        }
      }
    }

    // A sparse shell of larger, softer points outside the web — the
    // out-of-focus foreground bokeh in the reference.
    const outer = [];
    for (let i = 0; i < 70; i++) {
      const a = rnd() * Math.PI * 2;
      const rad = 3.6 + rnd() * 2.2;
      outer.push(Math.cos(a) * rad, Math.sin(a) * rad, -3 - rnd() * 23);
    }

    return {
      nodePos,
      nodeCol,
      linePos: new Float32Array(lp),
      lineCol: new Float32Array(lc),
      outerPos: new Float32Array(outer),
    };
  }, []);

  useLayoutEffect(() => {
    tokenMats.current = [];
    tokensRef.current.traverse((obj) => {
      if (obj.isMesh) tokenMats.current.push(obj.material);
    });
  }, []);

  useFrame((state) => {
    const p = smoothRef.current;
    const t = state.clock.elapsedTime;
    const o = ramp(p, 0.6, 0.68) * (1 - ramp(p, 0.84, 0.92));
    const wrap = wrapRef.current;
    wrap.visible = o > 0.002;
    if (!wrap.visible) return;
    const twinkle = 0.85 + Math.sin(t * 2.1) * 0.15;
    nodesMatRef.current.opacity = o * 0.95 * twinkle;
    linesMatRef.current.opacity = o * 0.3;
    outerMatRef.current.opacity = o * 0.5;
    glowRef.current.material.opacity = o * 0.7;
    rotRef.current.rotation.z = 0.15 + p * 0.5;
    outerRef.current.rotation.z = -p * 0.35;
    tokensRef.current.position.y = Math.sin(t * 0.5) * 0.08;
    for (const mat of tokenMats.current) mat.opacity = o * 0.5;
  });

  return (
    <group ref={wrapRef} visible={false}>
      <group ref={rotRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[web.nodePos, 3]} />
            <bufferAttribute attach="attributes-color" args={[web.nodeCol, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={nodesMatRef}
            map={dotTexture}
            vertexColors
            size={0.065}
            sizeAttenuation
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
        <lineSegments>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[web.linePos, 3]} />
            <bufferAttribute attach="attributes-color" args={[web.lineCol, 3]} />
          </bufferGeometry>
          <lineBasicMaterial
            ref={linesMatRef}
            vertexColors
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </lineSegments>
      </group>

      <group ref={outerRef}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[web.outerPos, 3]} />
          </bufferGeometry>
          <pointsMaterial
            ref={outerMatRef}
            map={dotTexture}
            color="#aab6ff"
            size={0.16}
            sizeAttenuation
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>

      <mesh ref={glowRef} position={[0, 0.1, -27.5]} scale={7}>
        <planeGeometry />
        <meshBasicMaterial
          map={glowTexture}
          transparent
          opacity={0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fog={false}
        />
      </mesh>

      <group ref={tokensRef}>
        {tokenSpecs.map((s, i) => (
          <mesh key={i} position={[s.x, s.y, s.z]} rotation={[0, 0, s.rotZ]} scale={s.scale}>
            <planeGeometry args={[1.3, 0.65]} />
            <meshBasicMaterial
              map={tokenTextures[s.tex]}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// A screen-glued blast — an expanding shockwave ring plus a full whiteout —
// that masks the cut from the tunnel's end into the desk scene. Both pieces
// track the camera every frame (position + quaternion copied from it, drawn
// with depthTest off at a high renderOrder) so the blast always fills the
// frame regardless of where the camera is looking.
function TunnelBlast({ smoothRef }) {
  const flashRef = useRef();
  const ringRef = useRef();
  const { camera } = useThree();
  const fwd = useMemo(() => new THREE.Vector3(), []);
  const glowTexture = useMemo(makeGlowTexture, []);
  useEffect(() => () => glowTexture.dispose(), [glowTexture]);

  useFrame(() => {
    const p = smoothRef.current;
    camera.getWorldDirection(fwd);

    const ringT = ramp(p, BLAST_PEAK - BLAST_RISE, BLAST_PEAK + BLAST_FALL * 1.6);
    const ring = ringRef.current;
    ring.visible = ringT > 0.01 && ringT < 1;
    if (ring.visible) {
      ring.position.copy(camera.position).addScaledVector(fwd, 0.4);
      ring.quaternion.copy(camera.quaternion);
      ring.scale.setScalar(0.6 + ringT * 34);
      ring.material.opacity = (1 - ringT) * 0.85;
    }

    const rise = ramp(p, BLAST_PEAK - BLAST_RISE, BLAST_PEAK);
    const fall = 1 - ramp(p, BLAST_PEAK, BLAST_PEAK + BLAST_FALL);
    const flashI = Math.min(rise, fall);
    const flash = flashRef.current;
    flash.visible = flashI > 0.01;
    if (flash.visible) {
      flash.position.copy(camera.position).addScaledVector(fwd, 0.35);
      flash.quaternion.copy(camera.quaternion);
      flash.material.opacity = flashI;
    }
  });

  return (
    <>
      <mesh ref={ringRef} visible={false} renderOrder={998}>
        <planeGeometry />
        <meshBasicMaterial
          map={glowTexture}
          color="#eaf0ff"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={flashRef} visible={false} renderOrder={999}>
        <planeGeometry args={[40, 40]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0}
          depthTest={false}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </>
  );
}

// The finale: a real desk-photograph moment — the stylized indigo journey
// resolves into a warm, physically lit desk scene. The shred particles land
// on the monitor and the site knits itself together on screen, framed by a
// black desk, a wood monitor riser, twin bookshelf speakers, keyboard and
// mouse, a bronze lamp, and a wooden chair hinted at the bottom.
function MockupRoom({ smoothRef, textures }) {
  const rootRef = useRef();
  const structRef = useRef();
  const screenRef = useRef();
  const structMats = useRef([]);
  const screenMats = useRef([]);

  useLayoutEffect(() => {
    const collect = (group, bucket) => {
      bucket.length = 0;
      group.traverse((obj) => {
        if (obj.isMesh) {
          obj.material.transparent = true;
          obj.material.opacity = 0;
          bucket.push(obj.material);
        }
      });
    };
    collect(structRef.current, structMats.current);
    collect(screenRef.current, screenMats.current);
  }, []);

  useFrame(() => {
    const p = smoothRef.current;
    // The screen content resolves first, while still catching landing dust —
    // the desk and props only reveal in the blast that follows, so the room
    // seems to detonate into place around a screen that was already glowing.
    const screen = ramp(p, 0.86, 0.94);
    const room = ramp(p, BLAST_PEAK, 0.97);
    const root = rootRef.current;
    const active = Math.max(screen, room);
    root.visible = active > 0.002;
    if (!root.visible) return;
    root.position.z = ROOM_Z - (1 - active) * 1.2;
    for (const mat of structMats.current) mat.opacity = room;
    for (const mat of screenMats.current) mat.opacity = screen;
  });

  return (
    <group ref={rootRef} position={[0, ROOM_Y, ROOM_Z]} visible={false}>
      <group ref={structRef}>
        {/* Warm, softly lit wall — the journey lands in a real desk
            photograph, not the stylized indigo space it flew through. */}
        <mesh position={[0, 2.3, -1.3]}>
          <planeGeometry args={[13, 8.5]} />
          <meshStandardMaterial color="#c9c1b2" roughness={0.95} />
        </mesh>
        {/* Soft warm light pooling on the wall, as if from an off-frame
            window at upper left — no window frame itself, just the glow. */}
        <mesh position={[-2.4, 3.1, -1.28]}>
          <planeGeometry args={[5, 4]} />
          <meshBasicMaterial
            color="#ffe9c9"
            transparent
            opacity={0.22}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, -1.56, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[13, 8]} />
          <meshStandardMaterial color="#0c0c16" roughness={0.9} />
        </mesh>

        {/* Desk: matte black surface on slim metal legs */}
        <RoundedBox args={[5.6, 0.1, 2.1]} radius={0.02} smoothness={3} position={[0, -0.06, 0]}>
          <meshStandardMaterial color="#101012" roughness={0.5} metalness={0.1} />
        </RoundedBox>
        {[-2.55, 2.55].map((x) => (
          <group key={x}>
            <mesh position={[x, -0.85, 0.75]}>
              <boxGeometry args={[0.07, 1.5, 0.07]} />
              <meshStandardMaterial color="#1c1c1f" roughness={0.4} metalness={0.4} />
            </mesh>
            <mesh position={[x, -0.85, -0.75]}>
              <boxGeometry args={[0.07, 1.5, 0.07]} />
              <meshStandardMaterial color="#1c1c1f" roughness={0.4} metalness={0.4} />
            </mesh>
          </group>
        ))}

        {/* Monitor riser: light wood, with a cable tray beneath */}
        <RoundedBox args={[2.0, 0.12, 0.85]} radius={0.03} smoothness={3} position={[0, 0.06, -0.35]}>
          <meshStandardMaterial color="#c9a06a" roughness={0.6} />
        </RoundedBox>
        <mesh position={[0, -0.06, -0.35]}>
          <boxGeometry args={[1.8, 0.03, 0.7]} />
          <meshStandardMaterial color="#2a2a2e" roughness={0.6} metalness={0.3} />
        </mesh>

        {/* Monitor: stand, bezel, clip-on light bar up top */}
        <mesh position={[0, 0.42, -0.55]}>
          <boxGeometry args={[0.16, 0.65, 0.08]} />
          <meshStandardMaterial color="#0f0f11" roughness={0.35} metalness={0.4} />
        </mesh>
        <RoundedBox args={[2.75, 1.75, 0.09]} radius={0.05} smoothness={4} position={[0, 1.32, -0.5]}>
          <meshStandardMaterial color="#0c0c0e" roughness={0.35} metalness={0.2} />
        </RoundedBox>
        <mesh position={[0, 2.28, -0.44]}>
          <boxGeometry args={[0.9, 0.06, 0.05]} />
          <meshStandardMaterial color="#1a1a1c" roughness={0.4} metalness={0.5} />
        </mesh>
        {[-0.35, 0.35].map((x) => (
          <mesh key={x} position={[x, 2.19, -0.46]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.02, 0.14, 0.02]} />
            <meshStandardMaterial color="#1a1a1c" roughness={0.4} metalness={0.5} />
          </mesh>
        ))}

        {/* Twin bookshelf speakers flanking the monitor */}
        {[-1.65, 1.65].map((x) => (
          <group key={x}>
            <RoundedBox args={[0.55, 0.75, 0.5]} radius={0.04} smoothness={3} position={[x, 0.42, -0.25]}>
              <meshStandardMaterial color="#efece4" roughness={0.7} />
            </RoundedBox>
            <mesh position={[x, 0.55, -0.25 + 0.26]}>
              <circleGeometry args={[0.15, 24]} />
              <meshStandardMaterial color="#17171a" roughness={0.8} />
            </mesh>
            <mesh position={[x, 0.24, -0.25 + 0.26]}>
              <circleGeometry args={[0.09, 24]} />
              <meshStandardMaterial color="#17171a" roughness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Keyboard, mouse, macro knob */}
        <RoundedBox args={[1.1, 0.05, 0.4]} radius={0.03} smoothness={3} position={[-0.15, 0.02, 0.55]}>
          <meshStandardMaterial color="#3a3d45" roughness={0.55} />
        </RoundedBox>
        <RoundedBox args={[0.16, 0.045, 0.25]} radius={0.03} smoothness={3} position={[0.72, 0.02, 0.6]}>
          <meshStandardMaterial color="#3a3d45" roughness={0.5} />
        </RoundedBox>
        <mesh position={[1.15, 0.03, 0.55]}>
          <cylinderGeometry args={[0.09, 0.09, 0.03, 24]} />
          <meshStandardMaterial color="#2a2c31" roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Bronze table lamp, right edge, cropped like the reference photo */}
        <mesh position={[2.65, 0.3, -0.15]}>
          <cylinderGeometry args={[0.05, 0.08, 0.5, 16]} />
          <meshStandardMaterial color="#8a6a4a" roughness={0.55} metalness={0.2} />
        </mesh>
        <mesh position={[2.65, 0.58, -0.15]}>
          <cylinderGeometry args={[0.16, 0.13, 0.14, 16]} />
          <meshStandardMaterial color="#6b5038" roughness={0.5} metalness={0.2} />
        </mesh>

        {/* Wooden chair hinted at the bottom, dim and half out of frame */}
        <mesh position={[0, -1.05, 1.35]} rotation={[0.15, 0, 0]}>
          <boxGeometry args={[1.5, 0.9, 0.06]} />
          <meshStandardMaterial color="#5c452f" roughness={0.9} />
        </mesh>
      </group>

      {/* The site, reassembled at screen scale where the particles land. */}
      <group ref={screenRef} position={[0, 1.32, -0.455]} scale={SCREEN_SCALE}>
        <mesh position={[0, 0, -0.03]}>
          <boxGeometry args={[6.45, 4.15, 0.02]} />
          <meshStandardMaterial color="#0a0d1f" roughness={0.6} />
        </mesh>
        {PANELS.map((spec, i) =>
          spec.tex != null ? (
            <mesh key={i} position={[spec.x, spec.y, 0.02]}>
              <boxGeometry args={[spec.w, spec.h, 0.03]} />
              <meshStandardMaterial map={textures[spec.tex]} roughness={0.5} />
            </mesh>
          ) : (
            <mesh key={i} position={[spec.x, spec.y, 0.02]}>
              <boxGeometry args={[spec.w, spec.h, 0.03]} />
              <meshStandardMaterial
                color={spec.color}
                emissive={spec.emissive || '#000000'}
                emissiveIntensity={spec.emissive ? 1.2 : 0}
                roughness={0.5}
              />
            </mesh>
          )
        )}
      </group>

      {/* Warm window key light from the left + soft interior fill */}
      <pointLight position={[-3.2, 2.4, 1.2]} intensity={26} distance={11} color="#ffe6c2" />
      <pointLight position={[1.5, 1.6, 1.6]} intensity={10} distance={7} color="#dfe3f5" />
    </group>
  );
}

function Scene({ progressRef }) {
  const smoothRef = useRef(0);
  const { scene, camera } = useThree();
  const lookTarget = useMemo(() => new THREE.Vector3(), []);

  const textures = useTexture(TEX_PATHS);
  useLayoutEffect(() => {
    for (const t of textures) {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = 4;
    }
  }, [textures]);

  const dissolve = useMemo(() => buildDissolveData(textures), [textures]);
  useEffect(
    () => () => {
      dissolve.forEach((d) => d.texture.dispose());
    },
    [dissolve]
  );

  useLayoutEffect(() => {
    scene.background = new THREE.Color('#04050c');
    scene.fog = new THREE.Fog('#04050c', 14, 46);
    return () => {
      scene.background = null;
      scene.fog = null;
    };
  }, [scene]);

  useFrame((state, delta) => {
    smoothRef.current = THREE.MathUtils.damp(smoothRef.current, progressRef.current, 6, delta);
    const p = smoothRef.current;
    const t = state.clock.elapsedTime;

    sampleVec3(CAM_POS, p, camera.position);
    // A whisper of handheld drift keeps long holds feeling filmed, not frozen.
    camera.position.x += Math.sin(t * 0.33) * 0.05;
    camera.position.y += Math.cos(t * 0.41) * 0.04;
    sampleVec3(CAM_LOOK, p, lookTarget);
    camera.lookAt(lookTarget);
    camera.rotateZ(sampleNum(CAM_ROLL, p));

    // Keep the page's full width in frame on narrow screens by widening the
    // FOV so the horizontal field matches a 1.4 aspect baseline.
    let fov = sampleNum(CAM_FOV, p);
    const aspect = state.size.width / state.size.height;
    if (aspect < 1.4) {
      const half = THREE.MathUtils.degToRad(fov) / 2;
      fov = Math.min(95, THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(half) * (1.4 / aspect))));
    }
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    if (scene.background) {
      sampleColor(BG_COLORS, p, scene.background);
      scene.fog.color.copy(scene.background);
    }
  }, -1);

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 6, 6]} intensity={1.4} color="#e8ecff" />
      <Stars />
      <Glows smoothRef={smoothRef} />
      <Orb smoothRef={smoothRef} />
      <Burst smoothRef={smoothRef} />
      <PagePanels smoothRef={smoothRef} textures={textures} dissolve={dissolve} />
      <ShredStream smoothRef={smoothRef} dissolve={dissolve} />
      <PlexusTunnel smoothRef={smoothRef} />
      <TunnelBlast smoothRef={smoothRef} />
      <MockupRoom smoothRef={smoothRef} textures={textures} />
      <EffectComposer multisampling={4}>
        <Bloom intensity={0.55} luminanceThreshold={0.32} luminanceSmoothing={0.25} mipmapBlur radius={0.75} />
        <Noise opacity={0.025} />
        <Vignette eskil={false} offset={0.18} darkness={0.78} />
      </EffectComposer>
    </>
  );
}

// --- Section shell -----------------------------------------------------------

export default function BuildJourney() {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const overlayRefs = useRef([]);
  const [frameloop, setFrameloop] = useState('always');
  const [reduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const updateOverlays = useCallback((p) => {
    for (let i = 0; i < CHAPTERS.length; i++) {
      const el = overlayRefs.current[i];
      if (!el) continue;
      const c = CHAPTERS[i];
      const o = ramp(p, c.in[0], c.in[1]) * (1 - ramp(p, c.out[0], c.out[1]));
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translateY(${((1 - o) * 24).toFixed(1)}px)`;
      el.style.pointerEvents = o > 0.5 ? 'auto' : 'none';
    }
  }, []);

  useLayoutEffect(() => {
    if (reduced) return undefined;
    gsap.registerPlugin(ScrollTrigger);

    const scrub = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
        updateOverlays(self.progress);
      },
    });

    // Only render the canvas while the section is anywhere near the viewport.
    const visibility = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => setFrameloop(self.isActive ? 'always' : 'never'),
    });
    setFrameloop(visibility.isActive ? 'always' : 'never');
    updateOverlays(scrub.progress);

    return () => {
      scrub.kill();
      visibility.kill();
    };
  }, [reduced, updateOverlays]);

  if (reduced) {
    return (
      <section className={styles.fallback}>
        <p className={styles.kicker}>Discover · Design · Build · Launch</p>
        <h2 className={styles.title}>From idea to launched website.</h2>
        <Link href="/contact" className={styles.ctaBtn}>
          Start your project
        </Link>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className={styles.journey} aria-label="How we build, told as a scroll story">
      <div className={styles.stage}>
        <div className={styles.canvasWrap}>
          <Canvas
            dpr={[1, 1.5]}
            frameloop={frameloop}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            camera={{ fov: 45, near: 0.1, far: 90, position: [0, 0.3, 7.5] }}
          >
            <Suspense fallback={null}>
              <Scene progressRef={progressRef} />
            </Suspense>
          </Canvas>
        </div>

        <div className={styles.overlay}>
          {CHAPTERS.map((c, i) => (
            <div
              key={c.kicker}
              ref={(el) => (overlayRefs.current[i] = el)}
              className={c.cta ? styles.chapterFinal : styles.chapter}
            >
              <p className={styles.kicker}>{c.kicker}</p>
              <h2 className={styles.title}>{c.title}</h2>
              {c.cta && (
                <Link href="/contact" className={styles.ctaBtn}>
                  Start your project
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
