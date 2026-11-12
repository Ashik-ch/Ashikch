import { useEffect, useRef } from 'react';

export default function HeroPattern() {
  const patternRef = useRef(null);
  const trailRef = useRef(null);
  const headRef = useRef(null);
  const primaryRef = useRef(null);
  const secondaryRef = useRef(null);

  useEffect(() => {
    const pattern = patternRef.current;
    const trail = trailRef.current;
    const head = headRef.current;
    const primary = primaryRef.current;
    const secondary = secondaryRef.current;
    const hero = pattern.closest('section');
    const motionAllowed = window.matchMedia('(prefers-reduced-motion: no-preference)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let inView = false;
    let active = false;
    let frame = 0;
    let bounds = null;
    let x = 0;
    let y = 0;
    let depthX = 0;
    let depthY = 0;
    let points = [];

    const hideTrail = () => {
      pattern.dataset.pointer = 'false';
      points = [];
      trail.setAttribute('points', '');
      cancelAnimationFrame(frame);
      frame = 0;
    };
    const resetPointer = () => {
      hideTrail();
      for (const layer of [primary, secondary]) layer.style.transform = '';
      bounds = null;
    };
    const syncActivity = () => {
      active = inView && !document.hidden && motionAllowed.matches;
      pattern.dataset.active = String(active);
      if (!active || !finePointer.matches) resetPointer();
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncActivity();
    });
    observer.observe(hero);

    const movePointer = (event) => {
      if (!active || !finePointer.matches || event.pointerType !== 'mouse') return;
      // Keep hero actions clear and prevent a queued frame restoring the trail.
      if (event.target instanceof Element && event.target.closest('a, button, [role="button"]')) {
        hideTrail();
        return;
      }
      bounds ??= hero.getBoundingClientRect();
      x = event.clientX - bounds.left;
      y = event.clientY - bounds.top;
      depthX = Math.max(-1, Math.min(1, ((event.clientX - bounds.left) / bounds.width - 0.5) * 2));
      depthY = Math.max(-1, Math.min(1, ((event.clientY - bounds.top) / bounds.height - 0.5) * 2));
      if (frame) return;
      frame = requestAnimationFrame(() => {
        // Only update on pointer movement; CSS settles the two grid layers.
        primary.style.transform = `translate3d(${depthX * 24}px, ${depthY * 18}px, 0)`;
        secondary.style.transform = `translate3d(${-depthX * 12}px, ${-depthY * 9}px, 0)`;
        // Walk the grid in right-angle steps. Trim the tail instead of fading it.
        const targetX = Math.round((x + 48 - depthX * 24) / 36);
        const targetY = Math.round((y + 48 - depthY * 18) / 36);
        if (!points.length) points.push([targetX, targetY]);
        let [column, row] = points[points.length - 1];
        while (column !== targetX || row !== targetY) {
          if (Math.abs(targetX - column) >= Math.abs(targetY - row)) {
            column += Math.sign(targetX - column);
          } else {
            row += Math.sign(targetY - row);
          }
          points.push([column, row]);
          if (points.length > 14) points.shift();
        }
        trail.setAttribute('points', points.map(([col, line]) => `${col * 36},${line * 36}`).join(' '));
        head.setAttribute('x', String(targetX * 36 - 4));
        head.setAttribute('y', String(targetY * 36 - 4));
        pattern.dataset.pointer = 'true';
        frame = 0;
      });
    };

    const onKeyDown = (event) => { if (event.key === 'Tab') resetPointer(); };
    hero.addEventListener('pointermove', movePointer, { passive: true });
    hero.addEventListener('pointerleave', resetPointer);
    hero.addEventListener('pointercancel', resetPointer);
    window.addEventListener('scroll', resetPointer, { passive: true });
    window.addEventListener('resize', resetPointer, { passive: true });
    window.addEventListener('blur', resetPointer);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', syncActivity);
    motionAllowed.addEventListener('change', syncActivity);
    finePointer.addEventListener('change', syncActivity);
    return () => {
      observer.disconnect();
      resetPointer();
      hero.removeEventListener('pointermove', movePointer);
      hero.removeEventListener('pointerleave', resetPointer);
      hero.removeEventListener('pointercancel', resetPointer);
      window.removeEventListener('scroll', resetPointer);
      window.removeEventListener('resize', resetPointer);
      window.removeEventListener('blur', resetPointer);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', syncActivity);
      motionAllowed.removeEventListener('change', syncActivity);
      finePointer.removeEventListener('change', syncActivity);
    };
  }, []);

  return (
    <div ref={patternRef} className="hero-pattern" data-active="false" aria-hidden="true">
      <div className="hero-pattern-atmosphere" />
      <div ref={secondaryRef} className="hero-parallax-layer hero-parallax-secondary hero-grid-nodes" />
      <div ref={primaryRef} className="hero-parallax-layer hero-parallax-primary hero-grid-lines">
        <div className="hero-grid-cells" />
        <svg className="hero-grid-snake" width="100%" height="100%" focusable="false">
          <polyline ref={trailRef} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
          <rect ref={headRef} width="8" height="8" rx="1" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
