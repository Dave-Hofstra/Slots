export default function ShareQrButton({ setShowShareQr }) {
  return (
    <button
      className="header-icon"
      title="Share App"
      onClick={() => setShowShareQr(true)}
      style={{
        background: 'none',
        border: 'none',
        color: '#64748b',
        cursor: 'pointer',
        padding: '2px 6px',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        borderRadius: '6px',
        transition: 'color 0.15s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = '#facc15'}
      onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
    >
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ display: 'block' }}>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="16 6 12 2 8 6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="2" x2="12" y2="15" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
      </svg>
    </button>
  );
}
