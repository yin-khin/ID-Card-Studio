import { useRef, useState } from 'react';
import { ChevronDown, ImagePlus, Trash2, Upload } from 'lucide-react';
import { fileToDataUrl } from '../lib/helpers.js';

export function Section({ icon: Icon, title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-50"
      >
        {Icon && (
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Icon size={17} />
          </span>
        )}
        <span className="flex-1 text-sm font-semibold text-slate-800">{title}</span>
        <ChevronDown size={18} className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-4">{children}</div>}
    </section>
  );
}

export function Field({ label, children, full = false, hint }) {
  return (
    <label className={`block ${full ? 'col-span-2' : 'col-span-2 sm:col-span-1'}`}>
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20';

export function TextInput({ label, value, onChange, type = 'text', placeholder, full, hint }) {
  return (
    <Field label={label} full={full} hint={hint}>
      <input type={type} className={inputCls} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function TextArea({ label, value, onChange, rows = 3, placeholder, hint }) {
  return (
    <Field label={label} full hint={hint}>
      <textarea rows={rows} className={inputCls} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </Field>
  );
}

export function SelectInput({ label, value, onChange, options, full, hint }) {
  return (
    <Field label={label} full={full} hint={hint}>
      <select className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function ColorInput({ label, value, onChange }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg" />
        <input
          className={`${inputCls} font-mono uppercase`}
          value={value}
          maxLength={7}
          onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)}
        />
      </div>
    </Field>
  );
}

export function RangeInput({ label, value, onChange, min, max, step = 1, unit = '' }) {
  return (
    <Field label={`${label}: ${value}${unit}`}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-emerald-500"
      />
    </Field>
  );
}

export function Segmented({ label, value, onChange, options, full = true }) {
  return (
    <Field label={label} full={full}>
      <div className="flex rounded-lg bg-slate-100 p-1">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
              value === o.value ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

export function Toggle({ label, checked, onChange }) {
  return (
    <label className="col-span-2 flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 px-3 py-2 sm:col-span-1">
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-emerald-500" />
    </label>
  );
}

export function ImageUpload({ label, value, onChange, maxDim = 1200, hint, round = false }) {
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const pick = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setBusy(true);
    try {
      onChange(await fileToDataUrl(file, maxDim));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col-span-2 sm:col-span-1">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files[0]);
        }}
        className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-2.5"
      >
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden bg-white ring-1 ring-slate-200 ${
            round ? 'rounded-full' : 'rounded-lg'
          }`}
        >
          {value ? <img src={value} alt={label} className="h-full w-full object-contain" /> : <ImagePlus size={20} className="text-slate-300" />}
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-1">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50"
          >
            <Upload size={13} /> {busy ? 'Loading…' : value ? 'Replace' : 'Upload'}
          </button>
          {value && (
            <button type="button" onClick={() => onChange(null)} className="inline-flex items-center gap-1 text-[11px] text-rose-500 hover:underline">
              <Trash2 size={11} /> Remove
            </button>
          )}
        </div>
        <input ref={ref} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files[0]) || (e.target.value = '')} />
      </div>
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </div>
  );
}

export function Button({ icon: Icon, children, variant = 'secondary', className = '', ...rest }) {
  const styles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20',
    dark: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50',
    danger: 'bg-white text-rose-600 ring-1 ring-rose-200 hover:bg-rose-50',
  };
  return (
    <button
      type="button"
      {...rest}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
