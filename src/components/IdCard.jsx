import { forwardRef } from 'react';
import Barcode from './Barcode.jsx';
import QrImage from './QrImage.jsx';
import LogoMark from './LogoMark.jsx';
import { dims, fmtDate, fontCss, mix, qrText, readableOn, rgba } from '../lib/helpers.js';

// ---------------------------------------------------------------------------
// Decorative shapes (design space: 10 px = 1 mm). Paths are written for a
// 540-wide portrait card or an 856-wide landscape card.
// ---------------------------------------------------------------------------
const FRONT_ART = {
  portrait: {
    curve: {
      dark: 'M0,0H540V250C470,300 380,470 230,470C130,470 40,420 0,380Z',
      accent: 'M0,380C40,420 130,470 230,470C380,470 470,300 540,250V288C480,345 400,505 220,498C110,494 40,447 0,410Z',
    },
    band: { dark: 'M0,0H540V300L0,390Z', accent: 'M0,390L540,300V334L0,424Z' },
    minimal: { dark: 'M0,0H540V310H0Z', accent: 'M0,310H540V332H0Z' },
  },
  landscape: {
    curve: {
      dark: 'M0,0H300C360,120 350,400 250,540H0Z',
      accent: 'M300,0H340C412,120 398,410 292,540H250C350,400 360,120 300,0Z',
    },
    band: { dark: 'M0,0H320L270,540H0Z', accent: 'M320,0H358L308,540H270Z' },
    minimal: { dark: 'M0,0H280V540H0Z', accent: 'M280,0H300V540H280Z' },
  },
};

const BACK_ART = {
  portrait: {
    curve: {
      wave: 'M0,775C150,715 330,835 540,730V856H0Z',
      dark: 'M0,812C160,765 320,852 540,780V856H0Z',
      accent: 'M0,842C170,822 350,868 540,828V856H0Z',
    },
    band: { wave: 'M0,800L540,740V856H0Z', dark: 'M0,822L540,772V856H0Z', accent: 'M0,842L540,806V856H0Z' },
    minimal: { wave: 'M0,820H540V856H0Z', dark: 'M0,836H540V856H0Z', accent: 'M0,846H540V856H0Z' },
  },
  landscape: {
    curve: {
      wave: 'M0,478C200,430 450,520 856,450V540H0Z',
      dark: 'M0,502C220,462 460,530 856,486V540H0Z',
      accent: 'M0,526C240,508 480,540 856,516V540H0Z',
    },
    band: { wave: 'M0,500L856,455V540H0Z', dark: 'M0,512L856,482V540H0Z', accent: 'M0,526L856,506V540H0Z' },
    minimal: { wave: 'M0,508H856V540H0Z', dark: 'M0,520H856V540H0Z', accent: 'M0,530H856V540H0Z' },
  },
};

function cardBackground(design) {
  const { background: bg, primary, bgStyle } = design;
  switch (bgStyle) {
    case 'gradient':
      return { backgroundColor: bg, backgroundImage: `linear-gradient(160deg, ${bg} 50%, ${mix(bg, primary, 0.22)} 100%)` };
    case 'dots':
      return { backgroundColor: bg, backgroundImage: `radial-gradient(${rgba(primary, 0.2)} 2px, transparent 2.4px)`, backgroundSize: '22px 22px' };
    case 'grid':
      return {
        backgroundColor: bg,
        backgroundImage: `linear-gradient(${rgba(primary, 0.1)} 1px, transparent 1px), linear-gradient(90deg, ${rgba(primary, 0.1)} 1px, transparent 1px)`,
        backgroundSize: '28px 28px',
      };
    default:
      return { backgroundColor: bg };
  }
}

const abs = (style) => ({ position: 'absolute', ...style });

function Avatar({ photo, design, size }) {
  const radius = design.photoShape === 'circle' ? '50%' : design.photoShape === 'rounded' ? '22%' : 0;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        overflow: 'hidden',
        background: design.primary,
        border: `${Math.round(size * 0.04)}px solid ${design.primary}`,
        boxShadow: `0 0 0 ${Math.round(size * 0.025)}px ${rgba('#ffffff', 0.85)}`,
        boxSizing: 'border-box',
      }}
    >
      {photo ? (
        <img src={photo} alt="Employee" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      ) : (
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
          <rect width="100" height="100" fill={design.primary} />
          <circle cx="50" cy="38" r="17" fill="#d9d9d9" />
          <path d="M14,100 C14,72 30,60 50,60 C70,60 86,72 86,100Z" fill="#d9d9d9" />
        </svg>
      )}
    </div>
  );
}

function InfoRow({ label, value, design, textColor, size, labelWidth }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', fontSize: size, lineHeight: 1.35, whiteSpace: 'nowrap' }}>
      <span style={{ width: labelWidth, flexShrink: 0, color: design.primary, fontWeight: 700 }}>{label}</span>
      <span style={{ color: textColor, margin: '0 10px 0 0' }}>:</span>
      <span style={{ color: textColor, overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
    </div>
  );
}

function FrontArt({ W, H, design, mirrored }) {
  const art = FRONT_ART[design.orientation][design.layout];
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', transform: mirrored ? 'scaleX(-1)' : undefined }}
    >
      <defs>
        <linearGradient id="accentGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mix(design.primary, '#ffffff', 0.35)} />
          <stop offset="0.5" stopColor={design.primary} />
          <stop offset="1" stopColor={mix(design.primary, '#000000', 0.25)} />
        </linearGradient>
      </defs>
      <path d={art.accent} fill="url(#accentGrad)" />
      <path d={art.dark} fill={design.secondary} />
    </svg>
  );
}

function BackArt({ W, H, design }) {
  const art = BACK_ART[design.orientation][design.layout];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <defs>
        <linearGradient id="waveGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={rgba(design.primary, 0.05)} />
          <stop offset="1" stopColor={rgba(design.primary, 0.4)} />
        </linearGradient>
        <linearGradient id="accentGradBack" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={mix(design.primary, '#000000', 0.15)} />
          <stop offset="0.5" stopColor={mix(design.primary, '#ffffff', 0.3)} />
          <stop offset="1" stopColor={design.primary} />
        </linearGradient>
      </defs>
      <path d={art.wave} fill="url(#waveGrad)" />
      <path d={art.dark} fill={design.secondary} opacity="0.95" />
      <path d={art.accent} fill="url(#accentGradBack)" />
    </svg>
  );
}

function Bullet({ color }) {
  return (
    <span
      style={{
        flexShrink: 0,
        width: 22,
        height: 22,
        borderRadius: '50%',
        background: color,
        boxShadow: `inset 0 0 0 4px ${'#ffffff'}, 0 0 0 2px ${color}`,
        marginTop: 5,
      }}
    />
  );
}

function Terms({ terms, design, textColor, size, boxStyle, max = 5 }) {
  const items = (terms || '').split('\n').map((t) => t.trim()).filter(Boolean).slice(0, max);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: size * 0.45, overflow: 'hidden', ...boxStyle }}>
      {items.map((t, i) => (
        <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', fontSize: size, lineHeight: 1.3, color: textColor }}>
          <Bullet color={design.primary} />
          <span>{t}</span>
        </div>
      ))}
    </div>
  );
}

function Signature({ data, design, textColor, width, height, size }) {
  return (
    <div style={{ width }}>
      <div style={{ height, display: 'flex', alignItems: 'flex-end' }}>
        {data.signature ? (
          <img src={data.signature} alt="Signature" style={{ maxHeight: height, maxWidth: width, objectFit: 'contain' }} />
        ) : (
          <span
            style={{
              fontFamily: "'Brush Script MT','Segoe Script','Lucida Handwriting',cursive",
              fontSize: height * 0.62,
              color: textColor,
              lineHeight: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {data.fullName || 'Your Signature'}
          </span>
        )}
      </div>
      <div style={{ borderTop: `2px solid ${design.primary}`, marginTop: 6, paddingTop: 6, fontSize: size, color: textColor, opacity: 0.8 }}>
        Authorized Signature
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// FRONT
// ---------------------------------------------------------------------------
function Front({ data, design, W, H }) {
  const portrait = design.orientation === 'portrait';
  const onDark = readableOn(design.secondary);
  const text = readableOn(design.background);
  const muted = rgba(text, 0.65);
  const logoSize = (portrait ? 96 : 84) * (design.logoSize / 100);
  const mirrored = !portrait && design.photoPosition === 'right';

  const name = (data.fullName || 'YOUR NAME').trim();
  const words = name.split(/\s+/);
  const last = words.length > 1 ? words.pop() : '';
  const first = words.join(' ');

  const rows = [
    ['ID', data.employeeId || '00.112.22.333'],
    ['D.O.B', fmtDate(data.dob) || '02/06/2000'],
    ['Phone', data.phone || '(+000) 123 456 789'],
  ];
  if (design.showGender && data.gender) rows.push(['Gender', data.gender]);
  if (design.showEmail && data.email) rows.push(['Email', data.email]);

  const barcodeValue = data.barcodeValue || data.employeeId || '0123456789';

  // ----- header (logo + company) -----
  const header = (onDarkBg, style) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, ...style }}>
      <LogoMark
        logo={data.logo}
        size={logoSize}
        frame={design.logoFrame}
        stroke={design.accent}
        textColor={onDarkBg ? onDark : text}
      />
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            color: design.primary,
            fontSize: portrait ? 34 : 32,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: 1,
            lineHeight: 1.1,
          }}
        >
          {data.companyName || 'NAME COMPANY'}
        </div>
        <div style={{ color: onDarkBg ? onDark : muted, fontSize: portrait ? 22 : 20, marginTop: 6, fontWeight: 500 }}>
          {data.tagline || 'Your Tagline Here'}
        </div>
      </div>
    </div>
  );

  if (portrait) {
    const r = 125;
    const cx = design.photoPosition === 'left' ? 190 : design.photoPosition === 'right' ? 350 : W / 2;
    const cy = 302;
    const nameTop = 515;
    const rowStep = rows.length > 3 ? 28 : 30;
    const rowsTop = data.department ? 638 : 612;
    const rowsEnd = rowsTop + rows.length * rowStep;
    const bcTop = Math.max(rowsEnd + 12, H - 96);
    const bcH = Math.max(30, Math.min(60, H - 26 - bcTop));
    return (
      <>
        <FrontArt W={W} H={H} design={design} />
        {header(true, abs({ left: 40, top: 40, right: 30 }))}
        <div style={abs({ left: cx - r, top: cy - r })}>
          <Avatar photo={data.photo} design={design} size={r * 2} />
        </div>
        <div style={abs({ left: 30, right: 30, top: nameTop, textAlign: 'center', color: text })}>
          <div style={{ fontSize: 44, fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {first && <span>{first} </span>}
            <span style={{ color: first ? design.primary : text }}>{last || (first ? '' : '')}</span>
          </div>
          <div style={{ fontSize: 25, fontWeight: 700, marginTop: 6 }}>{data.jobTitle || 'Job Position'}</div>
          {data.department && <div style={{ fontSize: 20, color: muted, marginTop: 2 }}>{data.department}</div>}
        </div>
        <div style={abs({ left: 70, right: 40, top: rowsTop, display: 'flex', flexDirection: 'column' })}>
          {rows.map(([l, v]) => (
            <InfoRow key={l} label={l} value={v} design={design} textColor={text} size={22} labelWidth={92} />
          ))}
        </div>
        <div style={abs({ left: 70, top: bcTop, width: W - 140, height: bcH })}>
          <Barcode value={barcodeValue} format={data.barcodeFormat} color={text === '#ffffff' ? '#ffffff' : '#111111'} />
        </div>
      </>
    );
  }

  // ----- landscape -----
  const r = 100;
  const cx = mirrored ? W - 145 : 145;
  const cy = 270;
  // keep text clear of the swoosh: it reaches x = 410 (curve) / 358 (diagonal) / 300 (minimal)
  const edge = { curve: 410, band: 358, minimal: 300 }[design.layout] + 26;
  const contentLeft = mirrored ? 40 : edge;
  const contentW = W - edge - 40;
  const rowsTop = 292;
  const rowStep = 30;
  const rowsEnd = rowsTop + rows.length * rowStep;
  const bcTop = Math.max(rowsEnd + 10, 450);
  const bcH = Math.min(58, H - 22 - bcTop);

  return (
    <>
      <FrontArt W={W} H={H} design={design} mirrored={mirrored} />
      <div style={abs({ left: cx - r, top: cy - r })}>
        <Avatar photo={data.photo} design={design} size={r * 2} />
      </div>
      {header(false, abs({ left: contentLeft, top: 34, width: contentW }))}
      <div style={abs({ left: contentLeft, top: 166, width: contentW, color: text })}>
        <div style={{ fontSize: 42, fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {first && <span>{first} </span>}
          <span style={{ color: first ? design.primary : text }}>{last}</span>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>{data.jobTitle || 'Job Position'}</div>
        {data.department && <div style={{ fontSize: 19, color: muted, marginTop: 2 }}>{data.department}</div>}
      </div>
      <div style={abs({ left: contentLeft, top: rowsTop + (data.department ? 0 : -18), width: contentW, display: 'flex', flexDirection: 'column' })}>
        {rows.map(([l, v]) => (
          <InfoRow key={l} label={l} value={v} design={design} textColor={text} size={21} labelWidth={86} />
        ))}
      </div>
      <div style={abs({ left: contentLeft, top: bcTop, width: Math.min(contentW, 400), height: bcH })}>
        <Barcode value={barcodeValue} format={data.barcodeFormat} color={text === '#ffffff' ? '#ffffff' : '#111111'} />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// BACK
// ---------------------------------------------------------------------------
function Back({ data, design, W, H }) {
  const portrait = design.orientation === 'portrait';
  const text = readableOn(design.background);
  const muted = rgba(text, 0.7);
  const logoSize = (portrait ? 96 : 84) * (design.logoSize / 100);
  const qr = qrText(data);
  const contact = [
    data.address,
    data.companyPhone && `Tel: ${data.companyPhone}`,
    data.website,
    data.email && design.showEmail ? data.email : null,
  ].filter(Boolean);

  const dates = (size) => (
    <div style={{ fontSize: size, lineHeight: 1.5, color: text }}>
      <div>
        <span style={{ color: design.primary, fontWeight: 700 }}>Issue date</span> : {fmtDate(data.issueDate) || '--/--/----'}
      </div>
      <div>
        <span style={{ color: design.primary, fontWeight: 700 }}>Expire Date</span> : {fmtDate(data.expiryDate) || '--/--/----'}
      </div>
    </div>
  );

  const extra = [
    data.emergencyContact && (
      <div key="e">
        <span style={{ color: design.primary, fontWeight: 700 }}>Emergency</span> : {data.emergencyContact}
      </div>
    ),
    data.additionalInfo && <div key="a">{data.additionalInfo}</div>,
  ].filter(Boolean);

  if (portrait) {
    // vertical flow budget (design px) so nothing collides, whatever the text length
    const lSize = logoSize * 0.9;
    const nameLines = (data.companyName || 'NAME COMPANY').length > 17 ? 2 : 1;
    const headTop = Math.max(262, 34 + lSize + 12 + nameLines * 37 + 33 + 16);
    const termsTop = headTop + 40;
    const contactLines = [data.address, [data.companyPhone && `Tel: ${data.companyPhone}`, data.website].filter(Boolean).join('  ·  ')].filter(Boolean);
    const addrRows = (data.address || '').length > 40 ? 2 : 1;
    const contactTop = termsTop + 172;
    const contactH = (contactLines.length - 1 + (contactLines.length ? addrRows : 0)) * 24;
    const extraTop = contactTop + contactH + 8;
    const sigTop = extraTop + extra.length * 24 + 14;
    return (
      <>
        <BackArt W={W} H={H} design={design} />
        <div style={abs({ left: 30, right: 30, top: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' })}>
          <LogoMark logo={data.logo} size={lSize} frame={design.logoFrame} stroke={design.accent} textColor={text} />
          <div style={{ color: design.primary, fontSize: 34, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1.1, marginTop: 12 }}>
            {data.companyName || 'NAME COMPANY'}
          </div>
          <div style={{ color: design.accent, fontSize: 22, marginTop: 6, fontWeight: 500 }}>{data.tagline || 'Your Tagline Here'}</div>
        </div>
        <div style={abs({ left: 50, right: 40, top: headTop, color: design.primary, fontSize: 28, fontWeight: 700 })}>Terms and conditions</div>
        <Terms terms={data.terms} design={design} textColor={text} size={19} max={4} boxStyle={abs({ left: 50, right: 40, top: termsTop, height: 164 })} />
        <div style={abs({ left: 50, right: 40, top: contactTop, fontSize: 17, lineHeight: '24px', color: muted })}>
          {contactLines.map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </div>
        <div style={abs({ left: 50, right: 40, top: extraTop, fontSize: 17, lineHeight: '24px', color: text })}>{extra}</div>
        <div style={abs({ left: 50, top: sigTop })}>
          <Signature data={data} design={design} textColor={text} width={220} height={52} size={15} />
        </div>
        <div style={abs({ left: 50, top: sigTop + 100 })}>{dates(17)}</div>
        <div style={abs({ left: 340, top: sigTop - 6, padding: 8, background: '#fff', borderRadius: 6, boxShadow: `0 0 0 3px ${design.secondary}` })}>
          <QrImage text={qr} size={130} />
        </div>
      </>
    );
  }

  return (
    <>
      <BackArt W={W} H={H} design={design} />
      <div style={abs({ left: 40, top: 30, display: 'flex', alignItems: 'center', gap: 16, width: 500 })}>
        <LogoMark logo={data.logo} size={logoSize} frame={design.logoFrame} stroke={design.accent} textColor={text} />
        <div>
          <div style={{ color: design.primary, fontSize: 32, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, lineHeight: 1.1 }}>
            {data.companyName || 'NAME COMPANY'}
          </div>
          <div style={{ color: design.accent, fontSize: 20, marginTop: 4, fontWeight: 500 }}>{data.tagline || 'Your Tagline Here'}</div>
        </div>
      </div>
      <div style={abs({ left: 580, top: 32, width: 250, fontSize: 16, lineHeight: 1.4, color: muted })}>
        {contact.map((c, i) => (
          <div key={i}>{c}</div>
        ))}
      </div>
      <div style={abs({ left: 40, top: 138, fontSize: 24, fontWeight: 700, color: design.primary })}>Terms and conditions</div>
      <Terms terms={data.terms} design={design} textColor={text} size={18} max={4} boxStyle={abs({ left: 40, top: 176, width: 520, height: 168 })} />
      <div style={abs({ left: 40, top: 352 })}>
        <Signature data={data} design={design} textColor={text} width={210} height={46} size={14} />
      </div>
      <div style={abs({ left: 285, top: 362, width: 290, fontSize: 15, lineHeight: 1.5, color: text })}>{extra}</div>
      <div style={abs({ left: 620, top: 150, padding: 7, background: '#fff', borderRadius: 6, boxShadow: `0 0 0 3px ${design.secondary}` })}>
        <QrImage text={qr} size={136} />
      </div>
      <div style={abs({ left: 598, top: 332 })}>{dates(17)}</div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Card root: exact CR80 proportions, identical size for front and back.
// ---------------------------------------------------------------------------
const IdCard = forwardRef(function IdCard({ side, data, design }, ref) {
  const { W, H } = dims(design.orientation);
  return (
    <div
      ref={ref}
      style={{
        position: 'relative',
        width: W,
        height: H,
        overflow: 'hidden',
        borderRadius: design.radius,
        fontFamily: fontCss(design.font),
        boxSizing: 'border-box',
        ...cardBackground(design),
      }}
    >
      {side === 'front' ? <Front data={data} design={design} W={W} H={H} /> : <Back data={data} design={design} W={W} H={H} />}
    </div>
  );
});

export default IdCard;
