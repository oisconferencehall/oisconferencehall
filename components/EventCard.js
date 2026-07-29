'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, Clock, Users, ArrowRight, Star } from 'lucide-react';
import { formatPrice } from '@/lib/data';

const CATEGORY_COLORS = {
  conference: { bg: 'rgba(79,70,229,0.15)', color: '#818cf8', border: 'rgba(79,70,229,0.3)' },
  seminar:    { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: 'rgba(16,185,129,0.3)' },
  concert:    { bg: 'rgba(255, 221, 0, 0.35)', color: '#FFDD00', border: 'rgba(255, 221, 0, 0.35)' },
  exhibition: { bg: 'rgba(236,72,153,0.12)', color: '#f472b6', border: 'rgba(236,72,153,0.3)' },
  corporate:  { bg: 'rgba(6,182,212,0.12)',  color: '#22d3ee', border: 'rgba(6,182,212,0.3)' },
  movie:      { bg: 'rgba(234,88,12,0.15)',  color: '#fb923c', border: 'rgba(234,88,12,0.3)' },
};

export default function EventCard({ event }) {
  const { t, lang, hallBlocks } = useApp();
  const cardRef = useRef(null);

  const title = lang === 'uz' ? (event.titleUz || event.title)
    : lang === 'ru' ? (event.titleRu || event.title)
    : event.title;

  const dynamicCapacity = hallBlocks ? hallBlocks.reduce((sum, b) => sum + (b.rows * b.cols), 0) : 186;

  const cat = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.conference;
  const bookedCount = event.bookedSeats?.length || 0;
  const totalSeats = event.totalSeats || dynamicCapacity;
  const remaining = totalSeats - bookedCount;
  const fillPct = Math.max(0, Math.min((remaining / totalSeats) * 100, 100));

  const formatDate = (d) => {
    const dt = new Date(d);
    if (lang === 'uz') {
      const uzMonths = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyun', 'Iyul', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek'];
      return `${dt.getDate()} ${uzMonths[dt.getMonth()]}, ${dt.getFullYear()}`;
    }
    return dt.toLocaleDateString(
      lang === 'ru' ? 'ru-RU' : 'en-US',
      { day: 'numeric', month: 'short', year: 'numeric' }
    );
  };

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(10px)`;
  };
  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateZ(0)';
    el.style.boxShadow = 'var(--shadow-card)';
    el.style.borderColor = 'var(--border)';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        transition: 'transform 0.15s ease, box-shadow 0.3s ease, border-color 0.3s ease',
        cursor: 'pointer',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255, 221, 0, 0.35)';
        e.currentTarget.style.boxShadow = '0 24px 60px rgba(0,0,0,0.1), 0 0 20px rgba(255, 221, 0, 0.15)';
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
        <Image
          src={event.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=75&auto=format'}
          alt={title}
          fill
          style={{ objectFit: 'cover', transition: 'transform 0.5s ease' }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />

        {/* Category badge */}
        <div style={{
          position: 'absolute', top: '14px', left: '14px',
          padding: '5px 12px', borderRadius: '9999px',
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`,
          backdropFilter: 'blur(6px)',
        }}>
          {t.events[event.category] || event.category}
        </div>

        {/* Featured star */}
        {event.featured && (
          <div style={{
            position: 'absolute', top: '14px', right: '14px',
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'rgba(255, 221, 0, 0.35)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 221, 0, 0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Star size={14} fill="#FFDD00" color="#FFDD00" />
          </div>
        )}

        {/* Price tag (iTicket signature style) */}
        <div style={{
          position: 'absolute', bottom: '14px', right: '14px',
          background: '#FFDD00',
          color: '#000000',
          borderRadius: '100px',
          padding: '7px 16px',
          fontSize: '13px', fontWeight: 900,
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
          display: 'flex', alignItems: 'center', gap: '4px',
          zIndex: 2
        }}>
          {event.price <= 0 ? (
            <span>{t.eventsPage?.free || 'Bepul'}</span>
          ) : (
            <>
              <span>{formatPrice(event.price)}</span>
              <span style={{ fontSize: '11px', fontWeight: 800 }}>{t.common?.currency || "so'm"}</span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        <h3 style={{
          fontSize: '17px', fontWeight: 700, marginBottom: '12px',
          lineHeight: 1.3, color: 'var(--text-primary)',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {title}
        </h3>

        {/* Meta info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px' }}>
          {[
            { icon: <Calendar size={13} />, value: formatDate(event.date) },
            { icon: <Clock size={13} />, value: `${event.time} — ${event.endTime}` },
            { icon: <Users size={13} />, value: `${event.organizer}` },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--text-accent)', flexShrink: 0 }}>{item.icon}</span>
              {item.value}
            </div>
          ))}
        </div>


        <Link
          href={`/events/${event.id}`}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            padding: '12px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #FFDD00, #FFDD00)',
            color: '#000000', fontWeight: 700, fontSize: '14px',
            textDecoration: 'none',
            transition: 'all 0.25s ease',
            boxShadow: '0 4px 16px rgba(255, 221, 0, 0.35)',
            position: 'relative', overflow: 'hidden',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(255, 221, 0, 0.35)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 221, 0, 0.35)';
          }}
        >
          {t.eventCard.book} <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  );
}
