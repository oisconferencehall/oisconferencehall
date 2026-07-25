'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { HALLS_LIST } from '@/lib/data';
import { useApp } from '@/context/AppContext';

const CAROUSEL_ITEMS = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80',
    label: 'Convenient location for everyone',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=800&q=80',
    label: 'State-of-the-art technologies',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    label: 'Premium event spaces',
  },
  {
    id: 4,
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    label: 'High-level service',
  },
  {
    id: 5,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    label: 'Spacious and bright halls',
  },
];

export default function AdvantagesSection({ t, cmsData, totalSeats }) {
  const appCtx = useApp();
  const { cmsAdvantages } = appCtx;
  const activeT = t || appCtx?.t || {};

  const defaultItems = [
    { id: 1, image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80', label: activeT.advantages?.adv1 || 'Convenient location for everyone' },
    { id: 2, image: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=800&q=80', label: activeT.advantages?.adv2 || 'State-of-the-art technologies' },
    { id: 3, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', label: activeT.advantages?.adv5 || 'Premium event spaces' },
    { id: 4, image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', label: activeT.advantages?.adv3 || 'High-level service' },
    { id: 5, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', label: activeT.advantages?.adv4 || 'Spacious and bright halls' },
  ];

  const items = cmsAdvantages && cmsAdvantages.length > 0 ? cmsAdvantages.map((item) => ({
    ...item,
    label: (item.label === 'Convenient location for everyone' ? activeT.advantages?.adv1 :
            item.label === 'State-of-the-art technologies' ? activeT.advantages?.adv2 :
            item.label === 'Premium event spaces' ? activeT.advantages?.adv5 :
            item.label === 'High-level service' ? activeT.advantages?.adv3 :
            item.label === 'Spacious and bright halls' ? activeT.advantages?.adv4 : item.label) || item.label
  })) : defaultItems;

  const [activeIndex, setActiveIndex] = useState(0);
  const autoPlayRef = useRef(null);

  const goTo = useCallback((idx) => {
    setActiveIndex((idx + items.length) % items.length);
  }, [items.length]);

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  // Auto-play
  useEffect(() => {
    autoPlayRef.current = setInterval(goNext, 4000);
    return () => clearInterval(autoPlayRef.current);
  }, [goNext]);

  const resetAutoPlay = () => {
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(goNext, 4000);
  };

  const handleNext = () => { goNext(); resetAutoPlay(); };
  const handlePrev = () => { goPrev(); resetAutoPlay(); };
  const handleDot = (i) => { goTo(i); resetAutoPlay(); };

  // Calculate positions for 3D carousel
  const getCardStyle = (index) => {
    const total = items.length;
    let diff = index - activeIndex;
    // Wrap around
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;

    const isCenter = diff === 0;
    const isAdjacentLeft = diff === -1;
    const isAdjacentRight = diff === 1;
    const isVisible = Math.abs(diff) <= 1;

    if (!isVisible) {
      return {
        opacity: 0,
        transform: `translateX(${diff > 0 ? '120%' : '-120%'}) scale(0.6)`,
        zIndex: 0,
        pointerEvents: 'none',
      };
    }

    if (isCenter) {
      return {
        opacity: 1,
        transform: 'translateX(0) scale(1)',
        zIndex: 3,
        filter: 'none',
      };
    }

    if (isAdjacentLeft) {
      return {
        opacity: 0.6,
        transform: 'translateX(-88%) scale(0.82)',
        zIndex: 2,
        filter: 'blur(3px)',
      };
    }

    if (isAdjacentRight) {
      return {
        opacity: 0.6,
        transform: 'translateX(88%) scale(0.82)',
        zIndex: 2,
        filter: 'blur(3px)',
      };
    }

    return { opacity: 0, zIndex: 0, pointerEvents: 'none' };
  };

  return (
    <section style={{ padding: '100px 0 80px', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>


      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontSize: 'clamp(32px, 5vw, 48px)',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em'
          }}>
            {t.advantages?.title}{' '}
            <span style={{ color: '#ffdd00' }}>{t.advantages?.titleHighlight}</span>
          </h2>
        </div>


        {/* ===== 3D CAROUSEL SLIDER ===== */}
        <div style={{
          position: 'relative',
          paddingTop: '32px',
          paddingBottom: '32px',
          overflow: 'visible',
        }}>
          {/* Decorative yellow blur blobs */}
          <div style={{
            position: 'absolute', top: '20%', left: '-40px', width: '120px', height: '120px',
            background: 'rgba(255, 221, 0, 0.15)', borderRadius: '50%', filter: 'blur(40px)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '-40px', width: '80px', height: '80px',
            background: 'rgba(255, 221, 0, 0.12)', borderRadius: '50%', filter: 'blur(30px)', pointerEvents: 'none',
          }} />

          {/* Carousel Container */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            height: '420px',
          }}>
            {items.map((item, index) => {
              const style = getCardStyle(index);
              return (
                <div
                  key={item.id}
                  style={{
                    position: 'absolute',
                    top: 0, left: '50%',
                    width: '90%', maxWidth: '560px',
                    height: '380px',
                    marginLeft: 'max(-280px, -45%)',
                    borderRadius: '32px',
                    overflow: 'hidden',
                    WebkitMaskImage: '-webkit-radial-gradient(white, black)',
                    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                    cursor: 'pointer',
                    boxShadow: style.zIndex === 3 ? '0 20px 60px rgba(0,0,0,0.15)' : '0 8px 30px rgba(0,0,0,0.1)',
                    ...style,
                  }}
                  onClick={() => { goTo(index); resetAutoPlay(); }}
                >
                  <Image
                    src={item.image}
                    fill sizes="460px"
                    style={{ objectFit: 'cover', borderRadius: '32px' }}
                    alt={item.label}
                  />
                  {/* Bottom gradient overlay with label */}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    padding: '28px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0) 100%)',
                    display: 'flex', alignItems: 'flex-end', gap: '14px',
                    borderBottomLeftRadius: '32px',
                    borderBottomRightRadius: '32px',
                  }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '50%',
                      background: '#ffdd00',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', fontWeight: 800, color: '#000000',
                      flexShrink: 0,
                    }}>
                      {index + 1}
                    </div>
                    <div style={{
                      fontSize: '16px', fontWeight: 600, color: '#fff',
                      lineHeight: 1.3,
                    }}>
                      {item.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation: Arrows + Dots */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '16px', marginTop: '16px',
          }}>
            {/* Prev Arrow */}
            <button
              onClick={handlePrev}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                border: '2px solid #e5e5e5', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                color: '#999',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffdd00'; e.currentTarget.style.color = '#ffdd00'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#999'; }}
            >
              <ChevronLeft size={20} />
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => handleDot(i)}
                  style={{
                    width: activeIndex === i ? '24px' : '10px',
                    height: '10px',
                    borderRadius: '100px',
                    background: activeIndex === i ? '#ffdd00' : '#ddd',
                    border: 'none', cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0,
                  }}
                />
              ))}
            </div>

            {/* Next Arrow */}
            <button
              onClick={handleNext}
              style={{
                width: '44px', height: '44px', borderRadius: '50%',
                border: '2px solid #e5e5e5', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s',
                color: '#999',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#ffdd00'; e.currentTarget.style.color = '#ffdd00'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.color = '#999'; }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
