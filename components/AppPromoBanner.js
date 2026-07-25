'use client';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function AppPromoBanner() {
  const { t, cmsAnnouncement } = useApp();

  if (cmsAnnouncement && cmsAnnouncement.enabled === false) return null;

  const ann = cmsAnnouncement || {};

  const defaultUzTitle = "KEYINGI TADBIRINGIZ UCHUN ZAL VA CHIPTALARNI TOPING";
  const defaultUzDesc = "Grand Conference Hall platformasi orqali zallarni 24/7 online bron qilish, film va tadbirlarga chiptalarni bir necha sekundda xarid qiling.";
  const defaultUzTicker = "Hozir yuklab oling ★ ONLINE BRON ★ OXFORD HALL ★ CHIPTA XARID QILISH ★ ";
  const defaultUzBtnPrimary = "Zalni bron qilish";
  const defaultUzBtnSecondary = "Barcha tadbirlar";

  const title = (ann.title && ann.title !== defaultUzTitle) ? ann.title : (t.announcement?.title || defaultUzTitle);
  const desc = (ann.desc && ann.desc !== defaultUzDesc) ? ann.desc : (t.announcement?.desc || defaultUzDesc);
  const badge = (ann.badge && ann.badge !== "Grand Hall Premier Venue") ? ann.badge : (t.announcement?.badge || "Grand Hall Premier Venue");
  const tickerText = (ann.tickerText && ann.tickerText !== defaultUzTicker) ? ann.tickerText : (t.announcement?.tickerText || defaultUzTicker);
  const btnPrimaryText = (ann.btnPrimaryText && ann.btnPrimaryText !== defaultUzBtnPrimary) ? ann.btnPrimaryText : (t.announcement?.btnPrimaryText || defaultUzBtnPrimary);
  const btnPrimaryLink = ann.btnPrimaryLink || "/rent";
  const btnSecondaryText = (ann.btnSecondaryText && ann.btnSecondaryText !== defaultUzBtnSecondary) ? ann.btnSecondaryText : (t.announcement?.btnSecondaryText || defaultUzBtnSecondary);
  const btnSecondaryLink = ann.btnSecondaryLink || "/events";

  const cardTitle = (ann.cardTitle && ann.cardTitle !== "Main Auditorium & Cinema") ? ann.cardTitle : (t.announcement?.cardTitle || "Main Auditorium & Cinema");
  const cardSubtitle = (ann.cardSubtitle && ann.cardSubtitle !== "98 Executive Seats • Cinema 4K • Acoustic Isolation") ? ann.cardSubtitle : (t.announcement?.cardSubtitle || "98 Executive Seats • Cinema 4K • Acoustic Isolation");
  const cardPrice = ann.cardPrice || "300,000 UZS / hr";
  const cardImage = ann.cardImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80";

  return (
    <section className="reveal-scale" style={{ padding: '60px 16px 80px', maxWidth: '1280px', margin: '0 auto', overflow: 'hidden', width: '100%' }}>
      <div className="app-promo-grid" style={{
        background: '#FFDD00',
        borderRadius: '32px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 20px 50px rgba(255, 221, 0, 0.3)',
        display: 'grid',
        gap: '32px',
        alignItems: 'center'
      }}>

        {/* Diagonal Black Skewed Ticker Ribbon passing below text */}
        <div style={{
          position: 'absolute',
          bottom: '-15px',
          left: '-15%',
          width: '140%',
          background: '#000000',
          color: '#ffffff',
          transform: 'rotate(-15deg)',
          padding: '16px 0',
          zIndex: 1,
          pointerEvents: 'none',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div style={{
            display: 'inline-block',
            fontSize: '36px',
            fontWeight: 900,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            animation: 'tickerSlide 25s linear infinite'
          }}>
            {tickerText.repeat(8)}
          </div>
        </div>

        {/* Left Column Content */}
        <div style={{ position: 'relative', zIndex: 5, color: '#000000' }}>
          
          {/* Top Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: '#000000', color: '#FFDD00',
            padding: '6px 16px', borderRadius: '100px',
            fontSize: '12px', fontWeight: 900, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: '20px'
          }}>
            <Sparkles size={14} /> {badge}
          </div>

          <h2 style={{
            fontSize: 'clamp(28px, 3.8vw, 42px)',
            fontWeight: 900,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '20px',
            color: '#000000',
            maxWidth: '580px'
          }}>
            {title}
          </h2>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'rgba(0, 0, 0, 0.85)',
            fontWeight: 600,
            maxWidth: '540px',
            marginBottom: '36px'
          }}>
            {desc}
          </p>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link href={btnPrimaryLink} style={{
              padding: '16px 38px', borderRadius: '100px',
              background: '#000000', color: '#FFDD00',
              fontSize: '16px', fontWeight: 900, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {btnPrimaryText} <ArrowRight size={18} />
            </Link>

            <Link href={btnSecondaryLink} style={{
              padding: '16px 34px', borderRadius: '100px',
              background: 'rgba(0,0,0,0.08)', color: '#000000',
              border: '2px solid #000000',
              fontSize: '16px', fontWeight: 800, textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.15)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.08)'}
            >
              {btnSecondaryText}
            </Link>
          </div>
        </div>

        {/* Right Column: Grand Hall Showcase Card */}
        <div style={{
          position: 'relative',
          zIndex: 5,
          display: 'flex',
          justify: 'center',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'relative',
            width: '360px',
            borderRadius: '28px',
            overflow: 'hidden',
            background: '#ffffff',
            border: 'none',
            boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
            transform: 'rotate(2deg)',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'rotate(0deg) scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'rotate(2deg)'}
          >
            {/* Top Floating Badge */}
            <div style={{
              position: 'absolute', top: '16px', left: '16px', zIndex: 10,
              background: '#000000', color: '#FFDD00', padding: '6px 14px', borderRadius: '100px',
              fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', gap: '6px'
            }}>
              <Sparkles size={12} /> {badge}
            </div>

            {/* Hall Photo */}
            <img
              src={cardImage}
              alt="Grand Conference Hall Showcase"
              style={{ width: '100%', height: '240px', objectFit: 'cover', display: 'block' }}
            />

            {/* Bottom Card Info */}
            <div style={{ padding: '22px', background: '#ffffff', color: '#000000' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#000000', marginBottom: '6px' }}>
                {cardTitle}
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', fontWeight: 600 }}>
                {cardSubtitle}
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '14px'
              }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{t.announcement?.rentalRate || "Rental Rate"}</span>
                <span style={{ fontSize: '14px', fontWeight: 900, color: '#000000', background: '#FFDD00', padding: '4px 10px', borderRadius: '8px' }}>{cardPrice}</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .app-promo-grid {
          grid-template-columns: 1.2fr 0.8fr;
          padding: 54px 48px;
        }
        @media (max-width: 900px) {
          .app-promo-grid {
            grid-template-columns: 1fr !important;
            padding: 32px 20px !important;
          }
        }
        @keyframes tickerSlide {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}} />
    </section>
  );
}

