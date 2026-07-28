'use client';
import { use, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Maximize, ArrowRight, CheckCircle, Wifi, Monitor, Volume2, Thermometer, Car, UtensilsCrossed, ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/data';
import { useApp } from '@/context/AppContext';

const AMENITY_ICONS = {
  wifi: Wifi,
  projector: Monitor,
  sound: Volume2,
  ac: Thermometer,
  parking: Car,
  catering: UtensilsCrossed,
};

export default function HallDetailsPage(props) {
  const router = useRouter();
  const params = use(props.params);
  const { t, lang, hallsList: appHalls, loading } = useApp();
  const halls = appHalls || [];
  const hall = halls.find(h => String(h.id) === String(params.id));
  const scrollRef = useRef(null);
  const [activeImg, setActiveImg] = useState(0);

  const getHallTitle = (h) => {
    if (!h) return '';
    if (lang === 'ru' && (h.titleRu || h.title_ru)) return h.titleRu || h.title_ru;
    if (lang === 'uz' && (h.titleUz || h.title_uz)) return h.titleUz || h.title_uz;
    return h.title;
  };

  const getHallDesc = (h) => {
    if (!h) return '';
    if (lang === 'ru' && (h.descriptionRu || h.description_ru)) return h.descriptionRu || h.description_ru;
    if (lang === 'uz' && (h.descriptionUz || h.description_uz)) return h.descriptionUz || h.description_uz;
    return h.description;
  };

  const getHallCapacity = (h) => {
    if (!h || !h.capacity) return '';
    if (lang === 'ru' && (h.capacityRu || h.capacity_ru)) return h.capacityRu || h.capacity_ru;
    if (lang === 'uz' && (h.capacityUz || h.capacity_uz)) return h.capacityUz || h.capacity_uz;
    const str = String(h.capacity);
    if (lang === 'ru') return str.replace(/\bseats\b|\bpeople\b/gi, 'человек').replace(/kishi|o'rindiq/gi, 'человек');
    if (lang === 'uz') return str.replace(/\bseats\b|\bpeople\b/gi, 'kishi').replace(/человек|мест/gi, 'kishi');
    return str;
  };

  const images = hall ? (hall.images && hall.images.length > 0 ? hall.images : [hall.image].filter(Boolean)) : [];

  // Auto-scroll gallery
  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImg(prev => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  // Scroll to active image
  useEffect(() => {
    if (scrollRef.current && images.length > 1) {
      const container = scrollRef.current;
      container.scrollTo({ left: activeImg * container.clientWidth, behavior: 'smooth' });
    }
  }, [activeImg, images.length]);

  // Redirect if hall doesn't exist after loading
  useEffect(() => {
    if (!loading && !hall) {
      router.push('/halls');
    }
  }, [loading, hall, router]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div style={{ padding: '200px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="spinner"></div>
          <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>{t.common?.loading || 'Yuklanmoqda...'}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hall) {
    return null;
  }

  const amenities = [
    { key: 'wifi', label: t.hallDetail?.amenities?.wifi },
    { key: 'projector', label: t.hallDetail?.amenities?.projector },
    { key: 'sound', label: t.hallDetail?.amenities?.sound },
    { key: 'ac', label: t.hallDetail?.amenities?.climate },
    { key: 'parking', label: t.hallDetail?.amenities?.parking },
    { key: 'catering', label: t.hallDetail?.amenities?.catering }
  ];

  const goToPrev = () => setActiveImg(prev => (prev - 1 + images.length) % images.length);
  const goToNext = () => setActiveImg(prev => (prev + 1) % images.length);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">

        {/* ===== HERO IMAGE SECTION ===== */}
        <section style={{ position: 'relative', width: '100%', height: '80vh', minHeight: '500px', overflow: 'hidden', marginTop: '72px' }}>
          {/* Image Carousel */}
          <div ref={scrollRef} className="hide-scrollbar" style={{
            display: 'flex', width: '100%', height: '100%',
            overflowX: 'auto', scrollSnapType: 'x mandatory',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
          }}>
            {images.map((img, idx) => (
              <div key={idx} style={{ width: '100%', height: '100%', flexShrink: 0, scrollSnapAlign: 'start', position: 'relative' }}>
                <img src={img} alt={`${hall.title} - ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            ))}
          </div>

          {/* Gradient overlay (darker at top for navbar contrast, subtle at bottom for title) */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 35%, rgba(0,0,0,0.5) 100%)', pointerEvents: 'none' }} />

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button onClick={goToPrev} style={{
                position: 'absolute', left: '24px', top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', zIndex: 10
              }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                 onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={goToNext} style={{
                position: 'absolute', right: '24px', top: '50%', transform: 'translateY(-50%)',
                width: '48px', height: '48px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', zIndex: 10
              }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                 onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Bottom: Hall title overlay */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px', zIndex: 5 }}>
            <div className="container">
              {/* Breadcrumb */}
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '12px' }}>
                <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                  {t.hallDetail?.home}
                </Link>
                <span style={{ margin: '0 8px' }}>/</span>
                <Link href="/halls" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                  onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}>
                  {t.halls?.ourHalls || t.navbar?.ourHalls}
                </Link>
                <span style={{ margin: '0 8px' }}>/</span>
                <span style={{ color: '#fff' }}>{getHallTitle(hall)}</span>
              </div>
              <h1 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, letterSpacing: '-0.03em', margin: 0, textShadow: '0 2px 20px rgba(0,0,0,0.3)' }}>
                {getHallTitle(hall)}
              </h1>

              {/* Image dots */}
              {images.length > 1 && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  {images.map((_, idx) => (
                    <button key={idx} onClick={() => setActiveImg(idx)} style={{
                      width: idx === activeImg ? '32px' : '8px', height: '8px',
                      borderRadius: '100px', border: 'none', cursor: 'pointer',
                      background: idx === activeImg ? '#FFDD00' : 'rgba(255,255,255,0.4)',
                      transition: 'all 0.3s'
                    }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ===== HALL TABS (other halls) ===== */}
        {halls.length > 1 && (
          <div style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', position: 'sticky', top: '72px', zIndex: 20 }}>
            <div className="container">
              <div className="hide-scrollbar" style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '16px 0' }}>
                {halls.map(h => (
                  <Link key={h.id} href={`/halls/${h.id}`} style={{
                    padding: '10px 24px', borderRadius: '100px',
                    background: String(h.id) === String(hall.id) ? 'var(--text-primary)' : 'transparent',
                    color: String(h.id) === String(hall.id) ? 'var(--bg-primary)' : 'var(--text-secondary)',
                    border: String(h.id) === String(hall.id) ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                    fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none',
                    transition: 'all 0.2s'
                  }} onMouseEnter={e => { if(String(h.id) !== String(hall.id)) { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                     onMouseLeave={e => { if(String(h.id) !== String(hall.id)) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}>
                    {getHallTitle(h)}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== MAIN CONTENT ===== */}
        <div className="container" style={{ paddingTop: '48px', paddingBottom: '100px' }}>
          <div className="event-details-grid" style={{ gap: '64px', alignItems: 'start' }}>
            
            {/* LEFT: Description + Amenities */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
              
              {/* About Section */}
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#FFDD00', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {t.hallDetail?.aboutHall}
                </h2>
                <p style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-secondary)', margin: 0 }}>
                  {getHallDesc(hall)}
                </p>
              </div>

              {/* Quick Stats Bar */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px'
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '20px 24px', borderRadius: '16px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)'
                }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(255,221,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={22} style={{ color: '#FFDD00' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{getHallCapacity(hall)}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{t.hallDetail?.capacity}</div>
                  </div>
                </div>
                
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '16px',
                  padding: '20px 24px', borderRadius: '16px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)'
                }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(56,189,248,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Maximize size={22} style={{ color: '#38bdf8' }} />
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>{hall.area}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{t.hallDetail?.area}</div>
                  </div>
                </div>
              </div>

              {/* Amenities Grid */}
              <div>
                <h2 style={{ fontSize: '14px', fontWeight: 700, color: '#FFDD00', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {t.hallDetail?.whatOffers}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
                  {amenities.map((item, i) => {
                    const IconComponent = AMENITY_ICONS[item.key] || CheckCircle;
                    return (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '16px 20px', borderRadius: '16px',
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        transition: 'all 0.2s'
                      }} onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--text-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                         onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <IconComponent size={20} style={{ color: 'var(--text-primary)' }} />
                        </div>
                        <span style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text-primary)' }}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT: Sticky Booking Card */}
            <div style={{ position: 'sticky', top: '140px' }}>
              <div style={{
                background: 'var(--bg-card)', borderRadius: '24px', padding: '36px',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 64px rgba(0,0,0,0.08)',
                position: 'relative', overflow: 'hidden'
              }}>
                {/* Decorative glow */}
                <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '250px', height: '250px', background: 'rgba(255,221,0,0.12)', filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none' }} />

                {/* Price */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em', marginBottom: '6px', lineHeight: 1.2 }}>
                    {hall.price}
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '32px' }}>
                    {t.hallDetail?.fullyEquipped}
                  </div>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'var(--border)', marginBottom: '24px' }} />

                  {/* Capacity & Area compact */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                        <Users size={18} />
                        <span style={{ fontSize: '15px' }}>{t.hallDetail?.capacity}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{getHallCapacity(hall)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                        <Maximize size={18} />
                        <span style={{ fontSize: '15px' }}>{t.hallDetail?.area}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '15px' }}>{hall.area}</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link href={`/rent?hallId=${hall.id}`} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                    width: '100%', padding: '18px',
                    background: '#FFDD00', color: '#000',
                    borderRadius: '16px', fontSize: '16px', fontWeight: 700,
                    textDecoration: 'none', transition: 'all 0.3s',
                    boxShadow: '0 8px 24px rgba(255,221,0,0.25)'
                  }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(255,221,0,0.4)'; }}
                     onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255,221,0,0.25)'; }}>
                    {t.hallDetail?.bookHall} <ArrowRight size={18} />
                  </Link>

                  <p style={{ textAlign: 'center', marginTop: '16px', marginBottom: 0, fontSize: '13px', color: 'var(--text-muted)' }}>
                    {t.hallDetail?.notCharged}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
