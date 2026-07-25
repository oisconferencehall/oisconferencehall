'use client';
import { useApp } from '@/context/AppContext';

export default function Partners() {
  const { t, partners } = useApp();
  const displayPartners = partners && partners.length > 0 ? partners : [
    { id: 1, name: 'Microsoft' }, { id: 2, name: 'Google' }, { id: 3, name: 'Amazon' },
    { id: 4, name: 'Tesla' }, { id: 5, name: 'Apple' }, { id: 6, name: 'Netflix' }
  ];

  return (
    <section style={{ padding: '80px 0', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      <div className="container" style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
          {t.partnersSection?.title}
        </h3>
      </div>
      
      <div style={{
        display: 'flex', width: '200%',
        animation: 'marquee 30s linear infinite',
      }}>
        {/* Seamless loop array */}
        {[...displayPartners, ...displayPartners, ...displayPartners].map((partner, i) => (
          <div key={i} style={{
            flex: '0 0 auto',
            width: '200px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0.9,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            padding: '0 20px'
          }}
            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = 0.9; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            {partner.logo ? (
              <img 
                src={partner.logo} 
                alt={partner.name || 'Partner Logo'} 
                style={{ maxHeight: '48px', maxWidth: '160px', objectFit: 'contain' }} 
              />
            ) : (
              <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-primary)', fontFamily: "'Inter', sans-serif" }}>
                {partner.name}
              </span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </section>
  );
}
