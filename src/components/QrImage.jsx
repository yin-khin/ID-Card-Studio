import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// Dynamically generated QR code (always black on white so it scans reliably).
export default function QrImage({ text, size }) {
  const [url, setUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(text || ' ', {
      margin: 0,
      width: 512,
      errorCorrectionLevel: 'M',
      color: { dark: '#000000', light: '#ffffff' },
    })
      .then((u) => !cancelled && setUrl(u))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [text]);

  return url ? (
    <img src={url} alt="QR code" style={{ width: size, height: size, display: 'block', imageRendering: 'pixelated' }} />
  ) : (
    <div style={{ width: size, height: size, background: '#fff' }} />
  );
}
