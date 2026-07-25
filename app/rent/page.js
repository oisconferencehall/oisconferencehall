'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import YellowShapeBanner from '@/components/YellowShapeBanner';
import Image from 'next/image';
import { HALL_INFO, formatPrice } from '@/lib/data';
import {
  Wifi, Monitor, Volume2, Wind, ParkingCircle, Utensils,
  Shield, PhoneCall, Users, Clock, CheckCircle, Send,
  Calendar, CalendarDays, ArrowDown, Sparkles, MapPin, Award
} from 'lucide-react';

const amenityIcons = {
  wifi: Wifi, projector: Monitor, sound: Volume2,
  ac: Wind, parking: ParkingCircle, catering: Utensils,
  security: Shield, reception: PhoneCall,
};

export default function RentPage() {
  const { t, addRentRequest, hallBlocks } = useApp();
  const formRef = useRef(null);

  const [form, setForm] = useState({
    name: '', phone: '', email: '',
    eventType: '', date: '', guests: '', message: '',
  });
  
  const dynamicCapacity = hallBlocks ? hallBlocks.reduce((sum, b) => sum + (b.rows * b.cols), 0) : HALL_INFO.capacity;
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
    await new Promise(r => setTimeout(r, 1200));
    addRentRequest(form);
    setSubmitting(false);
    setSuccess(true);
  };

  const scrollToForm = () => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="page-wrapper" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="main-content">

        {/* ===== HERO / CTA BANNER SECTION (Yellow Theme & Seamless Blurs) ===== */}
        <section style={{
          position: 'relative',
          padding: '160px 24px 100px',
          background: 'var(--bg-primary)',
          overflow: 'hidden',
          textAlign: 'center'
        }}>

          {/* Centered Ambient Yellow Radial Glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '650px', height: '380px',
            background: 'radial-gradient(ellipse at center, rgba(255, 221, 0, 0.16) 0%, rgba(255, 221, 0, 0.04) 45%, transparent 70%)',
            filter: 'blur(50px)', pointerEvents: 'none', zIndex: 2
          }} />

          <div className="container" style={{ maxWidth: '880px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
            
            {/* Custom Heading with Yellow Highlighted Words */}
            <h1 style={{
              fontSize: 'clamp(32px, 5vw, 52px)',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
              marginBottom: '32px',
              maxWidth: '820px',
              margin: '0 auto 32px'
            }}>
              {t.rentPage?.heroTitle || "Tadbirni mukammal zalda o'tkazishga tayyormisiz? Oxford International School'da"}{' '}
              <span style={{ color: '#FFDD00' }}>{t.rentPage?.heroTitleHighlight || "bugunoq bron qiling!"}</span>
            </h1>

            {/* Subtitle */}
            <p style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              maxWidth: '640px',
              margin: '0 auto 40px',
              lineHeight: 1.6
            }}>
              {cmsData?.subtitle || t.rentPage?.heroSubtitle || 'Reserve Samarkand’s premier 98-seat conference venue with cinema 4K projection, acoustic isolation, climate control, and executive service.'}
            </p>

            {/* Decorative Dashed Arrows & CTA Button Container */}
            <div style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              justify: 'center',
              marginTop: '10px'
            }}>

              {/* Left Dashed Curved Arrow pointing at button */}
              <svg 
                width="100" height="60" viewBox="0 0 100 60" fill="none" 
                style={{
                  position: 'absolute', left: '-105px', top: '-5px',
                  display: 'block'
                }}
                className="desktop-only"
              >
                <path 
                  d="M 10 12 Q 55 8 82 38" 
                  stroke="#FFDD00" strokeWidth="2.5" strokeDasharray="5 5" fill="none" strokeLinecap="round" 
                />
                <path 
                  d="M 82 38 L 70 34 M 82 38 L 76 46" 
                  stroke="#FFDD00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                />
              </svg>

              {/* Center Action Button in Brand Yellow */}
              <button 
                onClick={scrollToForm}
                style={{
                  padding: '16px 42px',
                  borderRadius: '100px',
                  background: '#FFDD00',
                  color: '#000000',
                  fontSize: '16px',
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255, 221, 0, 0.45)',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'scale(1.04) translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 32px rgba(255, 221, 0, 0.65)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'scale(1) translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 221, 0, 0.45)';
                }}
              >
                {t.rentPage?.applyBtn || 'Ariza qoldirish'} <ArrowDown size={18} />
              </button>

              {/* Right Dashed Curved Arrow pointing at button */}
              <svg 
                width="100" height="60" viewBox="0 0 100 60" fill="none" 
                style={{
                  position: 'absolute', right: '-105px', top: '-5px',
                  display: 'block'
                }}
                className="desktop-only"
              >
                <path 
                  d="M 90 12 Q 45 8 18 38" 
                  stroke="#FFDD00" strokeWidth="2.5" strokeDasharray="5 5" fill="none" strokeLinecap="round" 
                />
                <path 
                  d="M 18 38 L 30 34 M 18 38 L 24 46" 
                  stroke="#FFDD00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" 
                />
              </svg>

            </div>
          </div>
        </section>

        {/* ===== MAIN CONTENT SECTION ===== */}
        <section className="section" style={{ padding: '80px 0' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <div className="responsive-grid-2" style={{ gap: '64px', alignItems: 'start' }}>

              {/* Left Column: Hall Showcase, Specs, Gallery & Pricing */}
              <div>
                
                {/* 3D Tilt Image Gallery */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '220px 170px',
                  gap: '12px', marginBottom: '40px', borderRadius: '24px',
                  perspective: '1200px'
                }}>
                  {[
                    { src: cmsData?.bgImage1 || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', span: '1 / span 2', main: true },
                    { src: cmsData?.bgImage2 || 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=400&q=80' },
                    { src: cmsData?.bgImage3 || 'https://images.unsplash.com/photo-1568992688065-536aad8a12f6?w=400&q=80' },
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
                      onMouseMove={e => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left) / rect.width - 0.5;
                        const y = (e.clientY - rect.top) / rect.height - 0.5;
                        e.currentTarget.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(8px)`;
                        e.currentTarget.style.zIndex = 10;
                        e.currentTarget.style.boxShadow = '0 20px 45px rgba(0,0,0,0.15), 0 0 30px rgba(255, 221, 0, 0.3)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'perspective(900px) rotateY(0) rotateX(0) translateZ(0)';
                        e.currentTarget.style.zIndex = 1;
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)';
                      }}
                    >
                      {fetchingCms ? (
                        <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: '16px' }} />
                      ) : (
                        <Image src={img.src} alt="Hall" fill sizes="(max-width: 768px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
                      )}
                      
                      {!fetchingCms && img.main && (
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
                          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1 }}>{dynamicCapacity}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.rentPage?.seatsAvailable || 'seats available'}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Key Venue Highlights / Specs */}
                <div className="responsive-grid-2" style={{ gap: '16px', marginBottom: '36px' }}>
                  {[
                    { icon: <Users size={22} />, label: t.rent.capacity, value: `${dynamicCapacity} ${t.rent.people}` },
                    { icon: <Clock size={22} />, label: t.rentPage?.workingHours || 'Working Hours', value: t.rentPage?.workingHoursValue || '08:00 – 22:00 Daily' },
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
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.label}</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, marginTop: '2px', color: 'var(--text-primary)' }}>{item.value}</div>
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
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 221, 0, 0.15)'; e.currentTarget.style.borderColor = '#FFDD00'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <CheckCircle size={16} style={{ color: '#000000', fill: '#FFDD00', flexShrink: 0 }} />
                        {t.rent.amenityList[key]}
                      </div>
                    );
                  })}
                </div>



                {/* Pricing Plans */}
                <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '18px', color: 'var(--text-primary)' }}>
                  {t.rentPage?.pricingTitle || 'Rental Pricing Packages'}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: t.rent.hourly, price: HALL_INFO.pricing.hourly, icon: <Clock size={20} /> },
                    { label: t.rent.daily, price: HALL_INFO.pricing.daily, icon: <CalendarDays size={20} />, popular: true },
                    { label: t.rent.weekly, price: HALL_INFO.pricing.weekly, icon: <Calendar size={20} /> },
                  ].map((p, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '18px 24px',
                      background: p.popular ? 'rgba(255, 221, 0, 0.08)' : 'var(--bg-card)',
                      border: p.popular ? '2px solid #FFDD00' : '1px solid var(--border)',
                      borderRadius: '16px',
                      boxShadow: p.popular ? '0 8px 25px rgba(255, 221, 0, 0.2)' : '0 2px 10px rgba(0,0,0,0.02)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px',
                          background: p.popular ? '#FFDD00' : 'var(--bg-secondary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: p.popular ? '#000000' : 'var(--text-primary)'
                        }}>
                          {p.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>{p.label}</div>
                          {p.popular && <div style={{ fontSize: '11px', color: '#FFDD00', fontWeight: 800 }}>{t.rentPage?.popularChoice || '⭐ Most Popular Choice'}</div>}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '20px', fontWeight: 900, color: 'var(--text-primary)' }}>{formatPrice(p.price)}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.common.currency}</div>
                      </div>
                    </div>
                  ))}
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
                      {t.rent.successMsg || 'Menejerimiz 2 soat ichida siz bilan bog‘lanadi va barcha ma’lumotlarni tasdiqlaydi.'}
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
                    <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px', color: 'var(--text-primary)' }}>
                      {t.rentPage?.formTitle || 'Ariza qoldirish'}
                    </h2>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>
                      {t.rentPage?.formSubtitle || "Tadbir ma'lumotlarini kiriting, biz 2 soat ichida bog'lanamiz"}
                    </p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                      {[
                        { key: 'name', label: t.rent.yourName, type: 'text', placeholder: 'Ism va familiyangiz' },
                        { key: 'phone', label: t.rent.phone, type: 'tel', placeholder: '+998 90 123 45 67' },
                        { key: 'email', label: t.rent.email, type: 'email', placeholder: 'email@example.com' },
                        { key: 'eventType', label: t.rent.eventType, type: 'text', placeholder: 'Konferensiya, Seminar, Taqdimot...' },
                        { key: 'date', label: t.rent.expectedDate, type: 'date' },
                        { key: 'guests', label: t.rent.expectedGuests, type: 'number', placeholder: `Maksimal ${dynamicCapacity} kishi` },
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
                        <label className="form-label" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '12px' }}>{t.rent.message}</label>
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
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>

                      <button
                        type="submit"
                        style={{
                          width: '100%',
                          padding: '16px',
                          borderRadius: '100px',
                          background: '#FFDD00',
                          color: '#000000',
                          fontSize: '16px',
                          fontWeight: 900,
                          border: 'none',
                          cursor: 'pointer',
                          boxShadow: '0 8px 24px rgba(255, 221, 0, 0.45)',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          gap: '10px',
                          marginTop: '8px',
                          transition: 'all 0.2s ease'
                        }}
                        disabled={submitting}
                      >
                        <Send size={16} />
                        {submitting ? (t.rentPage?.submitting || 'Yuborilmoqda...') : (t.rentPage?.submitBtn || 'Ariza Yuborish')}
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>

        {/* Yellow Geometric iTicket Banner */}
        <YellowShapeBanner />
      </main>
      <Footer />
    </div>
  );
}
