'use client';
import { useState, useEffect } from 'react';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const feedbacks = [
  {
    id: 1,
    name: "Alexey Smirnov",
    role: "Event Organizer, TechSummit",
    text: "The Grand Hall was absolutely perfect for our annual tech conference. The acoustic treatment and lighting systems were flawless. Highly recommended!",
    rating: 5,
  },
  {
    id: 2,
    name: "Elena Petrova",
    role: "CEO, Innovate Corp",
    text: "Exceptional service from start to finish. The catering team exceeded our expectations, and the VIP parking made it very convenient for our guests.",
    rating: 5,
  },
  {
    id: 3,
    name: "Rustam Karimov",
    role: "Wedding Planner",
    text: "We hosted a luxurious wedding here and everything was breathtaking. The customizable layout of the hall allowed us to create a magical atmosphere.",
    rating: 5,
  }
];

export default function Feedbacks() {
  const { t } = useApp();
  const displayFeedbacks = t.feedbacksSection?.items || feedbacks;
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => setActiveIndex((prev) => (prev + 1) % displayFeedbacks.length);
  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + displayFeedbacks.length) % displayFeedbacks.length);

  return (
    <section style={{ padding: '100px 24px', background: 'var(--bg-primary)', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(255, 221, 0, 0.05) 0%, transparent 70%)',
        filter: 'blur(60px)', pointerEvents: 'none'
      }} />
      
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>

          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {t.feedbacksSection?.title} <span style={{ color: 'var(--text-accent)' }}>{t.feedbacksSection?.titleHighlight}</span>
          </h2>
        </div>

        <div style={{ position: 'relative', padding: '40px', background: 'var(--bg-secondary)', borderRadius: '32px', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
          <Quote size={48} style={{ color: 'rgba(255, 221, 0, 0.15)', position: 'absolute', top: '30px', left: '40px' }} />
          
          <div style={{ position: 'relative', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
            {displayFeedbacks.map((fb, i) => (
              <div key={fb.id} style={{
                position: i === activeIndex ? 'relative' : 'absolute',
                opacity: i === activeIndex ? 1 : 0,
                transform: i === activeIndex ? 'translateY(0)' : 'translateY(20px)',
                transition: 'all 0.5s ease',
                pointerEvents: i === activeIndex ? 'auto' : 'none',
                width: '100%'
              }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '24px' }}>
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={18} fill={idx < fb.rating ? "#FFDD00" : "transparent"} color={idx < fb.rating ? "#FFDD00" : "var(--border)"} />
                  ))}
                </div>
                <p style={{ fontSize: 'clamp(18px, 3vw, 24px)', color: 'var(--text-primary)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '32px', maxWidth: '800px', margin: '0 auto 32px' }}>
                  &quot;{fb.text}&quot;
                </p>
                <div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>{fb.name}</h4>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{fb.role}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '40px' }}>
            <button onClick={handlePrev} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <ChevronLeft size={20} />
            </button>
            <button onClick={handleNext} style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-card)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--text-accent)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
