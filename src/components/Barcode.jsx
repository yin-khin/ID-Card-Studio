import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

// Renders a barcode as a stretchable SVG (fills its parent box).
export default function Barcode({ value, format = 'CODE128', color = '#000' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const draw = (fmt) =>
      JsBarcode(el, value || ' ', {
        format: fmt,
        displayValue: false,
        margin: 0,
        width: 2,
        height: 80,
        lineColor: color,
        background: 'transparent',
      });
    try {
      draw(format);
    } catch {
      try {
        draw('CODE128');
      } catch {
        el.innerHTML = '';
        return;
      }
    }
    const w = parseFloat(el.getAttribute('width'));
    const h = parseFloat(el.getAttribute('height'));
    el.setAttribute('viewBox', `0 0 ${w} ${h}`);
    el.removeAttribute('width');
    el.removeAttribute('height');
    el.setAttribute('preserveAspectRatio', 'none');
  }, [value, format, color]);

  return <svg ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />;
}
