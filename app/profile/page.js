'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { QRCodeSVG } from 'qrcode.react';
import { Ticket, Calendar, Clock, MapPin, User, CheckCircle, LogOut } from 'lucide-react';
import { formatPrice } from '@/lib/data';

export default function ProfilePage() {
  const { t, tickets, lang, user, loading } = useApp();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const verifyAuth = async () => {
      if (!loading && user === null) {
        // Double check the session directly from the client before kicking out,
        // to handle the tiny state propagation delay after signInWithPassword.
        const { data } = await supabase.auth.getSession();
        if (mounted && !data.session) {
          router.push('/login');
        }
      }
    };
    verifyAuth();
    return () => { mounted = false; };
  }, [user, loading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'uz' ? 'uz-UZ' : lang === 'ru' ? 'ru-RU' : 'en-US', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  if (loading || !user) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--text-accent)', animation: 'borderRotate 1s linear infinite', margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)' }}>{t.profile?.loadingProfile}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {/* Clean Header */}
        <div style={{
          padding: '120px 20px 60px',
        }}>
          <div className="container">
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '40px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '24px',
              boxShadow: 'var(--shadow-card)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div style={{
                  width: '70px', height: '70px', borderRadius: '50%',
                  background: 'var(--bg-secondary)',
                  border: '2px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-accent)'
                }}>
                  <User size={32} />
                </div>
                <div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px', color: 'var(--text-primary)' }}>
                    {t.profile?.title}
                  </h1>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
                    {user.email}
                  </p>
                </div>
              </div>
              <button onClick={handleLogout} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px',
                background: 'transparent', color: 'var(--text-secondary)',
                border: '1px solid var(--border)', fontSize: '14px', fontWeight: 600,
                transition: 'all 0.2s ease', cursor: 'pointer'
              }} onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = '#ef4444'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
                <LogOut size={16} /> {t.profile?.signOut}
              </button>
            </div>
          </div>
        </div>

        <div className="section">
          <div className="container">
            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)' }}>
              <Ticket size={28} style={{ color: 'var(--text-accent)' }} /> {t.profile?.myTickets}
            </h2>
            
            {tickets.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '80px 40px',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(16px)',
                border: '1px dashed rgba(255, 221, 0, 0.3)',
                borderRadius: '24px',
                maxWidth: '600px', margin: '0 auto',
                boxShadow: 'var(--shadow-card)',
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '200px', height: '200px', background: 'rgba(255, 221, 0, 0.1)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0 }} />
                
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(255, 221, 0, 0.1)', border: '1px solid rgba(255, 221, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px', color: '#FFDD00' }}>
                    <Ticket size={40} />
                  </div>
                  <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>{t.tickets.noTickets}</h3>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: 1.7, fontSize: '15px' }}>{t.tickets.noTicketsMsg}</p>
                  <Link href="/events" className="btn btn-gold" style={{ padding: '16px 32px', borderRadius: '100px', boxShadow: '0 10px 30px rgba(255, 221, 0, 0.2)' }}>
                    {t.tickets.browseEvents}
                  </Link>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {tickets.map(ticket => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    t={t}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function TicketCard({ ticket, t, formatDate }) {
  const qrData = JSON.stringify({ id: ticket.id, event: ticket.eventId, seats: ticket.seats?.map(s => s.id) });

  return (
    <div id={`ticket-${ticket.id}`} style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-bright)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>
      {/* Top: status bar */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(255, 221, 0, 0.08) 0%, rgba(79,70,229,0.05) 100%)',
        padding: '12px 24px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255, 221, 0, 0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
          <CheckCircle size={15} style={{ color: '#10b981' }} />
          {t.tickets.status.confirmed}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.05em' }}>
          {t.tickets.ticketId}: {ticket.id}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', padding: '28px' }}>
        {/* Left info */}
        <div>
          <h3 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px', lineHeight: 1.2, color: 'var(--text-primary)' }}>
            {ticket.eventTitle}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            {[
              { icon: <Calendar size={14} />, label: t.eventDetail.date, value: ticket.eventDate ? formatDate(ticket.eventDate) : 'TBD' },
              { icon: <Clock size={14} />, label: t.eventDetail.time, value: ticket.eventTime || 'TBD' },
              { icon: <MapPin size={14} />, label: t.eventDetail.venue, value: t.footer?.brandName },
              { icon: <User size={14} />, label: t.payment.name, value: ticket.payerName },
            ].map((d, i) => (
              <div key={i}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-accent)' }}>{d.icon}</span> {d.label}
                </div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{d.value}</div>
              </div>
            ))}
          </div>

          {/* Seats */}
          {ticket.seats?.length > 0 && (
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '8px' }}>
                {t.profile?.seats}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {ticket.seats.map(s => (
                  <span key={s.id} style={{
                    background: 'rgba(255, 221, 0, 0.1)',
                    border: '1px solid rgba(255, 221, 0, 0.2)',
                    borderRadius: '6px',
                    padding: '3px 10px',
                    fontSize: '12px', fontWeight: 700,
                    color: '#FFDD00',
                  }}>
                    {s.id}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Dashed separator */}
          <div style={{
            margin: '20px 0',
            borderTop: '2px dashed var(--border)',
          }} />

          {/* Price */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t.profile?.totalPaid}</div>
              <div style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-accent)' }}>
                {formatPrice(ticket.totalPrice)} <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>{t.common?.currency}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: QR */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
          background: 'var(--bg-primary)',
          borderRadius: '16px',
          gap: '8px',
          minWidth: '140px',
        }}>
          <QRCodeSVG
            value={qrData}
            size={100}
            bgColor="transparent"
            fgColor="var(--text-primary)"
            level="M"
          />
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 700, textAlign: 'center', letterSpacing: '0.05em' }}>
            {ticket.id}
          </div>
        </div>
      </div>
    </div>
  );
}
