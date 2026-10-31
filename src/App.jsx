import { useCallback, useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  Check,
  Download,
  Eye,
  FileText,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Palette,
  Printer,
  RotateCcw,
  Save,
  ScrollText,
  Sparkles,
  UserRound,
} from 'lucide-react';
import IdCard from './components/IdCard.jsx';
import CardFrame from './components/CardFrame.jsx';
import PreviewModal from './components/PreviewModal.jsx';
import {
  Button,
  ColorInput,
  ImageUpload,
  RangeInput,
  Section,
  Segmented,
  SelectInput,
  TextArea,
  TextInput,
  Toggle,
} from './components/ui.jsx';
import { FONTS, TEMPLATES, blankData, defaultData, defaultDesign, dims } from './lib/helpers.js';
import { buildPdf, pngBlobWithDpi, printCards, renderCard, saveBlob } from './lib/exporter.js';

const STORAGE_KEY = 'id-card-studio:design:v1';

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [data, setData] = useState(defaultData);
  const [design, setDesign] = useState(defaultDesign);
  const [dpi, setDpi] = useState(600);
  const [guide, setGuide] = useState(false);
  const [stacked, setStacked] = useState(false);
  const [modal, setModal] = useState(false);
  const [busy, setBusy] = useState('');
  const [toast, setToast] = useState(null);
  const [hasSaved, setHasSaved] = useState(() => !!loadSaved());

  const frontRef = useRef(null);
  const backRef = useRef(null);
  const toastTimer = useRef(null);

  const { W, H } = dims(design.orientation);
  const setD = (key) => (value) => setData((d) => ({ ...d, [key]: value }));
  const setS = (patch) => setDesign((s) => ({ ...s, ...patch }));

  const notify = useCallback((msg, tone = 'ok') => {
    setToast({ msg, tone });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  // Landscape cards can only put the photo left/right
  useEffect(() => {
    if (design.orientation === 'landscape' && design.photoPosition === 'center') setDesign((s) => ({ ...s, photoPosition: 'left' }));
  }, [design.orientation, design.photoPosition]);

  const applyTemplate = (t) =>
    setDesign((s) => ({
      ...s,
      template: t.id,
      primary: t.primary,
      secondary: t.secondary,
      background: t.background,
      accent: t.accent,
      layout: t.layout,
      font: t.font,
    }));

  // ---------- actions ----------
  const run = async (label, fn) => {
    if (busy) return;
    setBusy(label);
    try {
      await fn();
    } catch (err) {
      console.error(err);
      notify(`Export failed: ${err.message || err}`, 'err');
    } finally {
      setBusy('');
    }
  };

  const renderBoth = async () => {
    const front = await renderCard(frontRef.current, design.orientation, dpi);
    const back = await renderCard(backRef.current, design.orientation, dpi);
    return { front, back };
  };

  const slug = (data.fullName || 'employee').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'employee';

  const downloadPdf = () =>
    run('pdf', async () => {
      const { front, back } = await renderBoth();
      buildPdf(front, back, design.orientation).save(`id-card-${slug}.pdf`);
      notify('PDF downloaded — two pages, exact CR80 size.');
    });

  const downloadPng = () =>
    run('png', async () => {
      const { front, back } = await renderBoth();
      saveBlob(pngBlobWithDpi(front, dpi), `id-card-${slug}-front.png`);
      setTimeout(() => saveBlob(pngBlobWithDpi(back, dpi), `id-card-${slug}-back.png`), 350);
      notify(`PNG front and back downloaded (${dpi} DPI).`);
    });

  const print = () =>
    run('print', async () => {
      const { front, back } = await renderBoth();
      printCards(front, back, design.orientation);
    });

  const saveDesign = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ data, design, dpi, savedAt: Date.now() }));
      setHasSaved(true);
      notify('Design saved in this browser.');
    } catch {
      notify('Could not save — browser storage is full or blocked. Try removing large images.', 'err');
    }
  };

  const loadDesign = () => {
    const saved = loadSaved();
    if (!saved) return notify('Nothing saved yet.', 'err');
    setData({ ...defaultData, ...saved.data });
    setDesign({ ...defaultDesign, ...saved.design });
    if (saved.dpi) setDpi(saved.dpi);
    notify('Saved design loaded.');
  };

  const resetForm = () => {
    if (window.confirm('Clear all entered information? Your design settings are kept.')) {
      setData(blankData);
      notify('Form cleared.');
    }
  };

  const Btn = ({ id, ...p }) => <Button {...p} disabled={!!busy} icon={busy === id ? Loader2 : p.icon} />;

  const cardPair = (
    <div className={`grid gap-6 ${stacked ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
      {['front', 'back'].map((side) => (
        <figure key={side} className={stacked && design.orientation === 'portrait' ? 'mx-auto w-full max-w-[320px]' : ''}>
          <figcaption className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>{side} side</span>
            <span className="font-normal normal-case text-slate-400">{design.orientation === 'portrait' ? '53.98 × 85.60 mm' : '85.60 × 53.98 mm'}</span>
          </figcaption>
          <CardFrame W={W} H={H} radius={design.radius} guide={guide}>
            <IdCard side={side} data={data} design={design} />
          </CardFrame>
        </figure>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <BadgeCheck size={20} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-bold leading-tight text-slate-900">ID Card Studio</h1>
            <p className="truncate text-xs text-slate-500">Employee ID card generator · CR80 print-ready</p>
          </div>
          {hasSaved && (
            <Button icon={FolderOpen} onClick={loadDesign} className="hidden sm:inline-flex">
              Load saved
            </Button>
          )}
          <Button icon={Save} onClick={saveDesign}>
            <span className="hidden sm:inline">Save design</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-6 px-4 py-6 lg:grid-cols-[minmax(380px,520px)_1fr]">
        {/* ---------------- LEFT: form ---------------- */}
        <div className="order-2 space-y-3 lg:order-1">
          <Section icon={Building2} title="Company information">
            <TextInput label="Company name" value={data.companyName} onChange={setD('companyName')} placeholder="NAME COMPANY" />
            <TextInput label="Company tagline" value={data.tagline} onChange={setD('tagline')} placeholder="Your tagline here" />
            <ImageUpload label="Company logo" value={data.logo} onChange={setD('logo')} maxDim={800} hint="PNG with transparent background works best." />
            <div className="col-span-2 grid gap-3 sm:col-span-1">
              <TextInput label="Company phone" value={data.companyPhone} onChange={setD('companyPhone')} full />
            </div>
            <TextInput label="Company address" value={data.address} onChange={setD('address')} full />
          </Section>

          <Section icon={UserRound} title="Employee information">
            <TextInput label="Full name" value={data.fullName} onChange={setD('fullName')} placeholder="Alex Morgan" />
            <TextInput label="Employee ID" value={data.employeeId} onChange={setD('employeeId')} />
            <ImageUpload label="Employee photo" value={data.photo} onChange={setD('photo')} maxDim={1000} round />
            <div className="col-span-2 grid gap-3 sm:col-span-1">
              <TextInput label="Job position" value={data.jobTitle} onChange={setD('jobTitle')} full />
              <TextInput label="Department" value={data.department} onChange={setD('department')} full />
            </div>
            <TextInput label="Date of birth" type="date" value={data.dob} onChange={setD('dob')} />
            <SelectInput label="Gender" value={data.gender} onChange={setD('gender')} options={['', 'Male', 'Female', 'Other']} />
            <TextInput label="Phone number" value={data.phone} onChange={setD('phone')} />
            <TextInput label="Email address" type="email" value={data.email} onChange={setD('email')} />
            <TextInput label="Issue date" type="date" value={data.issueDate} onChange={setD('issueDate')} />
            <TextInput label="Expiration date" type="date" value={data.expiryDate} onChange={setD('expiryDate')} />
            <TextInput
              label="Barcode value"
              value={data.barcodeValue}
              onChange={setD('barcodeValue')}
              placeholder="Defaults to the employee ID"
            />
            <SelectInput
              label="Barcode type"
              value={data.barcodeFormat}
              onChange={setD('barcodeFormat')}
              options={[
                { value: 'CODE128', label: 'Code 128' },
                { value: 'CODE39', label: 'Code 39' },
              ]}
            />
          </Section>

          <Section icon={ScrollText} title="Back of card" defaultOpen={false}>
            <TextArea
              label="Terms and conditions"
              rows={4}
              value={data.terms}
              onChange={setD('terms')}
              hint="One item per line. The first 5 (portrait) or 4 (landscape) lines are shown."
            />
            <TextInput label="Emergency contact" value={data.emergencyContact} onChange={setD('emergencyContact')} full />
            <TextInput label="Company website" value={data.website} onChange={setD('website')} />
            <TextInput label="Additional information" value={data.additionalInfo} onChange={setD('additionalInfo')} />
            <ImageUpload label="Authorized signature" value={data.signature} onChange={setD('signature')} maxDim={900} hint="Transparent PNG recommended. Otherwise the name is shown as a script signature." />
            <div className="col-span-2 grid gap-3 sm:col-span-1">
              <SelectInput
                label="QR code content"
                value={data.qrMode}
                onChange={setD('qrMode')}
                full
                options={[
                  { value: 'vcard', label: 'Employee contact (vCard)' },
                  { value: 'website', label: 'Company website' },
                  { value: 'custom', label: 'Custom text / URL' },
                ]}
              />
              {data.qrMode === 'custom' && <TextInput label="QR text / URL" value={data.qrValue} onChange={setD('qrValue')} full />}
            </div>
          </Section>

          <Section icon={Palette} title="Design customization">
            <div className="col-span-2">
              <span className="mb-2 block text-xs font-medium text-slate-500">Templates</span>
              <div className="grid grid-cols-3 gap-2">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className={`rounded-xl border p-2 text-left transition hover:border-emerald-400 ${
                      design.template === t.id ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="mb-1.5 flex h-8 overflow-hidden rounded-md ring-1 ring-black/5">
                      <span className="flex-1" style={{ background: t.secondary }} />
                      <span className="flex-1" style={{ background: t.primary }} />
                      <span className="flex-1" style={{ background: t.background }} />
                    </div>
                    <span className="block truncate text-[11px] font-medium text-slate-700">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
            <ColorInput label="Primary color" value={design.primary} onChange={(v) => setS({ primary: v })} />
            <ColorInput label="Secondary color" value={design.secondary} onChange={(v) => setS({ secondary: v })} />
            <ColorInput label="Background color" value={design.background} onChange={(v) => setS({ background: v })} />
            <ColorInput label="Accent (logo frame, tagline)" value={design.accent} onChange={(v) => setS({ accent: v })} />
            <SelectInput label="Font family" value={design.font} onChange={(v) => setS({ font: v })} options={FONTS.map((f) => ({ value: f.id, label: f.label }))} />
            <SelectInput
              label="Card background"
              value={design.bgStyle}
              onChange={(v) => setS({ bgStyle: v })}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'gradient', label: 'Soft gradient' },
                { value: 'dots', label: 'Dots pattern' },
                { value: 'grid', label: 'Grid pattern' },
              ]}
            />
            <Segmented
              label="Orientation"
              value={design.orientation}
              onChange={(v) => setS({ orientation: v })}
              options={[
                { value: 'landscape', label: 'Landscape (CR80)' },
                { value: 'portrait', label: 'Portrait' },
              ]}
            />
            <Segmented
              label="Card layout"
              value={design.layout}
              onChange={(v) => setS({ layout: v })}
              options={[
                { value: 'curve', label: 'Curve' },
                { value: 'band', label: 'Diagonal' },
                { value: 'minimal', label: 'Minimal' },
              ]}
            />
            <Segmented
              label="Employee photo position"
              value={design.photoPosition}
              onChange={(v) => setS({ photoPosition: v })}
              options={
                design.orientation === 'portrait'
                  ? [
                      { value: 'left', label: 'Left' },
                      { value: 'center', label: 'Center' },
                      { value: 'right', label: 'Right' },
                    ]
                  : [
                      { value: 'left', label: 'Left' },
                      { value: 'right', label: 'Right' },
                    ]
              }
            />
            <Segmented
              label="Photo shape"
              value={design.photoShape}
              onChange={(v) => setS({ photoShape: v })}
              options={[
                { value: 'circle', label: 'Circle' },
                { value: 'rounded', label: 'Rounded' },
                { value: 'square', label: 'Square' },
              ]}
            />
            <RangeInput label="Logo size" value={design.logoSize} min={60} max={150} step={5} unit="%" onChange={(v) => setS({ logoSize: v })} />
            <RangeInput label="Corner radius" value={design.radius} min={0} max={60} unit=" px" onChange={(v) => setS({ radius: v })} />
            <Toggle label="Hexagon logo frame" checked={design.logoFrame} onChange={(v) => setS({ logoFrame: v })} />
            <Toggle label="Show gender on front" checked={design.showGender} onChange={(v) => setS({ showGender: v })} />
            <Toggle label="Show email on card" checked={design.showEmail} onChange={(v) => setS({ showEmail: v })} />
          </Section>
        </div>

        {/* ---------------- RIGHT: preview ---------------- */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-[76px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Sparkles size={16} className="text-emerald-600" /> Live preview
                  </h2>
                  <p className="text-xs text-slate-500">Updates as you type. Exports match this preview exactly.</p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input type="checkbox" className="accent-emerald-500" checked={stacked} onChange={(e) => setStacked(e.target.checked)} />
                    Stack cards (larger)
                  </label>
                  <label className="flex cursor-pointer items-center gap-1.5">
                    <input type="checkbox" className="accent-emerald-500" checked={guide} onChange={(e) => setGuide(e.target.checked)} />
                    3 mm safe area
                  </label>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 p-4 sm:p-6">{cardPair}</div>

              {/* actions */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <Btn id="preview" icon={Eye} onClick={() => setModal(true)}>
                  Preview card
                </Btn>
                <Btn id="pdf" icon={FileText} variant="primary" onClick={downloadPdf}>
                  Download PDF
                </Btn>
                <Btn id="png" icon={ImageIcon} variant="primary" onClick={downloadPng}>
                  Download PNG
                </Btn>
                <Btn id="print" icon={Printer} variant="dark" onClick={print}>
                  Print card
                </Btn>
                <Btn id="save" icon={Save} onClick={saveDesign}>
                  Save design
                </Btn>
                <Btn id="reset" icon={RotateCcw} variant="danger" onClick={resetForm}>
                  Reset form
                </Btn>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Download size={13} /> Export resolution
                  <select
                    value={dpi}
                    onChange={(e) => setDpi(Number(e.target.value))}
                    className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-xs text-slate-700"
                  >
                    <option value={300}>300 DPI (standard)</option>
                    <option value={600}>600 DPI (high quality)</option>
                    <option value={900}>900 DPI (max)</option>
                  </select>
                </span>
                <button type="button" onClick={() => setData(defaultData)} className="text-emerald-700 hover:underline">
                  Load sample data
                </button>
              </div>
              <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
                PDF = 2 pages at {design.orientation === 'portrait' ? '53.98 × 85.60' : '85.60 × 53.98'} mm containing only the cards. For printing, choose
                “Actual size / 100%” and no margins.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Off-screen full-size cards used for export/print — never scaled, never includes the UI */}
      <div aria-hidden="true" style={{ position: 'fixed', left: -100000, top: 0, pointerEvents: 'none' }}>
        <IdCard ref={frontRef} side="front" data={data} design={design} />
        <IdCard ref={backRef} side="back" data={data} design={design} />
      </div>

      {modal && <PreviewModal data={data} design={design} onClose={() => setModal(false)} />}

      {toast && (
        <div
          role="status"
          className={`fixed bottom-5 left-1/2 z-50 flex max-w-[92vw] -translate-x-1/2 items-center gap-2 rounded-xl px-4 py-3 text-sm text-white shadow-lg ${
            toast.tone === 'err' ? 'bg-rose-600' : 'bg-slate-900'
          }`}
        >
          {toast.tone === 'err' ? null : <Check size={16} className="text-emerald-400" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}
