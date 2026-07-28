'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
  const { t } = useApp();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '120px 20px 60px', overflow: 'hidden' }}>
        {/* Background Image & Overlay */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <Image
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop"
            alt="Audience Background"
            fill
            priority
            style={{ objectFit: 'cover', filter: 'brightness(0.5) saturate(1.2)' }}
          />
        </div>

        
        {/* Animated Orbs */}
        <div style={{
          position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px',
          background: 'rgba(255, 221, 0, 0.4)', filter: 'blur(100px)', borderRadius: '50%', zIndex: 1,
          animation: 'pulse 8s infinite alternate'
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: '440px', width: '100%', padding: '48px 40px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(24px) saturate(150%)',
          WebkitBackdropFilter: 'blur(24px) saturate(150%)',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          boxShadow: 'var(--shadow-card)',
          animation: 'fadeInUp 0.6s ease-out'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div className="badge badge-violet" style={{ marginBottom: '16px' }}>
              <LogIn size={13} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>{t.login?.welcomeBack || 'Xush kelibsiz'}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t.login?.subtitle || 'Chiptalaringizni va tadbirlaringizni boshqarish uchun tizimga kiring.'}</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">{t.login?.email || 'Email'}</label>
              <input
                type="email"
                required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '15px', outline: 'none', transition: 'all 0.3s ease'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--text-accent)'; e.target.style.background = 'var(--bg-primary)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-primary)'; }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">{t.login?.password || 'Parol'}</label>
              <input
                type="password"
                required
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: '12px',
                  background: 'var(--bg-primary)', border: '1px solid var(--border)',
                  color: 'var(--text-primary)', fontSize: '15px', outline: 'none', transition: 'all 0.3s ease'
                }}
                onFocus={e => { e.target.style.borderColor = 'var(--text-accent)'; e.target.style.background = 'var(--bg-primary)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.background = 'var(--bg-primary)'; }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {error && (
              <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px', color: '#f87171', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '10px', padding: '14px', fontSize: '15px', fontWeight: 700 }} disabled={loading}>
              {loading ? (t.login?.signingIn || 'Kirilmoqda...') : (t.login?.signIn || 'Kirish')}
            </button>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {t.login?.noAccount || "Hisobingiz yo'qmi?"} <Link href="/register" style={{ color: 'var(--text-accent)', fontWeight: 600, textDecoration: 'none' }}>{t.login?.register || 'Ro\'yxatdan o\'tish'}</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
