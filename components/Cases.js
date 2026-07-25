'use client';
import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight, Play, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const YoutubeIcon = ({ size = 14, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" style={style}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const InstagramIcon = ({ size = 14, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const FALLBACK_IMG = "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=75&auto=format";

const parseEmbedUrl = (url) => {
  if (!url) return "https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1";
  if (url.includes('youtube.com/embed/')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=1`;
  }
  return "https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1";
};

export default function Cases() {
  const { t, cmsVideos } = useApp();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  const defaultCases = t.casesSection?.items || [
    { id: 1, title: "Global Tech Summit Highlights", category: "Conference", platform: "youtube", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=75&auto=format", videoUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A" },
    { id: 2, title: "Annual Award Gala Night", category: "Ceremony", platform: "youtube", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=75&auto=format", videoUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso" }
  ];

  const rawList = cmsVideos && cmsVideos.length > 0 ? cmsVideos : defaultCases;
  const casesList = rawList.map((item, idx) => {
    const translatedItem = t.casesSection?.items?.[idx];
    if (translatedItem && (!item.title || item.title === "Global Tech Summit Highlights" || item.title === "Annual Award Gala Night" || item.title === "Grand Hall Interior & Setup" || item.title === "Corporate Strategy Offsite")) {
      return { ...item, title: translatedItem.title, category: translatedItem.category || item.category };
    }
    return item;
  });

  const scrollRef = useRef(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  // Scroll controls
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Mouse Drag to Scroll handlers
  const handleMouseDown = (e) => {
    setIsMouseDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeaveOrUp = () => {
    setIsMouseDown(false);
  };

  const handleMouseMove = (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <section style={{ padding: '60px 0 90px', background: 'var(--bg-primary)', overflow: 'hidden', position: 'relative' }}>
      
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

      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', marginBottom: '32px', position: 'relative', zIndex: 2 }}>
        <div>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 900, color: '#000000', letterSpacing: '-0.02em' }}>
            {t.casesSection?.title} <span>{t.casesSection?.titleHighlight}</span>
          </h2>
          <p style={{ color: 'rgba(0,0,0,0.85)', fontSize: '16px', fontWeight: 600, marginTop: '8px' }}>
            {t.casesSection?.description}
          </p>
        </div>
      </div>

      {/* Interactive Drag & Scroll Container */}
      <div style={{ position: 'relative', width: '100%', zIndex: 2 }}>
        


        {/* Scrollable Track */}
        <div 
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeaveOrUp}
          onMouseUp={handleMouseLeaveOrUp}
          onMouseMove={handleMouseMove}
          style={{
            display: 'flex',
            gap: '24px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            padding: '24px 24px 32px',
            cursor: isMouseDown ? 'grabbing' : 'grab',
            userSelect: 'none',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
          className="hide-scrollbar"
        >
          {casesList.map((c, index) => {
            const imgSrc = imageErrors[c.id] || !c.image ? FALLBACK_IMG : c.image;
            const isHovered = hoveredIndex === index;
            return (
              <div 
                key={c.id}
                onClick={() => setActiveVideo({ ...c, embedUrl: parseEmbedUrl(c.videoUrl || c.embedUrl) })}
                style={{
                  position: 'relative', 
                  width: '270px',
                  height: '480px',
                  borderRadius: '32px', 
                  overflow: 'hidden', 
                  cursor: 'pointer',
                  flexShrink: 0,
                  boxShadow: isHovered ? '0 20px 45px rgba(0,0,0,0.2)' : '0 12px 36px rgba(0,0,0,0.1)',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)'
                }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <Image 
                  src={imgSrc} 
                  alt={c.title} 
                  fill 
                  sizes="270px"
                  style={{ 
                    objectFit: 'cover',
                    transition: 'transform 0.5s ease',
                    transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                    filter: isHovered ? 'brightness(0.85)' : 'brightness(0.75)'
                  }}
                  onError={() => handleImageError(c.id)}
                  unoptimized
                />

                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  padding: '24px',
                  zIndex: 2
                }}>
                  
                  {/* Platform Badge */}
                  <div style={{ alignSelf: 'flex-end' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '6px 12px',
                      borderRadius: '100px',
                      background: c.platform === 'youtube' ? 'rgba(255, 0, 0, 0.9)' : 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 700,
                      backdropFilter: 'blur(8px)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                      {c.platform === 'youtube' ? <YoutubeIcon size={14} /> : <InstagramIcon size={14} />}
                      {c.platform === 'youtube' ? 'YouTube' : 'Instagram'}
                    </span>
                  </div>

                  {/* Play Button Icon */}
                  <div style={{ alignSelf: 'center', margin: 'auto 0' }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: '#FFDD00',
                      color: '#000000',
                      display: 'grid',
                      placeItems: 'center',
                      boxShadow: '0 0 30px rgba(255, 221, 0, 0.5)',
                      transition: 'transform 0.3s ease',
                      transform: isHovered ? 'scale(1.15)' : 'scale(1)'
                    }}>
                      <Play size={26} fill="#000000" color="#000000" style={{ display: 'block', transform: 'translateX(1px)' }} />
                    </div>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#FFDD00',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      marginBottom: '6px'
                    }}>
                      {c.category}
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 800,
                      color: '#ffffff',
                      lineHeight: 1.3,
                      margin: 0
                    }}>
                      {c.title}
                    </h3>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Controls Below Videos */}
      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '36px auto 0', 
        padding: '0 24px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: '16px',
        flexWrap: 'wrap',
        position: 'relative', 
        zIndex: 3 
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => scroll('left')}
            aria-label="Scroll left"
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.12)',
              color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFDD00'; e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ChevronLeft size={22} />
          </button>
          <button 
            onClick={() => scroll('right')}
            aria-label="Scroll right"
            style={{
              width: '48px', height: '48px', borderRadius: '50%',
              background: '#ffffff', border: '1px solid rgba(0,0,0,0.12)',
              color: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease',
              boxShadow: '0 4px 14px rgba(0,0,0,0.08)'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFDD00'; e.currentTarget.style.transform = 'scale(1.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <ChevronRight size={22} />
          </button>
        </div>

        <Link href="/events" style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '10px',
          padding: '14px 36px',
          borderRadius: '100px',
          background: '#FFDD00',
          color: '#000000',
          fontWeight: 900,
          fontSize: '16px',
          textDecoration: 'none',
          boxShadow: '0 8px 24px rgba(255, 221, 0, 0.45)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#000000'; e.currentTarget.style.color = '#FFDD00'; e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 0, 0, 0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#FFDD00'; e.currentTarget.style.color = '#000000'; e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 221, 0, 0.45)'; }}
        >
          <span>{t.casesSection?.viewAll}</span> <ArrowRight size={18} />
        </Link>
      </div>

      {/* Video Modal Player */}
      {activeVideo && (
        <div 
          onClick={() => setActiveVideo(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease'
          }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '900px',
              aspectRatio: '16/9',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              background: '#000000'
            }}
          >
            <button
              onClick={() => setActiveVideo(null)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                zIndex: 10,
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.6)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <X size={20} />
            </button>

            <iframe 
              src={activeVideo.embedUrl} 
              title={activeVideo.title}
              style={{ width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
