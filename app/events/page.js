'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import EventCard from '@/components/EventCard';
import YellowShapeBanner from '@/components/YellowShapeBanner';
import { Search, Filter } from 'lucide-react';

const CATEGORIES = ['all', 'conference', 'seminar', 'concert', 'exhibition', 'corporate'];

export default function EventsPage() {
  const { t, events } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOpen, setSortOpen] = useState(false);
  const [showPast, setShowPast] = useState(false);

  useEffect(() => {
    const close = (e) => {
      if (!e.target.closest('[data-sort-dropdown]')) setSortOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const sortOptions = [
    { value: 'date', label: t.eventsPage?.sortByDate || 'Sort by Date' },
    { value: 'price-asc', label: t.eventsPage?.priceLowHigh || 'Price: Low to High' },
    { value: 'price-desc', label: t.eventsPage?.priceHighLow || 'Price: High to Low' },
  ];

  const filtered = events
    .filter(ev => {
      if (showPast) return true;
      const isPast = new Date(ev.date).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
      return !isPast;
    })
    .filter(ev => {
      const matchCat = activeCategory === 'all' || ev.category === activeCategory;
      const matchSearch = !search ||
        ev.title.toLowerCase().includes(search.toLowerCase()) ||
        (ev.titleRu || '').toLowerCase().includes(search.toLowerCase()) ||
        (ev.titleUz || '').toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') return new Date(a.date) - new Date(b.date);
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {/* Header */}
        <div style={{
          padding: '120px 0 20px',
          background: 'var(--bg-primary)'
        }}>
          <div className="container">
            <h1 className="section-title" style={{ marginBottom: '8px' }}>
              {t.events.title} <span>{t.events.titleHighlight}</span>
            </h1>
            <p className="section-subtitle" style={{ textAlign: 'left', margin: 0 }}>{t.events.subtitle}</p>
          </div>
        </div>

        <div style={{ padding: '20px 0 80px', background: 'var(--bg-primary)' }}>
          <div className="container">
            {/* Filters */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={16} style={{
                  position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }} />
                <input
                  type="text"
                  placeholder={t.eventsPage?.searchPlaceholder || 'Search events...'}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '42px' }}
                />
              </div>

              {/* Sort */}
              <div data-sort-dropdown style={{ position: 'relative', width: 'auto', minWidth: '220px' }}>
                <button
                  onClick={() => setSortOpen(!sortOpen)}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: '12px',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                    color: 'var(--text-primary)', fontSize: '14px', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-bright)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {sortOptions.find(o => o.value === sortBy)?.label || t.eventsPage?.sortBy || 'Sort by...'}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: sortOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>
                {sortOpen && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                    background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: '12px', overflow: 'hidden',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
                    animation: 'fadeInDown 0.2s ease', zIndex: 50
                  }}>
                    {sortOptions.map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => { setSortBy(opt.value); setSortOpen(false); }}
                        style={{
                          width: '100%', padding: '12px 16px',
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          background: sortBy === opt.value ? 'rgba(255, 221, 0, 0.1)' : 'transparent',
                          border: 'none', borderBottom: '1px solid var(--border)',
                          color: sortBy === opt.value ? 'var(--text-accent)' : 'var(--text-secondary)',
                          fontSize: '14px', fontWeight: sortBy === opt.value ? 700 : 500,
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => { if (sortBy !== opt.value) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                        onMouseLeave={e => { if (sortBy !== opt.value) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Show Past Toggle */}
              <button
                onClick={() => setShowPast(!showPast)}
                style={{
                  padding: '12px 18px',
                  borderRadius: '12px',
                  background: showPast ? 'rgba(255, 221, 0, 0.15)' : 'var(--bg-secondary)',
                  border: showPast ? '1px solid #FFDD00' : '1px solid var(--border)',
                  color: showPast ? '#FFDD00' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                {showPast ? '✓ Showing All Events' : 'Include Past Events'}
              </button>
            </div>

            {/* Category tabs */}
            <div style={{
              display: 'flex', gap: '8px', marginBottom: '32px',
              flexWrap: 'wrap',
            }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    fontSize: '13px', fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-sans)',
                    ...(activeCategory === cat
                      ? { background: 'linear-gradient(135deg, #FFDD00, #FFDD00)', color: '#ffffff', boxShadow: '0 4px 12px rgba(255, 221, 0, 0.35)' }
                      : { background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }
                    ),
                  }}
                >
                  {t.events[cat] || cat}
                </button>
              ))}
            </div>

            {/* Count */}
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              {filtered.length} {t.eventsPage?.eventsFound || `event${filtered.length !== 1 ? 's' : ''} found`}
            </p>

            {/* Events grid */}
            {filtered.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px',
              }}>
                {filtered.map(ev => <EventCard key={ev.id} event={ev} />)}
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '80px 20px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
              }}>
                <div style={{
                  width: '64px', height: '64px', background: 'var(--bg-secondary)',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '20px', border: '1px solid var(--border)'
                }}>
                  <Search size={24} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{t.events.noEvents}</h3>
                <p style={{ color: 'var(--text-secondary)' }}>{t.eventsPage?.emptyState || 'Try adjusting your search or filters'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Yellow Geometric iTicket Banner */}
        <YellowShapeBanner />
      </main>
      <Footer />
    </div>
  );
}
