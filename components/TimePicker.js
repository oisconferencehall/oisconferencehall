'use client';
import { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function TimePicker({ value, onChange, placeholder = "00:00" }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const times = [];
  for (let h = 8; h <= 22; h++) {
    times.push(`${String(h).padStart(2, '0')}:00`);
    if (h !== 22) times.push(`${String(h).padStart(2, '0')}:30`);
  }

  useEffect(() => {
    if (isOpen && scrollRef.current && value) {
      const selectedIndex = times.indexOf(value);
      if (selectedIndex > -1) {
        scrollRef.current.scrollTop = selectedIndex * 36;
      }
    }
  }, [isOpen, value, times]);

  return (
    <div className="custom-timepicker" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-input" 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', height: '42px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {value || placeholder}
        </span>
        <Clock size={16} color="var(--text-muted)" />
      </div>

      {isOpen && (
        <div 
          ref={scrollRef}
          style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 1000,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: '12px', width: '100%', maxHeight: '220px', overflowY: 'auto',
            boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
            padding: '8px'
          }}
        >
          {times.map(t => (
            <div key={t} 
              onClick={() => { onChange(t); setIsOpen(false); }}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                background: value === t ? 'var(--violet)' : 'transparent',
                color: value === t ? '#121212' : 'var(--text-primary)',
                fontWeight: value === t ? 700 : 500,
                borderRadius: '6px',
                marginBottom: '2px',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { if (value !== t) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={e => { if (value !== t) e.currentTarget.style.background = 'transparent'; }}
            >
              {t}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
