'use client';
import { use, useEffect, useRef } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Maximize, ArrowRight, CheckCircle, Clock, CalendarDays, Calendar } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HALLS_LIST, formatPrice } from '@/lib/data';
import { useApp } from '@/context/AppContext';

export default function HallDetailsPage(props) {
  const params = use(props.params);
  const { t, hallsList: appHalls } = useApp();
  const halls = appHalls && appHalls.length > 0 ? appHalls : HALLS_LIST;
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

  if (!hall) {
    notFound();
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
        
        <div className="container" style={{ paddingTop: '120px', paddingBottom: '48px' }}>
          
          {/* Breadcrumbs */}
          <div style={{ fontSize: '15px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>{t.hallDetail?.home}</Link> / <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{hall.title}</span>
          </div>

          {/* Hall Tabs */}
          <div className="hide-scrollbar" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '24px' }}>
            {halls.map(h => (
              <Link key={h.id} href={`/halls/${h.id}`} style={{
                padding: '12px 24px',
                borderRadius: '100px',
                background: h.id === hall.id ? '#FFDD00' : 'var(--bg-secondary)',
                color: h.id === hall.id ? '#000000' : 'var(--text-primary)',
                fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap',
                textDecoration: 'none', transition: 'all 0.2s',
                border: h.id === hall.id ? '1px solid #FFDD00' : '1px solid var(--border)'
              }}>
                {h.title}
              </Link>
            ))}
          </div>

          {/* Gallery Slider */}
          <div ref={scrollRef} className="hide-scrollbar" style={{
            display: 'flex', overflowX: 'auto', scrollSnapType: 'x mandatory', 
            borderRadius: '24px', marginBottom: '48px',
            scrollbarWidth: 'none', msOverflowStyle: 'none',
            border: '1px solid var(--border)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.06)'
          }}>
            {(hall.images && hall.images.length > 0 ? hall.images : [hall.image || "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80"]).map((img, idx) => (
              <div key={idx} style={{ width: '100%', flexShrink: 0, scrollSnapAlign: 'start' }}>
                <img src={img} alt={`${hall.title} - ${idx + 1}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="container">
          <div className="event-details-grid" style={{ gap: '48px', alignItems: 'start' }}>
            
            {/* Left Column: Details */}
            <div style={{ minWidth: 0, width: '100%' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '20px' }}>
                {t.hallDetail?.aboutHall}
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: '48px' }}>
                {hall.description}
              </p>

              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '24px' }}>
                {t.hallDetail?.whatOffers}
              </h2>
              <div className="responsive-grid-2" style={{ gap: '20px', marginBottom: '48px' }}>
                {amenities.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500 }}>
                    <CheckCircle size={20} style={{ color: '#10b981' }} />
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Sticky Booking Card */}
            <div style={{ position: 'sticky', top: '100px', minWidth: 0, width: '100%' }}>
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: '24px',
                padding: '32px',
                border: '1px solid var(--border)',
                boxShadow: '0 24px 48px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFDD00', marginBottom: '8px' }}>
                  {hall.price}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                  {t.hallDetail?.fullyEquipped}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.hallDetail?.capacity}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hall.capacity}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{t.hallDetail?.area}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{hall.area}</span>
                  </div>
                </div>

                <Link href={`/rent?hallId=${hall.id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  width: '100%', padding: '16px',
                  background: '#FFDD00', color: '#000000',
                  borderRadius: '16px', fontSize: '16px', fontWeight: 800,
                  textDecoration: 'none', transition: 'all 0.2s',
                  boxShadow: '0 8px 24px rgba(255, 221, 0, 0.4)'
                }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                  {t.hallDetail?.bookHall} <ArrowRight size={18} />
                </Link>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  {t.hallDetail?.notCharged}
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
