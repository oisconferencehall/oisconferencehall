'use client';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Users, Maximize, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { HALLS_LIST } from '@/lib/data';
import { useApp } from '@/context/AppContext';

export default function OurHalls() {
  const { t, hallsList: appHalls } = useApp();
  const halls = appHalls && appHalls.length > 0 ? appHalls : HALLS_LIST;
  const scrollRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000); // Wait 4 seconds, then slide next
    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const itemWidth = container.firstElementChild.offsetWidth + 24; // Card width + gap
      
      // If we are near the end, loop back to the start
      if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollTo({ left: container.scrollLeft + itemWidth, behavior: 'smooth' });
      }
    }
  };

  const handlePrev = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const itemWidth = container.firstElementChild.offsetWidth + 24;
      container.scrollTo({ left: Math.max(0, container.scrollLeft - itemWidth), behavior: 'smooth' });
    }
  };

  return (
    <section className="reveal" style={{ padding: '60px 0 90px', background: 'var(--bg-primary)', overflow: 'hidden', position: 'relative' }}>
      
      {/* iTicket Signature Header & Diagonal Background Shape */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '420px',
        background: '#FFDD00',
        clipPath: 'polygon(0 0, 100% 0, 100% 42%, 0 92%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      
      <style dangerouslySetInnerHTML={{__html: `
        .hall-card {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
          cursor: pointer;
          text-decoration: none;
        }
        .hall-card:hover {
          transform: scale(1.03) translateY(-4px) !important;
          box-shadow: 0 24px 48px rgba(0,0,0,0.12) !important;
          z-index: 10 !important;
        }
        .hall-image-container {
          overflow: hidden;
        }
        .hall-image-container img {
          transition: transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .hall-card:hover .hall-image-container img {
          transform: scale(1.08) !important;
        }
      `}} />

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 2 }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 44px)', fontWeight: 900, color: '#000000', letterSpacing: '-0.02em' }}>
            {t.halls?.ourHalls || 'Our Halls'}
          </h2>
        </div>
      </div>

      {/* Carousel Container */}
      <div 
        ref={scrollRef}
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none',  // IE/Edge
          paddingTop: '24px', // Top padding so hover transform doesn't get clipped by overflowX
          paddingBottom: '48px', // Extra space for shadow and transform
          // This aligns the first card with the 1200px container while allowing the slider to bleed to the screen edges
          paddingLeft: 'clamp(16px, 5vw, 48px)',
          paddingRight: 'clamp(16px, 5vw, 48px)',
          maxWidth: '100vw',
          width: '100%',
        }}
        className="hide-scrollbar"
      >
        {halls.map((hall) => (
          <Link href={`/halls/${hall.id}`} key={hall.id} className="hall-card" style={{
            background: 'var(--bg-card)',
            borderRadius: '24px',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
            display: 'flex', flexDirection: 'column',
            width: '350px',
            maxWidth: '85vw',
            flexShrink: 0,
            scrollSnapAlign: 'start',
            color: 'inherit'
          }}>
            
            {/* Image */}
            <div className="hall-image-container" style={{ position: 'relative', height: '220px', width: '100%' }}>
              <Image src={hall.image} alt={hall.title} fill style={{ objectFit: 'cover' }} />
            </div>

            {/* Content */}
            <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
                {hall.title}
              </h3>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                  <Users size={14} /> {hall.capacity}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 500 }}>
                  <Maximize size={14} /> {hall.area}
                </div>
              </div>

              <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFDD00', marginBottom: '24px' }}>
                {hall.price}
              </div>

              <div style={{ marginTop: 'auto' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', textDecoration: 'none',
                  transition: 'color 0.2s'
                }}>
                  {t.halls?.details || 'Details'} <ArrowRight size={14} />
                </div>
              </div>
            </div>

          </Link>
        ))}
      </div>

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        {/* Pagination Controls */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px' }}>
          <button onClick={handlePrev} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-primary)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={handleNext} style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-primary)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)', transition: 'all 0.2s'
          }} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-card)'}>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

    </section>
  );
}
