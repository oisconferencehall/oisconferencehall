'use client';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import YellowShapeBanner from '@/components/YellowShapeBanner';
import Image from 'next/image';
import { HALL_INFO, HALLS_LIST, formatPrice } from '@/lib/data';
import {
  Wifi, Monitor, Volume2, Wind, ParkingCircle, Utensils,
  Shield, PhoneCall, Users, Clock, CheckCircle, Send,
  Calendar, CalendarDays, ArrowDown, Sparkles, MapPin, Award, Maximize, Building2
} from 'lucide-react';

const amenityIcons = {
  wifi: Wifi, projector: Monitor, sound: Volume2,
  ac: Wind, parking: ParkingCircle, catering: Utensils,
  security: Shield, reception: PhoneCall,
};

function RentPageContent() {
  const { t, addRentRequest, hallBlocks, hallsList: appHalls } = useApp();
  const searchParams = useSearchParams();
  const formRef = useRef(null);

  const allHalls = appHalls && appHalls.length > 0 ? appHalls : HALLS_LIST;
  const initialHallId = searchParams?.get('hallId') || '4';
  const [selectedHallId, setSelectedHallId] = useState(initialHallId);

  useEffect(() => {
    const paramId = searchParams?.get('hallId');
    if (paramId) {
      setSelectedHallId(paramId);
    }
  }, [searchParams]);

  const selectedHall = allHalls.find(h => String(h.id) === String(selectedHallId)) || allHalls[0];

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    eventType: '', date: '', guests: '', message: '',
  });

  const dynamicCapacity = selectedHall.capacity || (hallBlocks ? `${hallBlocks.reduce((sum, b) => sum + (b.rows * b.cols), 0)} people` : `${HALL_INFO.capacity} people`);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [cmsData, setCmsData] = useState(null);
  const [fetchingCms, setFetchingCms] = useState(true);

  useEffect(() => {
    async function fetchCms() {
      const { data } = await supabase.from('page_sections').select('*').eq('type', 'rent_gallery').single();
      if (data) {
        setCmsData(data.data);
      }
      setFetchingCms(false);
    }
    fetchCms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    addRentRequest({
      ...form,
      hallId: selectedHall.id,
      hallTitle: selectedHall.title
    });
    setSubmitting(false);
    setSuccess(true);
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Hall images for gallery
  const hallImages = selectedHall.images && selectedHall.images.length >= 3 
    ? selectedHall.images 
    : [
        selectedHall.image || cmsData?.bgImage1 || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
        cmsData?.bgImage2 || 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=800&q=80',
        cmsData?.bgImage3 || 'https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=800&q=80'
      ];

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="main-content">

        {/* ===== HERO / CTA BANNER SECTION (Yellow Theme & Multi-Hall Selector) ===== */}
        <section style={{
          position: 'relative',
          padding: '150px 24px 80px',
          background: 'var(--bg-primary)',
          overflow: 'hidden',
          textAlign: 'center'
        }}>

          {/* Ambient Glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '700px', height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(255, 221, 0, 0.16) 0%, rgba(255, 221, 0, 0.04) 45%, transparent 70%)',
            filter: 'blur(50px)', pointerEvents: 'none', zIndex: 2
          }} />

          <div className="container" style={{ maxWidth: '960px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            
            {/* ── Multi-Hall Selector Pills ── */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
              {allHalls.map(h => {
                const isSel = String(h.id) === String(selectedHallId);
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelectedHallId(String(h.id))}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '100px',
                      fontWeight: 800,
                      fontSize: '14px',
                      cursor: 'pointer',
                      border: isSel ? '2px solid #FFDD00' : '1px solid var(--border)',
                      background: isSel ? '#FFDD00' : 'var(--bg-card)',
                      color: isSel ? '#000000' : 'var(--text-primary)',
                      boxShadow: isSel ? '0 8px 24px rgba(255, 221, 0, 0.35)' : 'none',
                      transition: 'all 0.25s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Building2 size={16} color={isSel ? '#000000' : '#FFDD00'} />
                    {h.title}
                  </button>
                );
              })}
            </div>

            {/* Custom Heading */}
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 50px)',
              fontWeight: 900,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
              marginBottom: '20px',
              maxWidth: '860px',
              margin: '0 auto 20px'
            }}>
              Rent <span style={{ color: '#FFDD00' }}>{selectedHall.title}</span> at Oxford International School
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '17px',
              color: 'var(--text-secondary)',
              maxWidth: '680px',
              margin: '0 auto 36px',
              lineHeight: 1.6
            }}>
              {selectedHall.description || cmsData?.subtitle || `Reserve ${selectedHall.title} (${selectedHall.capacity}, ${selectedHall.area || 'spacious area'}) with 4K projection, acoustic isolation, and executive service.`}
            </p>

            {/* CTA Button Container */}
            <div style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justify: 'center'
            }}>

              <button 
                onClick={scrollToForm}
                style={{
                  padding: '16px 42px',
                  borderRadius: '100px',
                  background: '#FFDD00',
                  color: '#000000',
                  fontSize: '16px',
                  fontWeight: 900,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 10px 30px rgba(255, 221, 0, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 14px 40px rgba(255, 221, 0, 0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 221, 0, 0.4)';
                }}
              >
                Book {selectedHall.title} Now <Send size={18} />
              </button>

            </div>
          </div>
        </section>

        {/* ===== MAIN CONTENT SECTION ===== */}
        <section className="section" style={{ padding: '60px 0 100px' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div className="responsive-grid-2" style={{ gap: '64px', alignItems: 'start' }}>

              {/* Left Column: Hall Showcase, Specs, Gallery & Pricing */}
              <div>
                
                {/* 3D Tilt Image Gallery for Selected Hall */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '240px 170px',
                  gap: '12px', marginBottom: '40px', borderRadius: '24px',
                  perspective: '1200px'
                }}>
                  {[
                    { src: hallImages[0], span: '1 / span 2', main: true },
                    { src: hallImages[1] || hallImages[0] },
                    { src: hallImages[2] || hallImages[0] },
                  ].map((img, i) => (
                    <div key={i} 
                      style={{ 
                        gridColumn: img.span, 
                        borderRadius: '16px', 
                        position: 'relative',
                        transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                        zIndex: 1,
                      }}
                    >
                      <Image src={img.src} alt={selectedHall.title} fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} unoptimized />
                      
                      {img.main && (
                        <div style={{
                          position: 'absolute', bottom: '16px', left: '16px',
                          background: 'var(--bg-card)',
                          backdropFilter: 'blur(12px)',
                          padding: '14px 20px',
                          borderRadius: '16px',
                          border: '1px solid var(--border)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                        }}>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: '2px' }}>{t.rentPage?.capacity || 'CAPACITY'}</div>
                          <div style={{ fontSize: '24px', fontWeight: 900, color: '#FFDD00', lineHeight: 1 }}>{selectedHall.capacity}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{selectedHall.area || 'Spacious Area'}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key Venue Highlights / Specs */}
                <div className="responsive-grid-2" style={{ gap: '16px', marginBottom: '36px' }}>
                  {[
                    { icon: <Users size={22} />, label: 'CAPACITY', value: selectedHall.capacity },
                    { icon: <Maximize size={22} />, label: 'FLOOR AREA', value: selectedHall.area || '320 m²' },
                    { icon: <Clock size={22} />, label: 'HOURS', value: '08:00 – 22:00 Daily' },
                    { icon: <Sparkles size={22} />, label: 'RENT PRICE', value: selectedHall.price },
                  ].map((item, i) => (
                    <div key={i} style={{
                      padding: '20px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '16px',
                      display: 'flex', gap: '14px', alignItems: 'center',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.04)'
                    }}>
                      <div style={{
                        width: '48px', height: '48px',
                        background: '#FFDD00',
                        border: '1px solid #000000',
                        borderRadius: '14px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#000000', flexShrink: 0,
                      }}>{item.icon}</div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.label}</div>
                        <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '2px', color: 'var(--text-primary)' }}>{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hall Amenities List */}
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '18px', color: 'var(--text-primary)' }}>
                  {t.rentPage?.amenitiesTitle || 'Included Amenities & Technology'}
                </h3>
                <div className="responsive-grid-2" style={{ gap: '12px', marginBottom: '32px' }}>
                  {HALL_INFO.amenities.map(key => {
                    const Icon = amenityIcons[key];
                    return (
                      <div key={key} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '14px 16px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                        transition: 'all 0.2s ease',
                      }}>
                        <CheckCircle size={16} style={{ color: '#000000', fill: '#FFDD00', flexShrink: 0 }} />
                        {t.rent?.amenityList?.[key] || key}
                      </div>
                    );
                  })}
                </div>

              </div>

              {/* Right Column: Interactive Booking Inquiry Form */}
              <div ref={formRef} style={{ position: 'sticky', top: '110px' }}>
                {success ? (
                  <div style={{
                    padding: '54px 36px', textAlign: 'center',
                    background: 'var(--bg-card)',
                    border: '1.5px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '24px',
                    boxShadow: '0 16px 40px rgba(16, 185, 129, 0.1)'
                  }}>
                    <div style={{
                      width: '76px', height: '76px',
                      background: 'rgba(16, 185, 129, 0.12)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 20px',
                      border: '2px solid rgba(16, 185, 129, 0.25)',
                    }}>
                      <CheckCircle size={36} style={{ color: '#10b981' }} />
                    </div>
                    <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>{t.rentPage?.successTitle || 'Ariza Qabul Qilindi!'}</h3>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '15px' }}>
                      {t.rent?.successMsg || `Menejerimiz 2 soat ichida siz bilan bog‘lanadi va ${selectedHall.title} zali ma’lumotlarini tasdiqlaydi.`}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    background: 'var(--bg-card)',
                    borderTop: '5px solid #FFDD00',
                    borderRight: '1px solid var(--border)',
                    borderBottom: '1px solid var(--border)',
                    borderLeft: '1px solid var(--border)',
                    borderRadius: '24px',
                    padding: '36px',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.12)',
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FFDD00', marginBottom: '4px' }}>
                      RENTING: {selectedHall.title}
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {t.rentPage?.formTitle || 'Ariza qoldirish'}
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
                      {t.rentPage?.formSubtitle || `Tadbir ma'lumotlarini kiriting, biz 2 soat ichida bog'lanamiz`}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      
                      {/* Hall Selector Dropdown in Form */}
                      <div className="form-group">
                        <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '12px' }}>TARGET HALL</label>
                        <select
                          className="form-input"
                          value={selectedHallId}
                          onChange={e => setSelectedHallId(e.target.value)}
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '2px solid #FFDD00',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '14px',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            cursor: 'pointer'
                          }}
                        >
                          {allHalls.map(h => (
                            <option key={h.id} value={h.id}>
                              🏛️ {h.title} — {h.capacity}
                            </option>
                          ))}
                        </select>
                      </div>

                      {[
                        { key: 'name', label: t.rent?.yourName || 'Your Name', type: 'text', placeholder: 'Ism va familiyangiz' },
                        { key: 'phone', label: t.rent?.phone || 'Phone', type: 'tel', placeholder: '+998 90 123 45 67' },
                        { key: 'email', label: t.rent?.email || 'Email', type: 'email', placeholder: 'email@example.com' },
                        { key: 'eventType', label: t.rent?.eventType || 'Event Type', type: 'text', placeholder: 'Konferensiya, Seminar, Taqdimot...' },
                        { key: 'date', label: t.rent?.expectedDate || 'Expected Date', type: 'date' },
                        { key: 'guests', label: t.rent?.expectedGuests || 'Guests', type: 'number', placeholder: `Capacity: ${selectedHall.capacity}` },
                      ].map(f => (
                        <div key={f.key} className="form-group">
                          <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '12px' }}>{f.label}</label>
                          <input
                            type={f.type}
                            className="form-input"
                            value={form[f.key]}
                            onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                            placeholder={f.placeholder}
                            required={['name', 'phone', 'email'].includes(f.key)}
                            style={{
                              background: 'var(--bg-secondary)',
                              border: '1px solid var(--border)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              fontSize: '14px',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>
                      ))}

                      <div className="form-group">
                        <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '12px' }}>{t.rent?.message || 'Message'}</label>
                        <textarea
                          className="form-textarea"
                          value={form.message}
                          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                          placeholder="Tadbir haqida qo'shimcha ma'lumot qoldiring..."
                          style={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px',
                            padding: '12px 16px',
                            fontSize: '14px',
                            color: 'var(--text-primary)',
                            minHeight: '90px'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{
                          padding: '16px',
                          borderRadius: '14px',
                          background: '#FFDD00',
                          color: '#000000',
                          fontSize: '16px',
                          fontWeight: 900,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 8px 24px rgba(255, 221, 0, 0.4)',
                          marginTop: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px'
                        }}
                      >
                        {submitting ? 'Yuborilmoqda...' : `Submit Request for ${selectedHall.title}`} <Send size={16} />
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        <YellowShapeBanner />
      </main>
      <Footer />
    </div>
  );
}

export default function RentPage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: '#fff' }}>Loading Rent Page...</div>}>
      <RentPageContent />
    </Suspense>
  );
}
