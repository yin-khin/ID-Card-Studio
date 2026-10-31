import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { BASE_DPI, MM, dims } from './helpers.js';

// ---- PNG with correct physical size (pHYs chunk) ----
function crc32(bytes) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let k = 0; k < 8; k++) crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function pngBlobWithDpi(dataUrl, dpi) {
  const bin = atob(dataUrl.split(',')[1]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);

  const ppm = Math.round(dpi / 0.0254);
  const chunk = new Uint8Array(21);
  const dv = new DataView(chunk.buffer);
  dv.setUint32(0, 9);
  chunk.set([0x70, 0x48, 0x59, 0x73], 4); // 'pHYs'
  dv.setUint32(8, ppm);
  dv.setUint32(12, ppm);
  chunk[16] = 1; // metres
  dv.setUint32(17, crc32(chunk.subarray(4, 17)));

  const IHDR_END = 33; // 8-byte signature + 25-byte IHDR chunk
  const out = new Uint8Array(bytes.length + chunk.length);
  out.set(bytes.subarray(0, IHDR_END), 0);
  out.set(chunk, IHDR_END);
  out.set(bytes.subarray(IHDR_END), IHDR_END + chunk.length);
  return new Blob([out], { type: 'image/png' });
}

// Render one card node to a PNG data URL at the requested print resolution.
export async function renderCard(node, orientation, dpi = 600) {
  const { W, H } = dims(orientation);
  // let QR codes / images settle before capture
  await new Promise((r) => setTimeout(r, 120));
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  return toPng(node, {
    pixelRatio: dpi / BASE_DPI,
    width: W,
    height: H,
    cacheBust: true,
    style: { margin: '0', transform: 'none' },
  });
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function pageSize(orientation) {
  return orientation === 'portrait' ? { w: MM.SHORT, h: MM.LONG } : { w: MM.LONG, h: MM.SHORT };
}

// Two pages, each exactly 85.60 x 53.98 mm (or rotated), card only.
export function buildPdf(frontUrl, backUrl, orientation) {
  const { w, h } = pageSize(orientation);
  const o = orientation === 'portrait' ? 'portrait' : 'landscape';
  const pdf = new jsPDF({ orientation: o, unit: 'mm', format: [w, h], compress: true });
  pdf.setProperties({ title: 'Employee ID Card', subject: 'CR80 85.60 x 53.98 mm' });
  pdf.addImage(frontUrl, 'PNG', 0, 0, w, h, 'front');
  pdf.addPage([w, h], o);
  pdf.addImage(backUrl, 'PNG', 0, 0, w, h, 'back');
  return pdf;
}

// Print through a hidden iframe so only the two cards reach the printer.
export function printCards(frontUrl, backUrl, orientation) {
  const { w, h } = pageSize(orientation);
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden';
  iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"><title>ID Card</title>
<style>
@page { size: ${w}mm ${h}mm; margin: 0; }
html, body { margin: 0; padding: 0; background: #fff; }
img { display: block; width: ${w}mm; height: ${h}mm; page-break-after: always; break-after: page; }
img:last-child { page-break-after: auto; break-after: auto; }
</style></head><body><img src="${frontUrl}"><img src="${backUrl}"></body></html>`;
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => iframe.remove(), 60000);
    }, 250);
  };
  document.body.appendChild(iframe);
}
