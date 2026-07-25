'use client';
import Link from 'next/link';

export function AuroraHero({ data }) {
  return (
    <section style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      background: '#030712'
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '60vw', height: '60vh',
          background: 'radial-gradient(circle, rgba(255, 221, 0, 0.35) 0%, transparent 60%)',
          filter: 'blur(80px)', animation: 'pulse 10s infinite alternate'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%', width: '70vw', height: '70vh',
          background: 'radial-gradient(circle, rgba(255, 221, 0, 0.35) 0%, transparent 60%)',
          filter: 'blur(100px)', animation: 'pulse 12s infinite alternate-reverse'
        }} />
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 24px', paddingTop: '80px', maxWidth: '1000px' }}>
        <div className="animate-in" style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '30px', color: '#ffffff', fontSize: '13px', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '32px', backdropFilter: 'blur(10px)' }}>
          ✨ SAMARKAND'S PREMIER VENUE
        </div>
        
        <h1 className="animate-in-delay-1" style={{
          fontSize: 'clamp(40px, 8vw, 84px)',
          fontWeight: 800,
          lineHeight: 1.05,
          color: '#ffffff',
          letterSpacing: '-0.02em',
          marginBottom: '32px',
          fontFamily: "'Inter', sans-serif"
        }}>
          {data.title} <br/>
          <span style={{ 
            background: 'linear-gradient(135deg, #FFDD00, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>{data.titleHighlight}</span>
        </h1>

        <p className="animate-in-delay-2" style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          color: 'rgba(255,255,255,0.65)',
          maxWidth: '650px',
          margin: '0 auto 48px',
          lineHeight: 1.6
        }}>
          {data.subtitle}
        </p>

        <div className="animate-in-delay-3" style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/rent" style={{
            padding: '18px 40px', borderRadius: '30px', background: 'white', color: '#030712',
            fontSize: '16px', fontWeight: 700, textDecoration: 'none', transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(255,255,255,0.15)'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            {data.btnPrimary}
          </Link>
          
          <Link href="/events" style={{
            padding: '18px 40px', borderRadius: '30px', background: 'rgba(255,255,255,0.05)', color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
            fontSize: '16px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.3s ease'
          }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            {data.btnSecondary}
          </Link>
        </div>
      </div>
    </section>
  );
}

export function BentoAdvantages({ data }) {
  return (
    <section style={{ padding: '120px 24px', background: '#030712', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
            {data.title} <span style={{ color: '#FFDD00' }}>{data.titleHighlight}</span>
          </h2>
        </div>

        <div className="bento-grid">
          <div className="bento-col-8" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px',
            overflow: 'hidden', position: 'relative', minHeight: '400px', transition: 'transform 0.3s ease'
          }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <img src={data.bgImage1 || "https://images.unsplash.com/photo-1517502884422-41ea60d5b436?w=1200&q=80"} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.5 }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px', background: 'linear-gradient(to top, rgba(3,7,18,0.9), transparent)' }}>
              <h3 style={{ fontSize: '28px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>{data.adv1}</h3>
            </div>
          </div>

          <div className="bento-col-4" style={{
            background: 'linear-gradient(135deg, #FFDD00, #FFDD00)', borderRadius: '32px',
            padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(255, 221, 0, 0.35)'
          }}>
            <div style={{ fontSize: '64px', fontWeight: 900, color: '#ffffff', lineHeight: 1 }}>850+</div>
            <div style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', fontWeight: 500, marginTop: '8px' }}>Guests Capacity</div>
          </div>

          <div className="bento-col-4" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px',
            padding: '40px', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 221, 0, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFDD00" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>{data.adv2}</h3>
          </div>

          <div className="bento-col-4" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px',
            padding: '40px', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 221, 0, 0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFDD00" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff', marginBottom: '8px' }}>{data.adv3}</h3>
          </div>

          <div className="bento-col-4" style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px',
            overflow: 'hidden', position: 'relative'
          }}>
            <img src={data.bgImage2 || "https://images.unsplash.com/photo-1542332213-9b5a5a3fad35?w=600&q=80"} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }} />
            <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, padding: '20px', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>{data.adv4}</h3>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 24px;
          grid-auto-rows: minmax(200px, auto);
        }
        .bento-col-8 { grid-column: span 12; }
        .bento-col-4 { grid-column: span 12; }
        @media(min-width: 768px) {
          .bento-col-8 { grid-column: span 8; }
          .bento-col-4 { grid-column: span 4; }
        }
      `}</style>
    </section>
  );
}
