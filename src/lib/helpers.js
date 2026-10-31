// CR80 card: 85.60 x 53.98 mm. The card is designed on a 10 px = 1 mm canvas
// so every export can be scaled to an exact physical size.
export const MM = { LONG: 85.6, SHORT: 53.98 };
export const PX_PER_MM = 10;
export const BASE_DPI = 254; // 10 px per mm == 254 dpi

export function dims(orientation) {
  const long = MM.LONG * PX_PER_MM;
  const short = MM.SHORT * PX_PER_MM;
  return orientation === 'portrait' ? { W: short, H: long } : { W: long, H: short };
}

export const FONTS = [
  { id: 'inter', label: 'Inter (modern sans)', css: "'Inter','Segoe UI',system-ui,Helvetica,Arial,sans-serif" },
  { id: 'poppins', label: 'Poppins (rounded)', css: "'Poppins','Segoe UI',system-ui,Helvetica,Arial,sans-serif" },
  { id: 'montserrat', label: 'Montserrat (geometric)', css: "'Montserrat','Segoe UI',system-ui,Helvetica,Arial,sans-serif" },
  { id: 'oswald', label: 'Oswald (condensed)', css: "'Oswald','Arial Narrow',Impact,sans-serif" },
  { id: 'playfair', label: 'Playfair Display (serif)', css: "'Playfair Display',Georgia,'Times New Roman',serif" },
  { id: 'georgia', label: 'Georgia (classic serif)', css: "Georgia,'Times New Roman',serif" },
];
export const fontCss = (id) => (FONTS.find((f) => f.id === id) || FONTS[0]).css;

export const TEMPLATES = [
  { id: 'emerald', name: 'Emerald Curve', primary: '#6cc51d', secondary: '#0a0a0a', background: '#ffffff', accent: '#f2b705', layout: 'curve', font: 'inter' },
  { id: 'royal', name: 'Royal Blue', primary: '#2f7bf5', secondary: '#0b1b3b', background: '#ffffff', accent: '#f5c542', layout: 'band', font: 'poppins' },
  { id: 'crimson', name: 'Crimson Night', primary: '#e11d48', secondary: '#161616', background: '#ffffff', accent: '#fbbf24', layout: 'curve', font: 'montserrat' },
  { id: 'sunset', name: 'Sunset Violet', primary: '#f97316', secondary: '#3b0764', background: '#fffaf5', accent: '#a855f7', layout: 'band', font: 'poppins' },
  { id: 'teal', name: 'Teal Minimal', primary: '#0ea5a4', secondary: '#12303a', background: '#f8fafc', accent: '#0ea5a4', layout: 'minimal', font: 'inter' },
  { id: 'mono', name: 'Mono Executive', primary: '#111827', secondary: '#e5e7eb', background: '#ffffff', accent: '#b45309', layout: 'minimal', font: 'playfair' },
];

export const defaultData = {
  companyName: 'GreenLeaf Industries',
  logo: null,
  tagline: 'Growing Together',
  address: '123 Business Avenue, Phnom Penh, Cambodia',
  companyPhone: '+855 23 456 789',
  website: 'www.greenleaf.com',

  fullName: 'Alex Morgan',
  employeeId: 'EMP-2026-0142',
  photo: null,
  jobTitle: 'Senior Product Designer',
  department: 'Design Team',
  dob: '1994-06-02',
  gender: 'Male',
  phone: '+855 12 345 678',
  email: 'alex.morgan@greenleaf.com',
  issueDate: '2026-11-01',
  expiryDate: '2028-10-31',
  barcodeValue: '',
  barcodeFormat: 'CODE128',

  terms:
    'Employees are required to wear this card while on duty.\nIf the card is lost or damaged, an additional fee will be charged.\nIf you find this card, please call the number listed on the back.',
  emergencyContact: 'Jordan Morgan · +855 98 765 432',
  signature: null,
  additionalInfo: 'Blood type: O+',
  qrMode: 'vcard',
  qrValue: '',
};

export const blankData = Object.fromEntries(
  Object.entries(defaultData).map(([k, v]) => [k, k === 'barcodeFormat' ? 'CODE128' : k === 'qrMode' ? 'vcard' : v && typeof v === 'string' ? '' : null]),
);

export const defaultDesign = {
  template: 'emerald',
  primary: '#6cc51d',
  secondary: '#0a0a0a',
  background: '#ffffff',
  accent: '#f2b705',
  font: 'inter',
  layout: 'curve',
  orientation: 'portrait',
  logoSize: 100,
  logoFrame: true,
  photoPosition: 'center',
  photoShape: 'circle',
  bgStyle: 'solid',
  radius: 32,
  showGender: false,
  showEmail: false,
};

// ---------- colour helpers ----------
function parseHex(hex) {
  let h = (hex || '#000000').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const toHex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
export function mix(a, b, t) {
  const A = parseHex(a);
  const B = parseHex(b);
  return toHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}
export function rgba(hex, alpha) {
  const [r, g, b] = parseHex(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}
export function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export const readableOn = (bg) => (luminance(bg) > 0.45 ? '#111111' : '#ffffff');

export function fmtDate(iso) {
  if (!iso) return '';
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
}

export function qrText(data) {
  if (data.qrMode === 'custom' && data.qrValue) return data.qrValue;
  if (data.qrMode === 'website' && data.website) return /^https?:/i.test(data.website) ? data.website : `https://${data.website}`;
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${data.fullName || ''}`,
    `ORG:${data.companyName || ''}`,
    `TITLE:${data.jobTitle || ''}`,
    `TEL:${data.phone || ''}`,
    `EMAIL:${data.email || ''}`,
    `URL:${data.website || ''}`,
    `NOTE:ID ${data.employeeId || ''}`,
    'END:VCARD',
  ].join('\n');
}

// Read an image file, shrink it (keeps localStorage + PDF size sane) and return a data URL.
export function fileToDataUrl(file, maxDim = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      if (file.type === 'image/svg+xml') return resolve(reader.result);
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const keepAlpha = file.type === 'image/png' || file.type === 'image/webp';
        resolve(keepAlpha ? canvas.toDataURL('image/png') : canvas.toDataURL('image/jpeg', 0.92));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
