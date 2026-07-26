'use client';
import React, { useEffect } from 'react';
import { AlertCircle, CheckCircle, Info, Sparkles, X } from 'lucide-react';

export function ToastNotification({ toast, onClose }) {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error' || toast.type === 'warning';

  return (
    <div style={{
      position: 'fixed',
      top: '28px',
      right: '28px',
      zIndex: 999999,
      background: '#11141e',
      border: `2px solid ${isError ? '#fb923c' : '#FFDD00'}`,
      borderRadius: '16px',
      padding: '16px 22px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.85), 0 0 30px rgba(255, 221, 0, 0.25)',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      maxWidth: '440px',
      width: 'calc(100% - 56px)',
      animation: 'fadeInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        width: '42px',
        height: '42px',
        borderRadius: '12px',
        background: isError ? 'rgba(251, 146, 60, 0.18)' : 'rgba(255, 221, 0, 0.18)',
        display: 'flex',
        alignItems: 'center',
        justify: 'center',
        flexShrink: 0
      }}>
        {isError ? <AlertCircle size={22} color="#fb923c" /> : <Sparkles size={22} color="#FFDD00" />}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 900, fontSize: '15px', color: '#ffffff', marginBottom: '2px' }}>
          {toast.title || (isError ? 'Notice' : 'Success')}
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.4 }}>
          {toast.message}
        </div>
      </div>

      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.08)',
          border: 'none',
          color: '#ffffff',
          borderRadius: '8px',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          cursor: 'pointer',
          flexShrink: 0
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", cancelText = "Cancel" }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 999999,
      background: 'rgba(0,0,0,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justify: 'center',
      padding: '24px',
      fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        background: '#11141e',
        border: '2px solid #FFDD00',
        borderRadius: '24px',
        padding: '32px',
        maxWidth: '440px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 45px rgba(255, 221, 0, 0.3)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(255, 221, 0, 0.15)',
          border: '2px solid #FFDD00',
          display: 'flex',
          alignItems: 'center',
          justify: 'center',
          margin: '0 auto 18px',
          color: '#FFDD00'
        }}>
          <AlertCircle size={28} />
        </div>

        <h3 style={{ fontSize: '20px', fontWeight: 900, color: '#ffffff', marginBottom: '8px' }}>
          {title || 'Confirm Action'}
        </h3>
        
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: '28px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            {cancelText}
          </button>
          
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '12px',
              background: '#FFDD00',
              border: 'none',
              color: '#000000',
              fontWeight: 900,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255, 221, 0, 0.35)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
