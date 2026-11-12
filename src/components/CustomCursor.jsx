import { useEffect, useRef } from 'react';

const INTERACTIVE = 'a[href], button:not(:disabled), [role="button"], summary, .interactive';
const NATIVE_CURSOR = 'input, textarea, select, [contenteditable]:not([contenteditable="false"]), iframe, [data-native-cursor]';

export default function CustomCursor() {
  const rootRef = useRef(null);
  const dotRef = useRef(null);
  const ringRef = useRef(null);

  useEffect(() => {
    const media = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    let detach = () => {};

    const configure = () => {
      detach();
      if (!media.matches) return;

      let frame = 0;
      let visible = false;
      let targetX = 0;
      let targetY = 0;
      let ringX = 0;
      let ringY = 0;
      let lastTime = 0;

      const hide = () => {
        visible = false;
        root.dataset.visible = 'false';
        root.dataset.pressed = 'false';
        document.documentElement.classList.remove('cinematic-cursor-active');
        cancelAnimationFrame(frame);
        frame = 0;
        lastTime = 0;
      };

      const draw = (time) => {
        frame = 0;
        const delta = lastTime ? Math.min(time - lastTime, 64) : 16;
        lastTime = time;
        const follow = 1 - Math.exp(-delta / 65);
        ringX += (targetX - ringX) * follow;
        ringY += (targetY - ringY) * follow;
        dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;

        if (Math.abs(targetX - ringX) + Math.abs(targetY - ringY) > 0.1) {
          frame = requestAnimationFrame(draw);
        } else {
          ring.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
          lastTime = 0;
        }
      };

      const move = (event) => {
        if (event.pointerType !== 'mouse' || !(event.target instanceof Element) || event.target.closest(NATIVE_CURSOR)) {
          hide();
          return;
        }
        targetX = event.clientX;
        targetY = event.clientY;
        root.dataset.hover = String(Boolean(event.target.closest(INTERACTIVE)));
        if (!visible) {
          // Appear at the pointer instead of flying in from the corner.
          ringX = targetX;
          ringY = targetY;
          dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0)`;
          ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
          visible = true;
          root.dataset.visible = 'true';
          document.documentElement.classList.add('cinematic-cursor-active');
        }
        if (!frame) frame = requestAnimationFrame(draw);
      };

      const press = (event) => {
        if (visible && event.pointerType === 'mouse') root.dataset.pressed = 'true';
      };
      const release = () => { root.dataset.pressed = 'false'; };
      const leave = (event) => { if (!event.relatedTarget) hide(); };
      const keyboard = (event) => { if (event.key === 'Tab') hide(); };
      const visibility = () => { if (document.hidden) hide(); };

      document.addEventListener('pointermove', move, { passive: true });
      document.addEventListener('pointerover', move, { passive: true });
      document.addEventListener('pointerdown', press, { passive: true });
      document.addEventListener('pointerup', release, { passive: true });
      document.addEventListener('pointercancel', hide);
      document.addEventListener('pointerout', leave);
      document.addEventListener('keydown', keyboard);
      document.addEventListener('visibilitychange', visibility);
      window.addEventListener('blur', hide);
      window.addEventListener('scroll', hide, { passive: true });

      detach = () => {
        hide();
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerover', move);
        document.removeEventListener('pointerdown', press);
        document.removeEventListener('pointerup', release);
        document.removeEventListener('pointercancel', hide);
        document.removeEventListener('pointerout', leave);
        document.removeEventListener('keydown', keyboard);
        document.removeEventListener('visibilitychange', visibility);
        window.removeEventListener('blur', hide);
        window.removeEventListener('scroll', hide);
      };
    };

    configure();
    media.addEventListener('change', configure);
    return () => {
      detach();
      media.removeEventListener('change', configure);
    };
  }, []);

  return (
    <div ref={rootRef} className="cinematic-cursor" data-visible="false" aria-hidden="true">
      <div ref={dotRef} className="cinematic-cursor-dot"><span /></div>
      <div ref={ringRef} className="cinematic-cursor-ring"><span /></div>
    </div>
  );
}
