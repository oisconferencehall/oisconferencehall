'use client';
import { use, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Maximize, ArrowRight, CheckCircle, Clock, CalendarDays, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { formatPrice } from '@/lib/data';
import { useApp } from '@/context/AppContext';

export default function HallDetailsPage(props) {
  const router = useRouter();
  const params = use(props.params);
  const { t, hallsList: appHalls, loading } = useApp();
  const halls = appHalls || [];
  const hall = halls.find(h => String(h.id) === String(params.id));
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const scrollAmount = container.clientWidth;
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
          container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          container.scrollTo({ left: container.scrollLeft + scrollAmount, behavior: 'smooth' });
        }
      }
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  // Common amenities to list (mock data for the visual)
  const amenities = [
    { icon: 'wifi', label: t.hallDetail?.amenities?.wifi },
    { icon: 'projector', label: t.hallDetail?.amenities?.projector },
    { icon: 'sound', label: t.hallDetail?.amenities?.sound },
    { icon: 'ac', label: t.hallDetail?.amenities?.climate },
    { icon: 'parking', label: t.hallDetail?.amenities?.parking },
    { icon: 'catering', label: t.hallDetail?.amenities?.catering }
  ];

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" style={{ paddingBottom: '100px' }}>
        
        <div className="container" style={{ paddingTop: '140px', paddingBottom: '48px' }}>
          
          {/* Breadcrumbs & Tabs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.currentTarget.style.color='var(--text-primary)'} onMouseLeave={e => e.currentTarget.style.color='inherit'}>
                {t.hallDetail?.home}
              </Link> 
              <span style={{ margin: '0 8px' }}>/</span> 
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{hall.title}</span>
            </div>
            
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px' }}>
              {halls.map(h => (
                <Link key={h.id} href={`/halls/${h.id}`} style={{
                  padding: '10px 24px', borderRadius: '100px',
                  background: h.id === hall.id ? 'var(--text-primary)' : 'transparent',
                  color: h.id === hall.id ? 'var(--bg-primary)' : 'var(--text-secondary)',
                  border: h.id === hall.id ? '1px solid var(--text-primary)' : '1px solid var(--border)',
                  fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', textDecoration: 'none',
                  transition: 'all 0.2s'
                }} onMouseEnter={e => { if(h.id !== hall.id) e.currentTarget.style.borderColor = 'var(--text-primary)'; }}
                   onMouseLeave={e => { if(h.id !== hall.id) e.currentTarget.style.borderColor = 'var(--border)'; }}>
                  {h.title}
                </Link>
              ))}
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="event-details-grid" style={{ gap: '64px', alignItems: 'start' }}>
            
            {/* Left Column: Sticky Gallery */}
            <div style={{ position: 'sticky', top: '120px', width: '100%', zIndex: 10 }}>
              <div ref={scrollRef} className="hide-scrollbar" style={{
                display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', 
                borderRadius: '24px',
                scrollbarWidth: 'none', msOverflowStyle: 'none',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.08)',
                aspectRatio: '4/3',
                background: 'var(--bg-secondary)',
                position: 'relative'
              }}>
                {(hall.images && hall.images.length > 0 ? hall.images : [hall.image || "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80"]).map((img, idx) => (
                  <div key={idx} style={{ width: '100%', flexShrink: 0, scrollSnapAlign: 'start', position: 'relative' }}>
                    <img src={img} alt={`${hall.title} - ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 30%)' }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Informations & Booking Card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingTop: '8px' }}>
              
              {/* Hall Header & Description */}
              <div>
                <h1 style={{ fontSize: 'clamp(36px, 4vw, 56px)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '32px', lineHeight: 1.1, letterSpacing: '-0.03em' }}>
                  {hall.title}
                </h1>
                
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t.hallDetail?.aboutHall}
                </h3>
                
                <p style={{ fontSize: '17px', lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: '0' }}>
                  {hall.description}
                </p>
              </div>

              {/* Booking Card */}
              <div style={{
                background: 'var(--bg-card)', borderRadius: '24px', padding: '40px',
                border: '1px solid var(--border)',
                boxShadow: '0 32px 64px rgba(0,0,0,0.05)',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'rgba(255,221,0,0.15)', filter: 'blur(60px)', borderRadius: '50%' }} />

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
                  <span style={{ fontSize: '36px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>{hall.price}</span>
                </div>
                <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                  {t.hallDetail?.fullyEquipped}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
                      <Users size={22} style={{ color: 'var(--text-primary)' }} />
                      <span style={{ fontSize: '16px' }}>{t.hallDetail?.capacity}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px' }}>{hall.capacity}</span>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)' }}>
                      <Maximize size={22} style={{ color: 'var(--text-primary)' }} />
                      <span style={{ fontSize: '16px' }}>{t.hallDetail?.area}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '18px' }}>{hall.area}</span>
                  </div>
                </div>

                <Link href={`/rent?hallId=${hall.id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
                  width: '100%', padding: '20px',
                  background: 'var(--text-primary)', color: 'var(--bg-primary)',
                  borderRadius: '100px', fontSize: '18px', fontWeight: 700,
                  textDecoration: 'none', transition: 'all 0.3s',
                  position: 'relative', zIndex: 1
                }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = '#FFDD00'; e.currentTarget.style.color = '#000'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(255, 221, 0, 0.3)'; }} 
                   onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--text-primary)'; e.currentTarget.style.color = 'var(--bg-primary)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  {t.hallDetail?.bookHall} <ArrowRight size={20} />
                </Link>
                <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
                  {t.hallDetail?.notCharged}
                </div>
              </div>

              {/* Amenities Section */}
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {t.hallDetail?.whatOffers}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                  {amenities.map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-secondary)', fontSize: '16px', fontWeight: 500 }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                        <CheckCircle size={20} style={{ color: 'var(--text-primary)' }} />
                      </div>
                      {item.label}
                    </div>
                  ))}
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
