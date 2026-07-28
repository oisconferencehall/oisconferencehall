'use client';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function RentCTASection() {
  const { t } = useApp();
  return (
    <section style={{
      position: 'relative',
      margin: '60px 0',
      overflow: 'hidden'
    }}>
      {/* Skewed Yellow Background Shape Container */}
      <div style={{
        background: '#FFDD00',
        padding: '100px 24px 90px',
        transform: 'skewY(-2deg)',
        transformOrigin: 'top left',
        boxShadow: '0 10px 40px rgba(255, 221, 0, 0.3)',
        position: 'relative',
        textAlign: 'center'
      }}>
        {/* Anti-skew content container */}
        <div style={{ transform: 'skewY(2deg)', maxWidth: '880px', margin: '0 auto', color: '#000000' }}>
          
          {/* Top Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#000000', color: '#FFDD00',
            padding: '6px 18px', borderRadius: '100px',
            fontSize: '12px', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: '24px'
          }}>
            <Sparkles size={14} /> {t.hero?.badge || t.announcement?.badge}
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: 'clamp(30px, 4.5vw, 48px)',
            fontWeight: 900,
            color: '#000000',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            marginBottom: '24px',
            maxWidth: '820px',
            margin: '0 auto 24px'
          }}>
            {t.rentPage?.heroTitle ? `${t.rentPage.heroTitle} ${t.rentPage.heroTitleHighlight}` : `${t.landingHero?.title} ${t.landingHero?.titleHighlight}`}
          </h2>

          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            color: 'rgba(0,0,0,0.85)',
            maxWidth: '640px',
            margin: '0 auto 40px',
            fontWeight: 600,
            lineHeight: 1.6
          }}>
            {t.rentPage?.heroSubtitle || t.landingHero?.subtitle}
          </p>

          {/* Decorative Dashed Arrows & CTA Button Container */}
          <div style={{
            position: 'relative',
            display: 'inline-flex',
            alignItems: 'center',
            justify: 'center'
          }}>

            {/* Left Dashed Curved Arrow */}
            <svg 
              width="100" height="60" viewBox="0 0 100 60" fill="none" 
              style={{
                position: 'absolute', left: '-105px', top: '-5px',
                display: 'block'
              }}
              className="desktop-only"
            >
              <path 
                d="M 10 12 Q 55 8 82 38" 
                stroke="#000000" strokeWidth="2.5" strokeDasharray="5 5" fill="none" strokeLinecap="round" 
              />
              <path 
                d="M 82 38 L 70 36 M 82 38 L 80 26" 
                stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
              />
            </svg>

            {/* Center Action Button Linking to /rent */}
            <Link 
              href="/rent"
              style={{
                padding: '18px 46px',
                borderRadius: '100px',
                background: '#000000',
                color: '#FFDD00',
                fontSize: '17px',
                fontWeight: 900,
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 14px 40px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
              }}
            >
              {t.rentPage?.applyBtn || t.cta?.rent} <ArrowRight size={18} />
            </Link>

            {/* Right Dashed Curved Arrow */}
            <svg 
              width="100" height="60" viewBox="0 0 100 60" fill="none" 
              style={{
                position: 'absolute', right: '-105px', top: '-5px',
                display: 'block'
              }}
              className="desktop-only"
            >
              <path 
                d="M 90 12 Q 45 8 18 38" 
                stroke="#000000" strokeWidth="2.5" strokeDasharray="5 5" fill="none" strokeLinecap="round" 
              />
              <path 
                d="M 18 38 L 30 36 M 18 38 L 20 26" 
                stroke="#000000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
              />
            </svg>

          </div>

        </div>
      </div>
    </section>
  );
}
