'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import YellowShapeBanner from '@/components/YellowShapeBanner';
import Image from 'next/image';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Users, Maximize, ArrowRight, CheckCircle, Loader2 } from 'lucide-react';

export default function HallsPage() {
  const { t, hallsList, loading } = useApp();
  
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        {/* Halls Grid Section */}
        <section style={{ padding: '130px 0 80px', background: 'var(--bg-primary)' }}>
          <div className="container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={48} />
              </div>
            ) : hallsList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-secondary)' }}>
                {t.events?.noEvents || 'Zal topilmadi'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {hallsList.map((hall) => (
                <div 
                  key={hall.id}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '24px',
                    border: '1px solid var(--border)',
                    overflow: 'hidden',
                    boxShadow: '0 12px 36px rgba(0,0,0,0.05)',
                    display: 'flex', flexDirection: 'column',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-6px)';
                    e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.05)';
                  }}
                >
                  <div style={{ position: 'relative', height: '240px', width: '100%' }}>
                    <Image src={hall.image} alt={hall.title} fill style={{ objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute', top: '16px', right: '16px',
                      background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
                      color: '#ffffff', fontSize: '13px', fontWeight: 700,
                      padding: '6px 14px', borderRadius: '100px'
                    }}>
                      {hall.area}
                    </div>
                  </div>

                  <div style={{ padding: '28px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                      {hall.title}
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px', flexGrow: 1 }}>
                      {hall.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px', padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>
                        <Users size={16} style={{ color: 'var(--text-accent)' }} /> {hall.capacity}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 600 }}>
                        <Maximize size={16} style={{ color: 'var(--text-accent)' }} /> {hall.area}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.halls?.startingFrom || 'BOSHLANISH NARXI'}</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#FFDD00' }}>{hall.price}</div>
                      </div>
                      <Link 
                        href={`/halls/${hall.id}`} 
                        className="btn btn-primary"
                        style={{ padding: '10px 20px', fontSize: '14px', textDecoration: 'none' }}
                      >
                        {t.halls?.viewDetails || 'Batafsil ko\'rish'} <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
              </div>
            )}
          </div>
        </section>

        {/* iTicket Style Yellow Banner */}
        <YellowShapeBanner />
      </main>
      <Footer />
    </div>
  );
}
