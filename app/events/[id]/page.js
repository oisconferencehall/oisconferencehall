'use client';
import { useState, use, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SeatMap from '@/components/SeatMap';
import { HALL_INFO, formatPrice, generateTicketId } from '@/lib/data';
import {
  ArrowLeft, Calendar, Clock, MapPin, Users, Ticket,
  CreditCard, Smartphone, Banknote, CheckCircle, X, Info, Search
} from 'lucide-react';
import Link from 'next/link';

function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); ob.unobserve(el); } }, { threshold: 0.1 });
    ob.observe(el);
    return () => ob.disconnect();
  }, []);
  return { ref, visible };
}

export default function EventDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params);
  const { t, lang, events, addTicket, clearCart, user, loading } = useApp();

  const event = events.find(ev => ev.id === id);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const headerReveal = useReveal();
  const infoReveal = useReveal();
  const mapReveal = useReveal();

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

  if (!event) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div style={{ padding: '200px 0', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{
            width: '80px', height: '80px', background: 'var(--bg-secondary)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '24px', border: '1px solid var(--border)'
          }}>
            <Search size={32} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>{t.eventDetailPage?.notFound}</h2>
          <Link href="/events" className="btn btn-primary" style={{ display: 'inline-flex' }}>{t.eventDetailPage?.browseEvents}</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const title = lang === 'uz' ? (event.titleUz || event.title)
    : lang === 'ru' ? (event.titleRu || event.title)
    : event.title;

  const description = lang === 'uz' ? (event.descriptionUz || event.description)
    : lang === 'ru' ? (event.descriptionRu || event.description)
    : event.description;

  const totalPrice = selectedSeats.length * event.price;
  const isPastEvent = new Date(event.date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const handlePayment = async () => {
    if (!form.name || !form.phone || !form.email) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    const ticket = {
      id: generateTicketId(),
      eventId: event.id, eventTitle: title,
      eventDate: event.date, eventTime: event.time,
      seats: selectedSeats, totalPrice,
      payerName: form.name, payerPhone: form.phone, payerEmail: form.email,
      paymentMethod: 'on-site', status: 'confirmed', createdAt: new Date().toISOString(),
    };
    addTicket(ticket);
    setProcessing(false);
    setSuccess(true);
    clearCart?.();
  };

  if (success) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '100px 24px' }}>
          <div style={{ textAlign: 'center', maxWidth: '480px', animation: 'fadeInUp 0.5s ease' }}>
            {/* Success ring */}
            <div style={{ position: 'relative', width: '100px', height: '100px', margin: '0 auto 28px' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '50%',
                border: '2px solid rgba(16,185,129,0.3)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute', inset: '8px', borderRadius: '50%',
                background: 'rgba(16,185,129,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(16,185,129,0.4)',
              }}>
                <CheckCircle size={40} style={{ color: '#10b981' }} />
              </div>
            </div>
            <h2 style={{ fontSize: '32px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>{t.payment.success}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.7 }}>{t.payment.successMsg}</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link href="/profile" className="btn btn-primary">{t.payment.viewTickets || 'View Tickets'}</Link>
              <Link href="/events" className="btn btn-ghost">{t.events.viewAll}</Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main>

        {/* ── Hero Banner ── */}
        <div style={{ height: '360px', position: 'relative', overflow: 'hidden' }}>
          <img src={event.image} alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.05)', transition: 'transform 8s ease', position: 'absolute', inset: 0 }}
          />
          {/* Dark gradient overlay for navbar legibility */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(16, 12, 8, 0.9) 0%, rgba(16, 12, 8, 0.4) 40%, transparent 100%)', pointerEvents: 'none', zIndex: 0 }} />
          <div className="container" style={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: '32px' }}>
            <Link href="/events" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600,
              background: 'var(--bg-card)', backdropFilter: 'blur(8px)',
              border: '1px solid var(--border)',
              padding: '7px 14px', borderRadius: '9999px',
              textDecoration: 'none', width: 'fit-content', marginBottom: '16px',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 221, 0, 0.35)'; e.currentTarget.style.color = 'white'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <ArrowLeft size={14} /> {t.eventDetail.back}
            </Link>
          </div>
        </div>

        <div className="container" style={{ padding: '40px 24px 80px' }}>
          <div className="event-details-grid" style={{ gap: '48px', alignItems: 'start' }}>

            {/* ── LEFT COLUMN ── */}
            <div style={{ minWidth: 0, width: '100%' }}>
              {/* Category */}
              <div>
                <span className="badge badge-violet" style={{ marginBottom: '14px' }}>
                  {t.events[event.category]}
                </span>

                <h1 style={{
                  fontSize: 'clamp(26px, 3.5vw, 42px)',
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: 800, marginBottom: '20px', lineHeight: 1.15,
                  color: 'var(--text-primary)'
                }}>{title}</h1>

                {/* Info row */}
                <div className="responsive-grid-2" style={{
                  gap: '12px',
                  marginBottom: '28px',
                }}>
                  {[
                    { icon: <Calendar size={15} />, label: t.eventDetail.date, value: formatDate(event.date) },
                    { icon: <Clock size={15} />, label: t.eventDetail.time, value: `${event.time} – ${event.endTime}` },
                    { icon: <MapPin size={15} />, label: t.eventDetail.venue, value: t.footer?.brandName },
                    { icon: <Users size={15} />, label: t.eventDetail.organizer, value: event.organizer },
                  ].map((d, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: '10px', alignItems: 'flex-start',
                      padding: '14px 16px',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255, 221, 0, 0.35)'; e.currentTarget.style.background = 'rgba(255, 221, 0, 0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg-primary)'; }}
                    >
                      <span style={{ color: 'var(--text-accent)', marginTop: '2px', flexShrink: 0 }}>{d.icon}</span>
                      <div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.label}</div>
                        <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 600, marginTop: '3px' }}>{d.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.85, marginBottom: '40px', fontSize: '15px' }}>{description}</p>
              </div>

              {/* ── SEAT MAP ── */}
              <div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    width: '36px', height: '36px',
                    background: 'linear-gradient(135deg, rgba(255, 221, 0, 0.35), rgba(79,70,229,0.2))',
                    border: '1px solid rgba(255, 221, 0, 0.35)',
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Ticket size={18} style={{ color: '#ffffff' }} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>{t.eventDetail.selectSeats}</h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>{t.eventDetailPage?.seatHelp}</p>
                  </div>
                </div>

                {/* Map wrapper with glow */}
                <div style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px',
                  padding: '24px 16px',
                  boxShadow: 'var(--shadow-card)',
                  overflow: 'hidden',
                  maxWidth: '100%',
                }}>
                  <SeatMap
                    eventId={event.id}
                    bookedSeats={event.bookedSeats || []}
                    onSelectionChange={setSelectedSeats}
                    maxSelections={event.price <= 0 ? 1 : undefined}
                  />
                </div>
              </div>
            </div>

            {/* ── RIGHT: Booking panel ── */}
            <div style={{ position: 'sticky', top: '100px', minWidth: 0, width: '100%' }}>
              <div style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '20px', padding: '24px',
                boxShadow: 'var(--shadow-card)',
                transition: 'border-color 0.3s ease',
              }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>
                  {selectedSeats.length === 0 ? t.eventDetailPage?.selectSeats : `${selectedSeats.length} ${t.eventDetailPage?.seatsSelected}`}
                </h3>

                {/* Seat list */}
                {selectedSeats.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', maxHeight: '160px', overflowY: 'auto' }}>
                    {selectedSeats.map(seat => (
                      <div key={seat.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '7px 12px',
                        background: 'rgba(255, 221, 0, 0.15)',
                        border: '1px solid rgba(255, 221, 0, 0.35)',
                        borderRadius: '8px', fontSize: '12px',
                        animation: 'fadeInUp 0.2s ease',
                      }}>
                        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                          {t.eventDetail.section} {seat.block} · R{seat.row} · #{seat.col}
                          {seat.isVip && <span style={{ marginLeft: '6px', color: '#ffffff', fontSize: '10px', fontWeight: 700 }}>VIP</span>}
                        </span>
                        <span style={{ color: '#FFDD00', fontWeight: 700 }}>
                          {event.price <= 0 ? (t.eventsPage?.free || 'Free') : formatPrice(event.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ height: '1px', background: 'var(--border)', margin: '16px 0' }} />

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{t.eventDetail.totalPrice}</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-primary)' }}>
                      {event.price <= 0 ? (t.eventsPage?.free || 'Free') : (
                        <>
                          {formatPrice(totalPrice)}
                          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>{t.common?.currency || 'UZS'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  className="btn btn-gold"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '15px', fontWeight: 800, padding: '15px', opacity: isPastEvent ? 0.6 : 1, filter: isPastEvent ? 'grayscale(1)' : 'none' }}
                  disabled={selectedSeats.length === 0 || isPastEvent}
                  onClick={() => {
                    const seatIds = selectedSeats.map(s => s.id).join(',');
                    router.push(`/registration?eventId=${event.id}&seats=${seatIds}`);
                  }}
                >
                  {isPastEvent ? t.eventDetailPage?.registrationClosed : (user ? t.eventDetailPage?.proceedRegistration : t.eventDetailPage?.loginRequired)}
                </button>

                {isPastEvent ? (
                  <div style={{
                    marginTop: '14px', padding: '12px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '10px',
                    display: 'flex', gap: '8px',
                    fontSize: '12px', color: '#f87171',
                  }}>
                    <Info size={13} style={{ flexShrink: 0, marginTop: '1px' }} />
                    {t.eventDetailPage?.pastEventNotice}
                  </div>
                ) : selectedSeats.length === 0 ? (
                  <div style={{
                    marginTop: '14px', padding: '12px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    display: 'flex', gap: '8px',
                    fontSize: '12px', color: 'var(--text-secondary)',
                  }}>
                    <Info size={13} style={{ color: '#FFDD00', flexShrink: 0, marginTop: '1px' }} />
                    {t.eventDetailPage?.selectSeatNotice}
                  </div>
                ) : null}
              </div>

              {/* Hall address */}
              <div style={{
                marginTop: '14px', padding: '16px 18px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <MapPin size={15} style={{ color: 'var(--text-accent)', marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '3px', color: 'var(--text-primary)' }}>{t.footer?.brandName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{HALL_INFO.address}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Payment Modal ── */}
      {showPayment && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowPayment(false)}>
          <div className="modal" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800 }}>{t.eventDetailPage?.registration}</h2>
              <button onClick={() => setShowPayment(false)} style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: '9px', width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-primary)',
              }}><X size={15} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">{t.payment.name}</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder={t.eventDetailPage?.fullName || "Full name"} />
              </div>
              <div className="form-group">
                <label className="form-label">{t.payment.phone}</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+998 90 123 45 67" />
              </div>
              <div className="form-group">
                <label className="form-label">{t.payment.email}</label>
                <input className="form-input" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" />
              </div>

              {/* Removed Payment Methods and Summary for offline registration */}

              <button className="btn btn-gold"
                style={{ width: '100%', justifyContent: 'center', fontSize: '15px', fontWeight: 800, padding: '15px' }}
                onClick={handlePayment}
                disabled={processing || !form.name || !form.phone || !form.email}
              >
                {processing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#1a0800', borderRadius: '50%', animation: 'rotate 0.8s linear infinite', display: 'inline-block' }} />
                    {t.payment.processing}
                  </span>
                ) : (t.eventDetailPage?.confirmRegistration || `Confirm Registration`)}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
