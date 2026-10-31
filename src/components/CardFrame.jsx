import { useLayoutEffect, useRef, useState } from 'react';

// Scales a fixed-size card (design px) to fit the width of its container.
// `guide` draws a dashed 3 mm safe-area overlay (preview only, never exported).
export default function CardFrame({ W, H, children, guide = false, radius = 0, maxScale = 1, className = '' }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(0.4);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setScale(Math.min(maxScale, Math.max(0.05, el.clientWidth / W)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [W, maxScale]);

  return (
    <div ref={ref} className={className} style={{ width: '100%', height: H * scale, position: 'relative' }}>
      <div style={{ width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left', position: 'absolute', top: 0, left: 0 }}>
        <div style={{ width: W, height: H, boxShadow: '0 18px 40px -12px rgba(15,23,42,.45), 0 4px 10px rgba(15,23,42,.15)', borderRadius: radius }}>
          {children}
        </div>
        {guide && (
          <div
            style={{
              position: 'absolute',
              inset: 30,
              border: '2px dashed rgba(239,68,68,.85)',
              borderRadius: Math.max(0, radius - 30),
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
    </div>
  );
}
