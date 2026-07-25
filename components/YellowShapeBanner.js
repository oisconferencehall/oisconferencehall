'use client';
import Link from 'next/link';
import { Sparkles, ArrowRight, Building, LayoutGrid } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function YellowShapeBanner() {
  const { lang } = useApp();

  const content = {
    uz: {
      badge: "Grand Conference Hall 2026",
      title: "Keyingi konferensiya va tadbiringiz uchun zal bron qiling",
      subtitle: "Oxford International School'ning zamonaviy zallarida tadbiringizni yuqori saviyada o'tkazing.",
      btnRent: "Zalni bron qilish",
      btnHalls: "Zallarni ko'rish"
    },
    ru: {
      badge: "Grand Conference Hall 2026",
      title: "Забронируйте зал для вашего следующего мероприятия",
      subtitle: "Проведите ваше мероприятие на высшем уровне в современных залах Oxford International School.",
      btnRent: "Аренда зала",
      btnHalls: "Посмотреть залы"
    },
    en: {
      badge: "Grand Conference Hall 2026",
      title: "Book your next conference, seminar, or grand event with us",
      subtitle: "Host your next event at Oxford International School with state-of-the-art facilities and executive service.",
      btnRent: "Rent the Hall",
      btnHalls: "View Halls"
    }
  };

  const text = content[lang] || content.en;

  return (
    <section style={{ position: 'relative', overflow: 'hidden', margin: '40px 0' }}>
      {/* Skewed Yellow Background Shape */}
      <div style={{
        background: '#FFDD00',
        padding: '70px 24px',
        transform: 'skewY(-2deg)',
        transformOrigin: 'top left',
        boxShadow: '0 10px 40px rgba(255, 221, 0, 0.25)',
        position: 'relative'
      }}>
        {/* Anti-skew content container */}
        <div style={{ transform: 'skewY(2deg)', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '32px', color: '#000000'
          }}>
            {/* Left text */}
            <div style={{ maxWidth: '640px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#000000', color: '#FFDD00',
                padding: '6px 16px', borderRadius: '100px',
                fontSize: '12px', fontWeight: 900, textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: '16px'
              }}>
                <Sparkles size={14} /> {text.badge}
              </div>

              <h2 style={{ fontSize: 'clamp(26px, 3.8vw, 42px)', fontWeight: 900, color: '#000000', lineHeight: 1.18, marginBottom: '16px' }}>
                {text.title}
              </h2>

              <p style={{ fontSize: '16px', color: 'rgba(0, 0, 0, 0.82)', fontWeight: 600, lineHeight: 1.6 }}>
                {text.subtitle}
              </p>
            </div>

            {/* Right Buttons: Rent the Hall & View Halls */}
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/rent" style={{
                padding: '16px 38px', borderRadius: '100px',
                background: '#000000', color: '#FFDD00',
                fontSize: '16px', fontWeight: 800, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Building size={18} /> {text.btnRent} <ArrowRight size={18} />
              </Link>

              <Link href="/halls" style={{
                padding: '16px 36px', borderRadius: '100px',
                background: 'rgba(0, 0, 0, 0.08)', color: '#000000',
                border: '2px solid #000000',
                fontSize: '16px', fontWeight: 800, textDecoration: 'none',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0, 0, 0, 0.08)'}
              >
                <LayoutGrid size={18} /> {text.btnHalls}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
