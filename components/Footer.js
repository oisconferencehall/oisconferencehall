'use client';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { MapPin, Phone, Mail, Globe, Share2, MessageSquare } from 'lucide-react';
import { HALL_INFO } from '@/lib/data';

export default function Footer() {
  const { t } = useApp();

  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border)',
      paddingTop: '64px',
      paddingBottom: '32px',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '48px',
          marginBottom: '48px',
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <img src="/logo.svg.png" alt="OIS Logo" style={{
                width: '44px', height: '44px', objectFit: 'contain',
                flexShrink: 0,
              }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{t.footer?.brandName}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.footer?.brandSub}</div>
              </div>
            </div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.7', marginBottom: '20px' }}>
              {t.footer.description}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { icon: <Globe size={16} />, href: '#', label: 'Website' },
                { icon: <Share2 size={16} />, href: '#', label: 'Social' },
                { icon: <MessageSquare size={16} />, href: '#', label: 'Telegram' },
              ].map((s, i) => (
                <a key={i} href={s.href} style={{
                  width: '36px', height: '36px',
                  background: 'var(--bg-card)',
                  borderRadius: '9px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                  border: '1px solid var(--border)',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 221, 0, 0.15)'; e.currentTarget.style.color = '#FFDD00'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {t.footer.quickLinks}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { href: '/', label: t.nav.home },
                { href: '/events', label: t.nav.events },
                { href: '/rent', label: t.nav.rent },
                { href: '/tickets', label: t.nav.tickets },
              ].map(l => (
                <Link key={l.href} href={l.href} style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  transition: 'color 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#FFDD00'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <span style={{ color: '#FFDD00', fontSize: '12px' }}>→</span>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {t.footer.contact}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: <MapPin size={15} />, text: HALL_INFO.address },
                { icon: <Phone size={15} />, text: HALL_INFO.phone },
                { icon: <Mail size={15} />, text: HALL_INFO.email },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ color: '#FFDD00', marginTop: '2px', flexShrink: 0 }}>{item.icon}</div>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Working Hours */}
          <div>
            <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {t.footer?.workingHours}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { day: t.footer?.monFri, hours: '08:00 – 22:00' },
                { day: t.footer?.saturday, hours: '09:00 – 21:00' },
                { day: t.footer?.sunday, hours: '10:00 – 20:00' },
              ].map((row, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{row.day}</span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{row.hours}</span>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '16px',
              padding: '12px 16px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>{t.footer?.openNow}</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{
          paddingTop: '24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            © 2026 {t.footer?.brandName}. {t.footer.rights}.
          </p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {[t.footer?.privacy, t.footer?.terms].map(l => (
              <a key={l} href="#" style={{ fontSize: '13px', color: 'var(--text-muted)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
