'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

// Soft pastel palette for the icons — module-level so its identity is
// stable and the effect doesn't rebuild on parent re-renders.
const PASTELS = [
  '#E87DA8', // rose
  '#F08078', // coral
  '#F5A76C', // peach
  '#E3C94F', // lemon
  '#6FCFA6', // mint
  '#6FB4E8', // baby blue
  '#8AA2E8', // periwinkle
  '#A187CC', // lavender
];

// Lusion-style interactive particle sea: hundreds of tiny pastel shapes rest
// along the bottom of the section; the cursor shoves them away and gated
// springs pull them home, so they splash and flow like water. Extras:
//  - ref.burst() rains a fresh rush of icons down from the top
//  - obstacleRef (the heading) acts as a solid wall the icons bounce off
// Plain <canvas> + one rAF loop — no libraries, nothing re-renders through
// React, and the loop pauses whenever the section is offscreen.
const ParticleField = forwardRef(function ParticleField({ colors = PASTELS, obstacleRef }, ref) {
  const canvasRef = useRef(null);
  const apiRef = useRef({ burst: () => {} });

  useImperativeHandle(ref, () => ({ burst: () => apiRef.current.burst() }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext('2d');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const SPRING = 0.016;  // pull toward home — gated to ~zero while in flight
    const GRAVITY = 0.05;  // flying icons arc downward like spray
    const RADIUS = 220;    // cursor influence radius (px)
    const BOUNCE = 0.65;   // energy kept when ricocheting off edges/obstacles

    let particles = [];
    let sprites = [];
    let raf = 0;
    let visible = false;
    let w = 0;
    let h = 0;
    let moundH = 0;
    let baseCount = 0;

    // Glyph collision mask: the heading text rasterized at half resolution.
    // Icons collide with the actual letter shapes, not a bounding box.
    const MASK_SCALE = 0.5;
    let maskData = null;
    let maskW = 0;
    let maskH = 0;
    let maskAnchor = { l: 1e9, t: 1e9, w: 0, at: -1 };

    const pointer = { cx: -9999, cy: -9999, lastX: null, lastY: null };

    const solidAt = (x, y) => {
      const mx = (x * MASK_SCALE) | 0;
      const my = (y * MASK_SCALE) | 0;
      if (mx < 0 || my < 0 || mx >= maskW || my >= maskH) return 0;
      return maskData[my * maskW + mx];
    };

    // Redraw the heading's text lines into the mask, matching the DOM's
    // font and position. A fat round stroke inflates the glyphs by roughly
    // the icon radius, so collisions happen at the icons' visual edges.
    const buildMask = () => {
      maskData = null;
      const obstacle = obstacleRef?.current;
      if (!obstacle || w === 0) return;
      // Marked line spans carry their clean text in data-text (their DOM
      // textContent includes the roll-clone letters).
      const spans = obstacle.querySelectorAll('[data-collide]');
      if (!spans.length) return;
      const canvasRect = canvas.getBoundingClientRect();
      const cs = getComputedStyle(obstacle);
      const m = document.createElement('canvas');
      m.width = Math.max(1, Math.ceil(w * MASK_SCALE));
      m.height = Math.max(1, Math.ceil(h * MASK_SCALE));
      const mc = m.getContext('2d', { willReadFrequently: true });
      mc.scale(MASK_SCALE, MASK_SCALE);
      mc.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      if ('letterSpacing' in mc) mc.letterSpacing = cs.letterSpacing;
      mc.textBaseline = 'alphabetic';
      mc.fillStyle = '#000';
      mc.strokeStyle = '#000';
      mc.lineWidth = 9;
      mc.lineJoin = 'round';
      let anchor = null;
      for (const el of spans) {
        const r = el.getBoundingClientRect();
        if (r.width === 0) continue;
        const text = el.getAttribute('data-text') || el.textContent;
        const metrics = mc.measureText(text);
        // The DOM rect's top edge sits a full font-ascent above the
        // baseline; canvas metrics give us that same ascent.
        const ascent = metrics.fontBoundingBoxAscent ?? metrics.actualBoundingBoxAscent * 1.1;
        const x = r.left - canvasRect.left + (r.width - metrics.width) / 2;
        const y = r.top - canvasRect.top + ascent;
        mc.strokeText(text, x, y);
        mc.fillText(text, x, y);
        if (!anchor) anchor = { l: r.left - canvasRect.left, t: r.top - canvasRect.top, w: r.width };
      }
      if (!anchor) return;
      maskW = m.width;
      maskH = m.height;
      const img = mc.getImageData(0, 0, maskW, maskH).data;
      maskData = new Uint8Array(maskW * maskH);
      for (let i = 0; i < maskData.length; i++) maskData[i] = img[i * 4 + 3] > 60 ? 1 : 0;
      maskAnchor = { ...anchor, at: maskAnchor.at };
    };

    // Calm waterline: essentially level, with one soft broad swell across
    // the width.
    const envelope = (t) => 0.84 + 0.05 * Math.sin(t * Math.PI * 1.3 + 0.4);

    // Each shape/color/alpha combo is rasterized once; the frame loop only
    // ever blits sprites, which is what keeps 1000+ particles at 60fps.
    const makeSprites = (dpr) => {
      sprites = [];
      const draw = {
        circle: (c, r) => { c.beginPath(); c.arc(0, 0, r, 0, Math.PI * 2); c.fill(); },
        square: (c, r) => c.fillRect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7),
        diamond: (c, r) => { c.rotate(Math.PI / 4); c.fillRect(-r * 0.75, -r * 0.75, r * 1.5, r * 1.5); },
        triangle: (c, r) => { c.beginPath(); c.moveTo(-r, r * 0.8); c.lineTo(r, r * 0.8); c.lineTo(0, -r); c.closePath(); c.fill(); },
        plus: (c, r) => { c.beginPath(); c.moveTo(-r, 0); c.lineTo(r, 0); c.moveTo(0, -r); c.lineTo(0, r); c.stroke(); },
        cross: (c, r) => { c.rotate(Math.PI / 4); c.beginPath(); c.moveTo(-r, 0); c.lineTo(r, 0); c.moveTo(0, -r); c.lineTo(0, r); c.stroke(); },
      };
      // One uniform size for every icon; the shape and its pastel color
      // (plus a whisper of alpha) are what vary.
      const size = 10;
      for (const tint of colors) {
        for (const alpha of [0.85, 1]) {
          for (const shape of Object.keys(draw)) {
            const pad = 2;
            const logical = size + pad * 2;
            const s = document.createElement('canvas');
            s.width = logical * dpr;
            s.height = logical * dpr;
            const c = s.getContext('2d');
            c.scale(dpr, dpr);
            c.translate(logical / 2, logical / 2);
            c.globalAlpha = alpha;
            c.fillStyle = tint;
            c.strokeStyle = tint;
            c.lineWidth = Math.max(1.2, size * 0.26);
            c.lineCap = 'round';
            draw[shape](c, size / 2);
            sprites.push({ img: s, size: logical, half: logical / 2 });
          }
        }
      }
    };

    const makeParticle = (hx, hy, x, y, vx, vy, g) => ({
      hx,
      hy,
      x,
      y,
      vx,
      vy,
      // extra gravity while raining in; resets to 1 once it splashes down
      g,
      // frames left in "slide" mode after touching the heading text
      slide: 0,
      s: (Math.random() * sprites.length) | 0,
      // ambient-drift orbit: radius, angular speed, phase, direction
      or: 1.5 + Math.random() * 2.5,
      sp: 0.3 + Math.random() * 0.5,
      ph: Math.random() * Math.PI * 2,
      dir: Math.random() < 0.5 ? 1 : -1,
    });

    const build = () => {
      const rect = host.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width));
      h = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeSprites(dpr);

      // Jittered grid inside the envelope: evenly spaced with a small,
      // consistent gap between icons — jitter kept low so neighbours never
      // crowd each other.
      particles = [];
      moundH = Math.min(h * 0.36, 340);
      const cell = w < 700 ? 24 : 22;
      for (let gx = cell / 2; gx < w; gx += cell) {
        for (let gy = cell / 2; gy < moundH; gy += cell) {
          const x = gx + (Math.random() - 0.5) * cell * 0.5;
          const up = gy + (Math.random() - 0.5) * cell * 0.5;
          if (up < envelope(x / w) * moundH) {
            const y = h - 10 - up;
            particles.push(makeParticle(x, y, x, y, 0, 0, 1));
          }
        }
      }
      baseCount = particles.length;
    };

    // A rush of fresh icons streaming down from above the section; each one
    // is assigned a home inside the sea, so after the splash it settles in
    // and becomes part of the shoreline.
    const spawnBurst = () => {
      const count = 140;
      const cap = baseCount + 500;
      const overflow = particles.length + count - cap;
      if (overflow > 0) particles.splice(baseCount, overflow);
      for (let i = 0; i < count; i++) {
        const hx = Math.random() * w;
        const up = Math.random() * envelope(hx / w) * moundH;
        const hy = h - 10 - up;
        particles.push(
          makeParticle(
            hx,
            hy,
            Math.random() * w,
            -20 - Math.random() * h * 0.6, // staggered stream from above
            (Math.random() - 0.5) * 2,
            5 + Math.random() * 7,
            3 // heavier while raining in
          )
        );
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const sp = sprites[p.s];
        ctx.drawImage(sp.img, p.x - sp.half, p.y - sp.half, sp.size, sp.size);
      }
    };

    const step = (t) => {
      const rect = canvas.getBoundingClientRect();
      const cx = pointer.cx - rect.left;
      const cy = pointer.cy - rect.top;
      // A fast-moving cursor shoves harder — that impulse is what makes it
      // feel like splashing through water rather than a static force field.
      const pvx = pointer.lastX === null ? 0 : cx - pointer.lastX;
      const pvy = pointer.lastY === null ? 0 : cy - pointer.lastY;
      pointer.lastX = cx;
      pointer.lastY = cy;
      const rawSpeed = Math.hypot(pvx, pvy);
      const speed = Math.min(rawSpeed, 40);
      const push = 1.2 + speed * 1.1;
      // Direction the cursor is travelling — particles get dragged partly
      // along it, the way water is displaced forward, not just outward.
      const fvx = rawSpeed > 0.01 ? pvx / rawSpeed : 0;
      const fvy = rawSpeed > 0.01 ? pvy / rawSpeed : 0;

      // Keep the glyph mask aligned with the heading — it moves during its
      // entrance animation and on layout changes. Throttled because a
      // rebuild costs a couple of milliseconds.
      const obstacle = obstacleRef?.current;
      if (obstacle) {
        const first = obstacle.querySelector('[data-collide]');
        if (first) {
          const fr = first.getBoundingClientRect();
          const fl = fr.left - rect.left;
          const ft = fr.top - rect.top;
          const moved =
            Math.abs(fl - maskAnchor.l) > 1.5 ||
            Math.abs(ft - maskAnchor.t) > 1.5 ||
            Math.abs(fr.width - maskAnchor.w) > 1.5;
          if (moved && t - maskAnchor.at > 0.15) {
            buildMask();
            maskAnchor.at = t;
          }
        }
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // How much this icon is "in flight" (0 at rest → 1 flowing fast).
        // Flowing icons are untethered: barely any spring, low drag, a touch
        // of gravity — they glide and arc like thrown water instead of
        // snapping back on a rubber band.
        const sp2 = p.vx * p.vx + p.vy * p.vy;
        const flow = sp2 / (sp2 + 4);

        // Ambient "molecule" drift: the spring target slowly circles the
        // resting spot (half of them clockwise, half counter), so every icon
        // is always sliding a little, edging into its neighbours' space.
        const a = p.dir * t * p.sp + p.ph;
        const tx = p.hx + Math.cos(a) * p.or;
        const ty = p.hy + Math.sin(a) * p.or * 0.7;
        // Clamped pull: even from across the section the tug home stays
        // gentle, so far-flung icons stream back instead of slingshotting.
        const dxh = tx - p.x;
        const dyh = ty - p.y;
        const dh = Math.hypot(dxh, dyh) || 1;
        // While in "slide" mode (recently touched the heading), the spring
        // lets go completely and gravity runs at full strength — otherwise
        // the homeward pull pins icons against the letters forever.
        const sliding = p.slide > 0;
        if (sliding) p.slide -= 1;
        const pull = sliding ? 0 : Math.min(dh, 60) * SPRING * (1 - 0.95 * flow);
        let fx = (dxh / dh) * pull;
        let fy = (dyh / dh) * pull + GRAVITY * (sliding ? Math.max(flow, 0.9) : flow) * p.g;

        const dx = p.x - cx;
        const dy = p.y - cy;
        const d2 = dx * dx + dy * dy;
        if (d2 < RADIUS * RADIUS && d2 > 0.01) {
          const d = Math.sqrt(d2);
          // Smoothstep falloff: full strength at the center melting to zero
          // at the rim — no hard edge where the influence starts.
          let tt = 1 - d / RADIUS;
          tt = tt * tt * (3 - 2 * tt);
          const f = tt * push;
          // Weighted toward the swipe direction so a fast sweep throws a
          // whole wall of icons forward — the wave front.
          fx += ((dx / d) * 0.55 + fvx * 0.45) * f;
          fy += ((dy / d) * 0.55 + fvy * 0.45) * f;
        }
        // Low drag while flowing, firmer damping while settling.
        const drag = 0.92 + 0.065 * flow;
        p.vx = (p.vx + fx) * drag;
        p.vy = (p.vy + fy) * drag;

        // Integrate in substeps when moving fast, so icons can't tunnel
        // through a letter stroke and end up trapped inside a counter.
        const spd = Math.hypot(p.vx, p.vy);
        const steps = maskData && spd > 8 ? Math.ceil(spd / 8) : 1;
        const stepX = p.vx / steps;
        const stepY = p.vy / steps;
        for (let s = 0; s < steps; s++) {
          p.x += stepX;
          p.y += stepY;
          if (!maskData || !solidAt(p.x, p.y)) continue;
          // Bounce off the actual letterforms: estimate the surface normal
          // from the mask gradient, reflect the into-surface velocity
          // (keeping the tangential part, so icons slide off strokes and
          // roll along letter tops), and push out of the ink.
          const o = 3;
          let nx = solidAt(p.x - o, p.y) - solidAt(p.x + o, p.y);
          let ny = solidAt(p.x, p.y - o) - solidAt(p.x, p.y + o);
          if (nx === 0 && ny === 0) ny = -1; // deep inside: push upward
          const nl = Math.hypot(nx, ny);
          nx /= nl;
          ny /= nl;
          const vn = p.vx * nx + p.vy * ny;
          if (vn < 0) {
            p.vx -= (1 + BOUNCE) * vn * nx;
            p.vy -= (1 + BOUNCE) * vn * ny;
          }
          for (let k = 0; k < 6 && solidAt(p.x, p.y); k++) {
            p.x += nx * 2;
            p.y += ny * 2;
          }
          // Touching the text arms "slide" mode for the next half second:
          // no spring, full gravity, and a firm shove along the surface's
          // downhill tangent — the icon rolls off the letters like off a
          // slippery roof and drops back into the sea.
          p.slide = 30;
          let tdx = -ny;
          let tdy = nx;
          if (tdy < 0) { tdx = -tdx; tdy = -tdy; } // choose the downhill way
          if (tdy < 0.1) {
            // Flat letter top: no downhill — probe just below the surface
            // line and commit toward the nearest open air.
            let solidL = 0;
            let solidR = 0;
            for (let k = 1; k <= 5; k++) {
              solidL += solidAt(p.x - k * 7, p.y + 4);
              solidR += solidAt(p.x + k * 7, p.y + 4);
            }
            tdx = solidL === solidR ? p.dir : solidL < solidR ? -1 : 1;
            tdy = 0;
          }
          p.vx += tdx * 0.5;
          p.vy += tdy * 0.5;
          break;
        }

        // Rained-in icons shed their extra weight once they slow down.
        if (p.g !== 1 && flow < 0.3) p.g = 1;

        // Ricochet off the section bounds so big splashes bounce around the
        // whole stage instead of sailing out of view. Only reflect motion
        // heading INTO a wall — icons raining in from above pass freely.
        if (p.x < 6) { p.x = 6; if (p.vx < 0) p.vx = -p.vx * BOUNCE; }
        else if (p.x > w - 6) { p.x = w - 6; if (p.vx > 0) p.vx = -p.vx * BOUNCE; }
        if (p.y < 6) { if (p.vy < 0) { p.y = 6; p.vy = -p.vy * BOUNCE; } }
        else if (p.y > h - 6) { p.y = h - 6; if (p.vy > 0) p.vy = -p.vy * BOUNCE; }

      }
    };

    const loop = (now) => {
      if (!visible) return;
      step(now / 1000);
      render();
      raf = requestAnimationFrame(loop);
    };

    build();
    render();

    // Reduced motion: keep the static mound, skip the physics entirely.
    if (reduced) return;

    apiRef.current.burst = spawnBurst;

    const onMove = (e) => { pointer.cx = e.clientX; pointer.cy = e.clientY; };
    const onLeave = () => { pointer.cx = -9999; pointer.cy = -9999; };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('mouseleave', onLeave);

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(host);

    let resizeT;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeT);
      resizeT = setTimeout(() => { build(); render(); }, 150);
    });
    ro.observe(host);

    return () => {
      apiRef.current.burst = () => {};
      cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('mouseleave', onLeave);
    };
  }, [colors, obstacleRef]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        display: 'block',
        pointerEvents: 'none',
      }}
    />
  );
});

export default ParticleField;
