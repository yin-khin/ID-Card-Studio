import { useEffect } from 'react';
import { X } from 'lucide-react';
import CardFrame from './CardFrame.jsx';
import IdCard from './IdCard.jsx';
import { dims } from '../lib/helpers.js';

// Full-size preview of both card sides.
export default function PreviewModal({ data, design, onClose }) {
  const { W, H } = dims(design.orientation);
  const portrait = design.orientation === 'portrait';

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className={`max-h-full w-full overflow-auto rounded-2xl bg-slate-100 p-5 shadow-2xl ${portrait ? 'max-w-4xl' : 'max-w-3xl'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Card preview</h2>
            <p className="text-xs text-slate-500">CR80 · 85.60 × 53.98 mm · front and back</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-200" aria-label="Close preview">
            <X size={18} />
          </button>
        </div>
        <div className={`grid gap-6 ${portrait ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
          {['front', 'back'].map((side) => (
            <figure key={side}>
              <figcaption className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{side}</figcaption>
              <CardFrame W={W} H={H} radius={design.radius}>
                <IdCard side={side} data={data} design={design} />
              </CardFrame>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
