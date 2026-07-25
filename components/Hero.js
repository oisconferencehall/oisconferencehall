'use client';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Check, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';

export default function Hero() {
  const { t } = useApp();
  
  return (
    <section style={{ 
      padding: '120px 24px 80px', 
      background: '#F6F7F9', // Light background matching screenshot
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }}>
          
          {/* Left Side - Image Collage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px', position: 'relative' }}>
            
            {/* Main large image */}
            <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '600px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <Image 
                src="https://images.unsplash.com/photo-1540317580384-e5d43867caa6?w=800&q=75&auto=format" 
                alt="Conference Hall Main" 
                fill 
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>

            {/* Right stacked images */}
            <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '16px' }}>
              <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <Image 
                  src="https://images.unsplash.com/photo-1511578314322-379a95053c5b?w=600&q=75&auto=format" 
                  alt="Hall View 2" 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div style={{ position: 'relative', borderRadius: '24px', overflow: 'hidden', height: '100%', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <Image 
                  src="https://images.unsplash.com/photo-1475721025505-117502c32468?w=600&q=75&auto=format" 
                  alt="Hall View 3" 
                  fill 
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </div>

            {/* Floating Capacity Badge */}
            <div className="floating-badge" style={{ 
              position: 'absolute', 
              bottom: '40px', 
              left: '0px', 
              background: '#ffffff', 
              padding: '16px 24px', 
              borderRadius: '20px', 
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              zIndex: 10
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#666', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>
                {t.heroSection?.capacity || 'Capacity'}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 900, color: '#b98c00', lineHeight: 1 }}>
                186
              </div>
              <div style={{ fontSize: '13px', color: '#666', marginTop: '4px' }}>
                {t.heroSection?.seatsAvailable || 'seats available'}
              </div>
            </div>
            
          </div>

          {/* Right Side - Content */}
          <div style={{ paddingLeft: '0px' }}>
            
            {/* Top Badge */}
            <div style={{ 
              display: 'inline-flex', alignItems: 'center', gap: '6px', 
              background: 'rgba(255, 221, 0, 0.15)', 
              border: '1px solid rgba(255, 221, 0, 0.3)',
              padding: '8px 16px', 
              borderRadius: '100px', 
              marginBottom: '24px'
            }}>
              <MapPin size={14} color="#b98c00" />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#b98c00', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {t.footer?.brandName || 'Grand Conference Hall'}
              </span>
            </div>

            {/* Heading */}
            <h1 style={{ 
              fontSize: 'clamp(32px, 5vw, 64px)', 
              fontWeight: 800, 
              color: '#1a1a1a', 
              lineHeight: 1.1, 
              marginBottom: '24px',
              fontFamily: "'Playfair Display', serif"
            }}>
              {t.heroSection?.modernVenue} <span style={{ color: '#FFDD00' }}>{t.heroSection?.worldClass}</span>
            </h1>

            {/* Description */}
            <p style={{ 
              fontSize: '16px', 
              color: '#555', 
              lineHeight: 1.6, 
              marginBottom: '32px',
              maxWidth: '540px'
            }}>
              {t.heroSection?.description}
            </p>

            {/* Features List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
              {[
                t.heroSection?.feature1,
                t.heroSection?.feature2,
                t.heroSection?.feature3,
                t.heroSection?.feature4
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '20px', height: '20px', borderRadius: '50%', 
                    background: 'rgba(16, 185, 129, 0.1)', 
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Check size={12} color="#10b981" />
                  </div>
                  <span style={{ fontSize: '15px', color: '#444' }}>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/rent" style={{ 
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#FFDD00', color: '#000', 
                padding: '14px 28px', borderRadius: '100px', 
                fontWeight: 700, fontSize: '15px', textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(255, 221, 0, 0.3)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                {t.heroSection?.rentHall} <ArrowRight size={18} />
              </Link>
              
              <Link href="/events" style={{ 
                display: 'inline-flex', alignItems: 'center',
                background: '#ffffff', color: '#333', 
                border: '1px solid #ddd',
                padding: '14px 28px', borderRadius: '100px', 
                fontWeight: 600, fontSize: '15px', textDecoration: 'none',
                transition: 'background 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
              onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}>
                {t.heroSection?.browseEvents}
              </Link>
            </div>

          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 992px) {
          section > .container > div {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
          .floating-badge {
            left: 10px !important;
            bottom: 10px !important;
            padding: 12px 18px !important;
          }
        }
        @media (max-width: 600px) {
          .floating-badge {
            position: relative !important;
            left: 0 !important;
            bottom: 0 !important;
            margin-top: 12px !important;
          }
        }
      `}</style>
    </section>
  );
}

