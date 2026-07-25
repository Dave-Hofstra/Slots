import { useState, useRef } from 'react';

const QR_CODES = [
  { key: 'scuba', label: 'SCUBA Theme', file: '/Slots/qr-scuba.png', url: 'https://dhofstra.com/Slots/?theme=scuba' },
  { key: 'herons-glen', label: '🦩 Herons Glen Theme', file: '/Slots/qr-herons-glen.png', url: 'https://dhofstra.com/Slots/?theme=herons-glen' },
];

export default function ShareQrModal({ show, onClose }) {
  const [slide, setSlide] = useState(0);
  const touchX = useRef(0);

  const handleTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    const dx = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) {
      if (dx > 0 && slide < QR_CODES.length - 1) setSlide(s => s + 1);
      else if (dx < 0 && slide > 0) setSlide(s => s - 1);
    }
  };

  if (!show) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: 'rgba(2, 6, 23, 0.92)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.98), rgba(15, 23, 42, 0.99))',
          border: '1px solid rgba(250, 204, 21, 0.25)',
          borderRadius: 24, padding: 32,
          maxWidth: 480, width: '90vw',
          boxShadow: '0 0 80px rgba(250,204,21,0.12), 0 20px 60px rgba(0,0,0,0.6)',
          textAlign: 'center',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{
            fontFamily: "'Orbitron', monospace",
            fontSize: 'clamp(1rem, 4vw, 1.4rem)', fontWeight: 700,
            color: '#facc15', textShadow: '0 0 10px rgba(250,204,21,0.4)',
            margin: 0,
          }}>
            Share Slots
          </h2>
          <button
            style={{
              background: 'none', border: 'none', color: '#64748b',
              fontSize: 22, cursor: 'pointer', padding: '4px 8px',
              lineHeight: 1, borderRadius: 8,
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div
          style={{ overflow: 'hidden', userSelect: 'none', width: '100%' }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{
            display: 'flex',
            transition: 'transform 0.3s ease-in-out',
            transform: `translateX(-${slide * 100}%)`,
          }}>
            {QR_CODES.map((qr) => (
              <div key={qr.key} style={{
                width: '100%', flexShrink: 0,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 12, padding: '0 8px',
              }}>
                <img
                  src={qr.file}
                  alt={qr.label}
                  style={{
                    width: '100%', maxWidth: 300, height: 'auto',
                    borderRadius: 12, border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  draggable={false}
                />
                <p style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: 'clamp(0.65rem, 2.5vw, 0.85rem)',
                  color: '#94a3b8', margin: 0,
                }}>
                  {qr.label}
                </p>
                <a
                  href={qr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 'clamp(0.5rem, 1.8vw, 0.65rem)',
                    color: '#60a5fa', textDecoration: 'none',
                    maxWidth: '100%', overflow: 'hidden',
                    textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                  }}
                >
                  {qr.url}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          {QR_CODES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i === slide ? 20 : 8, height: 8, borderRadius: 4,
                border: 'none', padding: 0, cursor: 'pointer',
                background: i === slide ? '#facc15' : '#475569',
                transition: 'all 0.2s',
              }}
            />
          ))}
        </div>

        <p style={{
          fontFamily: "'Orbitron', monospace",
          fontSize: 9, color: '#475569', marginTop: 12, marginBottom: 0,
        }}>
          ← Swipe to see both QR codes →
        </p>
      </div>
    </div>
  );
}
