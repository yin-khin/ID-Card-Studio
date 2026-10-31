// Company logo, optionally framed in a hexagon like the reference design.
export default function LogoMark({ logo, size, frame, stroke, textColor }) {
  const framed = frame || !logo;
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      {framed && (
        <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <polygon
            points="25,4 75,4 98,50 75,96 25,96 2,50"
            fill="none"
            stroke={stroke}
            strokeWidth="3"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {logo ? (
        <img
          src={logo}
          alt="Company logo"
          style={{
            position: 'absolute',
            inset: framed ? '17%' : 0,
            width: framed ? '66%' : '100%',
            height: framed ? '66%' : '100%',
            objectFit: 'contain',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: textColor,
            fontWeight: 700,
            fontSize: size * 0.2,
            letterSpacing: 1,
          }}
        >
          LOGO
        </div>
      )}
    </div>
  );
}
