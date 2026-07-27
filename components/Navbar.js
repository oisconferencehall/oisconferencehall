'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Globe, Ticket, Menu, X, ChevronDown, User, LogIn, Moon, Sun } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'EN', full: 'English' },
  { code: 'ru', label: 'RU', full: 'Русский' },
  { code: 'uz', label: 'UZ', full: "O'zbekcha" },
];

export default function Navbar() {
  const { t, lang, changeLang, tickets, user, theme, toggleTheme } = useApp();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [pastHero, setPastHero] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      setPastHero(window.scrollY > (window.innerHeight - 80));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest('[data-lang-dropdown]')) setLangOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/halls', label: t.navbar?.ourHalls || 'Our Halls' },
    { href: '/events', label: t.nav.events },
    { href: '/timetable', label: t.timetable?.schedule || 'Timetable' },
    { href: '/rent', label: t.nav.rent },
  ];

  const isActive = (href) => href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isHeroPage = pathname === '/' || (pathname.startsWith('/events/') && pathname !== '/events') || pathname === '/registration';
  const isTransparent = isHeroPage && !scrolled;

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        background: isTransparent 
          ? 'transparent' 
          : (theme === 'dark' ? 'rgba(12, 12, 12, 0.92)' : 'rgba(255, 255, 255, 0.92)'),
        backdropFilter: isTransparent ? 'none' : 'blur(20px)',
        WebkitBackdropFilter: isTransparent ? 'none' : 'blur(20px)',
        borderBottom: isTransparent ? 'none' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)'),
        boxShadow: isTransparent ? 'none' : (theme === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.03)'),
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}>
        <div className="nav-container" style={{
          maxWidth: '1200px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          transition: 'padding 0.4s ease',
        }}>
          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src="/logo.svg.png" alt="OIS Logo" style={{
              width: '42px', height: '42px', objectFit: 'contain',
              transition: 'transform 0.3s ease',
              flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            />
            <div className="desktop-only" style={{ lineHeight: 1.1 }}>
              <div style={{ fontWeight: 800, fontSize: '15px', color: isTransparent ? '#ffffff' : 'var(--text-primary)', letterSpacing: '-0.02em', transition: 'color 0.3s ease' }}>
                {t.navbar?.brandName}
              </div>
              <div style={{ fontSize: '10px', color: isTransparent ? '#FFDD00' : (theme === 'dark' ? '#FFDD00' : '#d97706'), fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'color 0.3s ease' }}>
                {t.navbar?.brandSub}
              </div>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            {navLinks.map(link => {
              const active = isActive(link.href);
              const defaultColor = isTransparent
                ? (active ? '#ffffff' : 'rgba(255, 255, 255, 0.9)')
                : 'var(--text-primary)';
              const hoverColor = isTransparent ? '#ffffff' : 'var(--text-primary)';
              const hoverBg = isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)');

              return (
                <Link key={link.href} href={link.href} style={{
                  padding: '8px 16px', borderRadius: '10px',
                  fontSize: '15px', fontWeight: active ? 800 : 700,
                  textDecoration: 'none',
                  color: defaultColor,
                  background: link.highlight
                    ? (active ? 'linear-gradient(135deg,#ea580c,#fb923c)' : 'rgba(234,88,12,0.1)')
                    : 'transparent',
                  border: link.highlight
                    ? '1px solid rgba(234,88,12,0.35)'
                    : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  whiteSpace: 'nowrap',
                }}
                  onMouseEnter={e => {
                    if (!active) {
                      e.currentTarget.style.color = hoverColor;
                      e.currentTarget.style.backgroundColor = hoverBg;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      e.currentTarget.style.color = defaultColor;
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  {link.label}
                  {active && !link.highlight && (
                    <div style={{
                      position: 'absolute', bottom: '0px', left: '50%', transform: 'translateX(-50%)',
                      width: '70%', height: '3px', borderRadius: '2px',
                      background: '#FFDD00',
                      boxShadow: '0 2px 8px rgba(255, 221, 0, 0.6)',
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right: theme toggle + lang + tickets + admin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '38px', height: '38px', borderRadius: '10px',
                background: isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'),
                border: isTransparent ? '1px solid rgba(255, 255, 255, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0'),
                color: isTransparent ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? '#ffffff' : '#334155'),
                cursor: 'pointer', transition: 'all 0.2s ease', boxSizing: 'border-box',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.borderColor = 'rgba(255, 221, 0, 0.6)'; e.currentTarget.style.background = 'rgba(255, 221, 0, 0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = isTransparent ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? '#ffffff' : '#334155'); e.currentTarget.style.borderColor = isTransparent ? 'rgba(255, 255, 255, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '#e2e8f0'); e.currentTarget.style.background = isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'); }}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Language selector */}
            <div data-lang-dropdown style={{ position: 'relative' }}>
              <button
                onClick={(e) => { e.stopPropagation(); setLangOpen(v => !v); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  height: '38px', padding: '0 12px', borderRadius: '10px',
                  background: isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'),
                  border: isTransparent ? '1px solid rgba(255, 255, 255, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0'),
                  color: isTransparent ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? '#ffffff' : '#334155'), fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-sans)', boxSizing: 'border-box',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 221, 0, 0.2)'; e.currentTarget.style.borderColor = 'rgba(255, 221, 0, 0.6)'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'); e.currentTarget.style.borderColor = isTransparent ? 'rgba(255, 255, 255, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '#e2e8f0'); e.currentTarget.style.color = isTransparent ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? '#ffffff' : '#334155'); }}
              >
                <Globe size={14} />
                {lang.toUpperCase()}
                <ChevronDown size={12} style={{ transition: 'transform 0.2s ease', transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
              </button>

              {langOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: theme === 'dark' ? '#18181b' : '#ffffff',
                  border: theme === 'dark' ? '1px solid #27272a' : '1px solid #e2e8f0',
                  borderRadius: '12px', overflow: 'hidden',
                  minWidth: '140px',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                  animation: 'fadeInDown 0.2s ease',
                  zIndex: 50,
                }}>
                  {LANGS.map(l => (
                    <button
                      key={l.code}
                      onClick={(e) => { e.stopPropagation(); changeLang(l.code); setLangOpen(false); }}
                      style={{
                        width: '100%', padding: '10px 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        background: lang === l.code ? 'rgba(255, 221, 0, 0.15)' : 'transparent',
                        border: 'none', borderBottom: theme === 'dark' ? '1px solid #27272a' : '1px solid #f1f5f9',
                        color: lang === l.code ? '#FFDD00' : (theme === 'dark' ? '#e4e4e7' : '#334155'),
                        fontSize: '13px', fontWeight: lang === l.code ? 700 : 500,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        fontFamily: 'var(--font-sans)', textAlign: 'left',
                      }}
                      onMouseEnter={e => { if (lang !== l.code) e.currentTarget.style.background = theme === 'dark' ? '#27272a' : '#f8fafc'; }}
                      onMouseLeave={e => { if (lang !== l.code) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span>{l.full}</span>
                      <span style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em' }}>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <Link className="desktop-only" href="/profile" style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: '7px',
                height: '38px', padding: '0 14px', borderRadius: '10px',
                background: isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'),
                border: isTransparent ? '1px solid rgba(255, 255, 255, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0'),
                color: isTransparent ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? '#ffffff' : '#334155'), fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 221, 0, 0.2)'; e.currentTarget.style.borderColor = 'rgba(255, 221, 0, 0.6)'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'); e.currentTarget.style.borderColor = isTransparent ? 'rgba(255, 255, 255, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '#e2e8f0'); e.currentTarget.style.color = isTransparent ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? '#ffffff' : '#334155'); }}
              >
                <User size={15} />
                {t.navbar?.profile}
                {tickets.length > 0 && (
                  <span style={{
                    position: 'absolute', top: '-6px', right: '-6px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    background: '#FFDD00',
                    fontSize: '10px', fontWeight: 900, color: '#000000',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(255, 221, 0, 0.4)',
                    animation: 'pulse 2s ease-in-out infinite',
                  }}>
                    {tickets.length}
                  </span>
                )}
              </Link>
            ) : (
              <Link className="desktop-only" href="/login" style={{
                position: 'relative', display: 'flex', alignItems: 'center', gap: '7px',
                height: '38px', padding: '0 14px', borderRadius: '10px',
                background: isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'),
                border: isTransparent ? '1px solid rgba(255, 255, 255, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0'),
                color: isTransparent ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? '#ffffff' : '#334155'), fontSize: '13px', fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.2s ease', boxSizing: 'border-box',
                whiteSpace: 'nowrap',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 221, 0, 0.2)'; e.currentTarget.style.borderColor = 'rgba(255, 221, 0, 0.6)'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9'); e.currentTarget.style.borderColor = isTransparent ? 'rgba(255, 255, 255, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.12)' : '#e2e8f0'); e.currentTarget.style.color = isTransparent ? 'rgba(255, 255, 255, 0.9)' : (theme === 'dark' ? '#ffffff' : '#334155'); }}
              >
                <LogIn size={15} />
                {t.navbar?.loginRegister}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{
                display: 'none',
                padding: '8px', borderRadius: '10px',
                background: isTransparent ? 'rgba(255, 255, 255, 0.12)' : (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : '#f1f5f9'),
                border: isTransparent ? '1px solid rgba(255, 255, 255, 0.2)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #e2e8f0'),
                color: isTransparent ? '#ffffff' : (theme === 'dark' ? '#ffffff' : '#0f172a'), cursor: 'pointer',
              }}
              className="mobile-menu-btn"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div style={{
            background: isTransparent ? 'rgba(15, 23, 42, 0.95)' : (theme === 'dark' ? 'rgba(18, 18, 18, 0.98)' : '#ffffff'),
            backdropFilter: 'blur(20px)',
            borderTop: isTransparent ? '1px solid rgba(255, 255, 255, 0.1)' : (theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #e2e8f0'),
            padding: '16px 24px 24px',
            animation: 'fadeInDown 0.2s ease',
          }}>
            {navLinks.map(link => (
              <Link key={link.href} href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'block', padding: '14px 16px',
                  color: isActive(link.href) ? '#FFDD00' : (theme === 'dark' ? 'rgba(255,255,255,0.9)' : '#334155'),
                  fontWeight: isActive(link.href) ? 700 : 500,
                  fontSize: '15px', textDecoration: 'none',
                  borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
                  background: isActive(link.href) ? 'rgba(255, 221, 0, 0.15)' : 'transparent',
                  borderRadius: '10px', marginBottom: '4px',
                }}>
                {link.label}
              </Link>
            ))}
            {user ? (
              <Link href="/profile" onClick={() => setMenuOpen(false)} style={{
                display: 'block', padding: '14px 16px',
                color: theme === 'dark' ? '#ffffff' : '#0f172a', fontWeight: 600,
                fontSize: '15px', textDecoration: 'none',
                borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
                borderRadius: '10px', marginBottom: '4px',
              }}>
                {t.navbar?.profile}
              </Link>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                display: 'block', padding: '14px 16px',
                color: theme === 'dark' ? '#ffffff' : '#0f172a', fontWeight: 600,
                fontSize: '15px', textDecoration: 'none',
                borderBottom: theme === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #f1f5f9',
                borderRadius: '10px', marginBottom: '4px',
              }}>
                {t.navbar?.loginRegister}
              </Link>
            )}

          </div>
        )}
      </nav>

      <style>{`
        .nav-container {
          padding: ${scrolled ? '12px 24px' : '16px 24px'};
        }
        @media (max-width: 768px) {
          .nav-container {
            padding: 12px 16px !important;
          }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
