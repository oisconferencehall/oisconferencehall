'use client';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import DirectionsMap from '@/components/DirectionsMap';
import { useApp } from '@/context/AppContext';

export default function Contacts() {
  const { t, cmsContacts } = useApp();
  const rawInfo = cmsContacts || {
    address: t.contactsSection?.addressValue,
    phone1: '+998 90 123 45 67', phone2: '+998 71 234 56 78',
    email1: 'info@conferencehall.uz', email2: 'events@conferencehall.uz',
    hoursWeek: t.contactsSection?.hoursWeekValue, hoursSun: t.contactsSection?.hoursSunValue
  };

  const info = {
    ...rawInfo,
    address: (rawInfo.address === '123 Main Street, Suite 400 Samarkand, 140100, Uzbekistan' ? t.contactsSection?.addressValue : rawInfo.address) || rawInfo.address,
    hoursWeek: (rawInfo.hoursWeek === 'Mon - Sat: 9:00 AM - 6:00 PM' ? t.contactsSection?.hoursWeekValue : rawInfo.hoursWeek) || rawInfo.hoursWeek,
    hoursSun: (rawInfo.hoursSun === 'Sun: Closed (Except for Events)' ? t.contactsSection?.hoursSunValue : rawInfo.hoursSun) || rawInfo.hoursSun,
  };

  return (
    <section className="reveal" style={{ padding: '100px 24px', background: 'var(--bg-secondary)', position: 'relative' }}>
      <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {t.contactsSection?.title} <span style={{ color: 'var(--text-accent)' }}>{t.contactsSection?.titleHighlight}</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', alignItems: 'center' }}>
          
          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '14px', 
                background: '#FFDD00', color: '#000000', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                flexShrink: 0, boxShadow: '0 4px 14px rgba(255, 221, 0, 0.35)' 
              }}>
                <MapPin size={24} strokeWidth={2.2} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{t.contactsSection?.address}</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{info.address}</p>
              </div>
            </div>

            {/* Phone */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '14px', 
                background: '#FFDD00', color: '#000000', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                flexShrink: 0, boxShadow: '0 4px 14px rgba(255, 221, 0, 0.35)' 
              }}>
                <Phone size={24} strokeWidth={2.2} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{t.contactsSection?.phone}</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{info.phone1}<br/>{info.phone2}</p>
              </div>
            </div>

            {/* Email */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '14px', 
                background: '#FFDD00', color: '#000000', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                flexShrink: 0, boxShadow: '0 4px 14px rgba(255, 221, 0, 0.35)' 
              }}>
                <Mail size={24} strokeWidth={2.2} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{t.contactsSection?.email}</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{info.email1}<br/>{info.email2}</p>
              </div>
            </div>

            {/* Working Hours */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ 
                width: '48px', height: '48px', borderRadius: '14px', 
                background: '#FFDD00', color: '#000000', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                flexShrink: 0, boxShadow: '0 4px 14px rgba(255, 221, 0, 0.35)' 
              }}>
                <Clock size={24} strokeWidth={2.2} />
              </div>
              <div>
                <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>{t.contactsSection?.workingHours}</h4>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{info.hoursWeek}<br/>{info.hoursSun}</p>
              </div>
            </div>

          </div>

          {/* Map with Directions */}
          <div style={{ height: '450px', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', position: 'relative' }}>
            <DirectionsMap />
          </div>

        </div>
      </div>
    </section>
  );
}
