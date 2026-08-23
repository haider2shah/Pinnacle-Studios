'use client';

import { useEffect, useRef } from 'react';
import styles from './Cursor.module.css';

const LINK_SELECTOR = 'a,button,[role="button"],input,textarea,select';

function getCursorMode(target) {
  if (!(target instanceof Element)) return null;
  if (target.closest('[data-card]')) return 'view';
  if (target.closest('[data-cursor="san-francisco"]')) return 'sf';
  if (target.closest(LINK_SELECTOR)) return 'link';
  return null;
}

export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const shouldHideCursor = () =>
      window.matchMedia('(hover: none), (pointer: coarse), (max-width: 767px)').matches;
    if (shouldHideCursor()) return;
    const isLoadingOverlayActive = () => document.body.classList.contains('loading-overlay-active');

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let rafId = 0;
    let currentMode = null;
    const body = document.body;

    const setMode = (mode) => {
      body.classList.toggle('cur-link', mode === 'link');
      body.classList.toggle('cur-view', mode === 'view');
      body.classList.toggle('cur-sf', mode === 'sf');
    };

    body.classList.add('cur-active');

    const updateDot = (x, y) => {
      dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    const onMove = (event) => {
      if (event.pointerType && event.pointerType !== 'mouse' && event.pointerType !== 'pen') return;

      if (isLoadingOverlayActive()) {
        deactivateCursor();
        return;
      }

      body.classList.add('cur-active');

      const mode = getCursorMode(event.target);
      if (mode !== currentMode) {
        currentMode = mode;
        setMode(mode);
      }

      if (!(event.target instanceof Element)) {
        return;
      }

      mx = event.clientX;
      my = event.clientY;
      updateDot(mx, my);
    };

    const tick = () => {
      rx += (mx - rx) * 0.2;
      ry += (my - ry) * 0.2;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      rafId = window.requestAnimationFrame(tick);
    };

    const onDown = () => document.body.classList.add('cur-down');
    const onUp = () => document.body.classList.remove('cur-down');
    const deactivateCursor = () => {
      body.classList.remove('cur-active', 'cur-view', 'cur-link', 'cur-sf', 'cur-down');
      currentMode = null;
    };
    const onDocumentOut = (event) => {
      if (event.relatedTarget || event.toElement) return;
      deactivateCursor();
    };
    const onVisibilityChange = () => {
      if (document.hidden) deactivateCursor();
    };
    const onViewportChange = () => {
      if (shouldHideCursor()) deactivateCursor();
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseout', onDocumentOut);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('blur', deactivateCursor);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('resize', onViewportChange);
    rafId = window.requestAnimationFrame(tick);

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseout', onDocumentOut);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('blur', deactivateCursor);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('resize', onViewportChange);
      window.cancelAnimationFrame(rafId);
      document.body.classList.remove('cur-active', 'cur-view', 'cur-link', 'cur-sf', 'cur-down');
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className={styles.cursorDot} aria-hidden="true" />
      <div ref={ringRef} className={styles.cursorRing} aria-hidden="true" />
    </>
  );
}
