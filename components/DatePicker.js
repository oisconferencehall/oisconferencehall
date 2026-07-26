'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function DatePicker({ value, onChange, placeholder = "Select date" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      return new Date(Number(y), Number(m) - 1, Number(d));
    }
    return new Date();
  });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const daysInMonth = getDaysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const firstDay = getFirstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const handleSelect = (day) => {
    if (!day) return;
    const yyyy = currentMonth.getFullYear();
    const mm = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const handleToday = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    setCurrentMonth(now);
    onChange(`${yyyy}-${mm}-${dd}`);
    setIsOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="custom-datepicker" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-input" 
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          cursor: 'pointer',
          height: '46px',
          background: 'var(--bg-secondary)',
          border: isOpen ? '2px solid #FFDD00' : '1px solid var(--border)',
          borderRadius: '12px',
          padding: '0 16px',
          boxShadow: isOpen ? '0 4px 16px rgba(255, 221, 0, 0.25)' : 'none',
          transition: 'all 0.2s ease'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: value ? 800 : 500, fontSize: '14px' }}>
          {value || placeholder}
        </span>
        <CalendarIcon size={18} color="#FFDD00" />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: 0,
          right: 0,
          zIndex: 9999,
          background: '#11141e',
          border: '1.5px solid rgba(255, 221, 0, 0.5)',
          borderRadius: '16px',
          padding: '18px',
          boxShadow: '0 20px 45px rgba(0,0,0,0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          animation: 'fadeInUp 0.2s ease'
        }}>
          {/* Header Month / Year & Nav */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button type="button" onClick={handlePrevMonth} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', cursor: 'pointer', color: '#FFDD00', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ fontWeight: 900, fontSize: '14px', color: '#ffffff' }}>
              {monthNames[currentMonth.getMonth()]} <span style={{ color: '#FFDD00' }}>{currentMonth.getFullYear()}</span>
            </div>
            <button type="button" onClick={handleNextMonth} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', cursor: 'pointer', color: '#FFDD00', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px', textAlign: 'center' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 800, textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((day, i) => {
              const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
              const isSelected = dateStr === value;
              const isToday = day && new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
              
              return (
                <div key={i} 
                  onClick={() => handleSelect(day)}
                  style={{
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justify: 'center',
                    fontSize: '13px',
                    borderRadius: '8px',
                    cursor: day ? 'pointer' : 'default',
                    background: isSelected ? '#FFDD00' : (isToday ? 'rgba(255, 221, 0, 0.15)' : 'transparent'),
                    color: isSelected ? '#000000' : (day ? '#ffffff' : 'transparent'),
                    fontWeight: isSelected ? 900 : (isToday ? 800 : 500),
                    border: isToday && !isSelected ? '1px solid #FFDD00' : '1px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if (day && !isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { if (day && !isSelected) e.currentTarget.style.background = isToday ? 'rgba(255, 221, 0, 0.15)' : 'transparent'; }}
                >
                  {day || ''}
                </div>
              );
            })}
          </div>

          {/* Quick Footer Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <button 
              type="button" 
              onClick={() => { onChange(''); setIsOpen(false); }}
              style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
            >
              Clear
            </button>
            <button 
              type="button" 
              onClick={handleToday}
              style={{ background: 'transparent', border: 'none', color: '#FFDD00', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
