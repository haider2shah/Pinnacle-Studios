'use client';

import { useEffect, useRef } from 'react';
import styles from '../styles_css/DustText.module.css';

// Avengers-style disintegration text. Idle: a subtle stream of dust drifts
// off the right edge of the text, hinting at the interaction. On hover: a
// soft hole in the text follows the cursor (CSS mask) while matching dust
// particles blow away from that spot on a canvas layered over the text —
// so the letters appear to crumble under the cursor. The mask snaps shut
// the moment the cursor moves on, so the text is always instantly whole
// again. No libraries; the rAF loop pauses when offscreen.

const PAD = 150;  // canvas margin around the text for flying dust
const HOLE = 64;  // cursor hole radius — must match the CSS mask circle

// The dust inherits the text gradient's colors (cyan → purple across width).
const C0 = [0, 212, 255];
const C1 = [180, 79, 255];
const lerpColor = (t) => {
  const r = Math.round(C0[0] + (C1[0] - C0[0]) * t);
  const g = Math.round(C0[1] + (C1[1] - C0[1]) * t);
  const b = Math.round(C0[2] + (C1[2] - C0[2]) * t);
  return `rgb(${r},${g},${b})`;
};

export default function DustText({ text, className = '' }) {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const textEl = textRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !textEl || !canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    let points = [];      // text pixels: { x, y, color, state (0 rest / 1 dust) }
    let rightEdge = [];   // subset near the right edge, for the idle stream
    let cornerPts = [];   // top-right corner — the permanently crumbling bite
    let dust = [];        // particles currently flying
    let raf = 0;
    let visible = false;
    let hovering = false;
    let mx = -9999;
    let my = -9999;
    let emitT = 0;
    let textW = 0;

    // One-time "snap": on the first hover, a dissolve front sweeps the whole
    // line into dust, holds a beat, then the text re-forms.
    let snap = null;          // { t: frames elapsed } while running
    let snapPlayed = false;
    const SNAP_DISSOLVE = 45; // frames for the wave to cross the text
    const SNAP_HOLD = 60;     // fully dusted pause (~1s) before the dust returns
    const SNAP_LEAD = 30;     // inbound dust leads the reveal by this many frames
    // Reform sweeps at exactly the dissolve's speed: its moving span equals
    // SNAP_DISSOLVE, plus the lead time for the dust to land ahead of it.
    const SNAP_REFORM = SNAP_DISSOLVE + SNAP_LEAD;

    const build = () => {
      const r = textEl.getBoundingClientRect();
      textW = Math.max(1, Math.ceil(r.width));
      const textH = Math.max(1, Math.ceil(r.height));
      const w = textW + PAD * 2;
      const h = textH + PAD * 2;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Rasterize the text and sample it into dust origin points.
      const off = document.createElement('canvas');
      off.width = textW;
      off.height = textH;
      const oc = off.getContext('2d', { willReadFrequently: true });
      const cs = getComputedStyle(textEl);
      oc.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      oc.textBaseline = 'alphabetic';
      const m = oc.measureText(text);
      const ascent = m.fontBoundingBoxAscent ?? m.actualBoundingBoxAscent * 1.1;
      oc.fillText(text, (textW - m.width) / 2, ascent);
      const data = oc.getImageData(0, 0, textW, textH).data;

      points = [];
      rightEdge = [];
      cornerPts = [];
      dust = [];
      const GAP = 3;
      for (let y = 1; y < textH; y += GAP) {
        for (let x = 1; x < textW; x += GAP) {
          if (data[(y * textW + x) * 4 + 3] > 128) {
            const pt = { x, y, color: lerpColor(x / textW), state: 0 };
            points.push(pt);
            if (x > textW * 0.86) rightEdge.push(pt);
            // Matches the corner-bite mask ellipse in the CSS.
            if (x > textW * 0.88 && y < textH * 0.5) cornerPts.push(pt);
          }
        }
      }
    };

    const spawn = (pt, strength, cx, cy, longTail) => {
      // Ambient drift right and slightly up (the Avengers look), plus a
      // radial kick away from the cursor when there is one.
      let ax = 0.6;
      let ay = -0.35;
      if (cx != null) {
        const ddx = pt.x - cx;
        const ddy = pt.y - cy;
        const dd = Math.hypot(ddx, ddy) || 1;
        ax += (ddx / dd) * 0.7;
        ay += (ddy / dd) * 0.7 - 0.15;
      }
      pt.state = 1;
      dust.push({
        x: pt.x,
        y: pt.y,
        pt,
        vx: ax * (0.6 + Math.random()) * strength,
        vy: ay * (0.6 + Math.random()) * strength,
        life: 1,
        // Long-tail dust lives ~2.5x longer, so it travels far before fading.
        decay: longTail ? 0.006 + Math.random() * 0.007 : 0.014 + Math.random() * 0.02,
        size: 1.4 + Math.random() * 1.8,
        ph: Math.random() * Math.PI * 2,
        color: pt.color,
      });
    };

    // Reassembly dust: starts scattered far up-and-right of its letter pixel
    // and drifts home with the same slow, swirling character as the fly-away
    // — the disintegration played in reverse, not a quick slide.
    const spawnIn = (pt) => {
      const x0 = pt.x + 60 + Math.random() * 160 + (Math.random() - 0.5) * 80;
      const y0 = pt.y - (40 + Math.random() * 120);
      dust.push({
        in: true,
        pt,
        x: x0,
        y: y0,
        x0,
        y0,
        t: 0,
        dur: 24 + Math.random() * 14,
        life: 0.1,
        size: 1.4 + Math.random() * 1.8,
        ph: Math.random() * Math.PI * 2,
        color: pt.color,
      });
    };

    const step = () => {
      // The snap timeline: advance the dissolve front, spraying the text
      // pixels it passes into dust, then re-assemble it from inbound dust.
      if (snap) {
        snap.t += 1;
        const W = textW * 1.15;
        let front;
        if (snap.t <= SNAP_DISSOLVE) {
          front = (snap.t / SNAP_DISSOLVE) * W;
          if (dust.length < 1400) {
            for (let i = 0; i < points.length; i++) {
              const pt = points[i];
              if (!pt.state && pt.x < front && Math.random() < 0.5) {
                spawn(pt, 1.6 + Math.random(), null, null, Math.random() < 0.3);
              }
            }
          }
        } else if (snap.t <= SNAP_DISSOLVE + SNAP_HOLD) {
          front = W;
        } else {
          // Two fronts sweep back: the dust front leads, launching inbound
          // particles; the reveal front trails it, uncovering each column of
          // text right as its dust lands — so the letters visibly re-form
          // out of particles instead of wiping back in.
          const tR = snap.t - SNAP_DISSOLVE - SNAP_HOLD;
          const span = SNAP_REFORM - SNAP_LEAD;
          const dustFront = W * (1 - Math.min(1, tR / span));
          const revealK = Math.max(0, Math.min(1, (tR - SNAP_LEAD) / span));
          front = W * (1 - revealK);
          if (snap.prevDustFront == null) snap.prevDustFront = W;
          if (dust.length < 1600) {
            for (let i = 0; i < points.length; i++) {
              const pt = points[i];
              if (pt.x < snap.prevDustFront && pt.x >= dustFront && Math.random() < 0.5) {
                spawnIn(pt);
              }
            }
          }
          snap.prevDustFront = dustFront;
          if (tR >= SNAP_REFORM) {
            snap = null;
            front = -40;
          }
        }
        textEl.style.setProperty('--snap', `${front}px`);
      }

      // Release the text pixels under the cursor hole as dust.
      if (hovering && !snap && dust.length < 900) {
        for (let i = 0; i < points.length; i++) {
          const pt = points[i];
          if (pt.state) continue;
          const dx = pt.x - mx;
          const dy = pt.y - my;
          if (dx * dx + dy * dy < HOLE * HOLE) spawn(pt, 2.4, mx, my);
        }
      }
      // Idle hint: a dense, long-tailed plume streaming off the eroded
      // top-right corner (the attention-grabber), plus a fainter trickle
      // along the right edge.
      emitT -= 1;
      if (emitT <= 0) {
        emitT = 3;
        for (let n = 0; n < 2 && cornerPts.length; n++) {
          const pt = cornerPts[(Math.random() * cornerPts.length) | 0];
          if (!pt.state) spawn(pt, 1.3, null, null, true);
        }
        if (rightEdge.length && Math.random() < 0.35) {
          const pt = rightEdge[(Math.random() * rightEdge.length) | 0];
          if (!pt.state) spawn(pt, 0.7, null, null);
        }
      }
      // Fly, swirl, fade; free the origin point when a particle dies.
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i];
        if (d.in) {
          // Inbound: a long, turbulent drift onto the letter pixel — slow
          // fade-in, swirling path that straightens and settles as it lands.
          d.t += 1;
          const k = Math.min(1, d.t / d.dur);
          const e = k * k * (3 - 2 * k); // smoothstep: drift in, ease to rest
          const waver = 1 - e;
          d.x = d.x0 + (d.pt.x - d.x0) * e + Math.cos(d.ph + k * 5) * waver * 9;
          d.y = d.y0 + (d.pt.y - d.y0) * e + Math.sin(d.ph * 0.8 + k * 6) * waver * 8;
          d.life = 0.1 + 0.9 * e;
          if (k >= 1) {
            dust[i] = dust[dust.length - 1];
            dust.pop();
          }
          continue;
        }
        d.ph += 0.16;
        d.vx = d.vx * 0.985 + Math.cos(d.ph) * 0.05;
        d.vy = d.vy * 0.985 + Math.sin(d.ph * 0.8) * 0.04 - 0.012;
        d.x += d.vx;
        d.y += d.vy;
        d.life -= d.decay;
        if (d.life <= 0) {
          d.pt.state = 0;
          dust[i] = dust[dust.length - 1];
          dust.pop();
        }
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];
        const s = d.size * (0.45 + 0.55 * d.life);
        ctx.globalAlpha = d.life;
        ctx.fillStyle = d.color;
        ctx.fillRect(d.x + PAD - s / 2, d.y + PAD - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      if (!visible) return;
      step();
      render();
      raf = requestAnimationFrame(loop);
    };

    build();

    const onMove = (e) => {
      const r = textEl.getBoundingClientRect();
      mx = e.clientX - r.left;
      my = e.clientY - r.top;
      hovering = true;
      // First-ever hover plays the full snap instead of the local crumble.
      if (!snapPlayed) {
        snapPlayed = true;
        snap = { t: 0 };
      }
      textEl.style.setProperty('--dx', `${mx}px`);
      textEl.style.setProperty('--dy', `${my}px`);
    };
    const onLeave = () => {
      hovering = false;
      mx = -9999;
      my = -9999;
      // Park the mask hole offscreen — the text is instantly whole again.
      textEl.style.setProperty('--dx', '-9999px');
      textEl.style.setProperty('--dy', '-9999px');
    };
    wrap.addEventListener('pointermove', onMove, { passive: true });
    wrap.addEventListener('pointerleave', onLeave);

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !visible) {
        visible = true;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting) {
        visible = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(wrap);

    let resizeT;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeT);
      resizeT = setTimeout(build, 150);
    });
    ro.observe(textEl);
    // Re-sample once webfonts land — metrics can shift after first paint.
    document.fonts?.ready.then(() => { if (canvasRef.current) build(); });

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      io.disconnect();
      ro.disconnect();
      wrap.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, [text]);

  return (
    <span ref={wrapRef} className={styles.dustWrap}>
      <span ref={textRef} className={`${className} ${styles.dustText}`}>{text}</span>
      <canvas ref={canvasRef} className={styles.dustCanvas} aria-hidden="true" />
    </span>
  );
}
