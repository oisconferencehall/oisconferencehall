'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function DatePicker({ value, onChange, placeholder = "Select date" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const [y, m, d] = value.split('-');
      return new Date(y, m - 1, d);
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

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="custom-datepicker" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-input" 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', height: '42px' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {value || placeholder}
        </span>
        <CalendarIcon size={16} color="var(--text-muted)" />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 1000,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', padding: '16px', width: '280px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <button type="button" onClick={handlePrevMonth} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={16} />
            </button>
            <div style={{ fontWeight: 700, fontSize: '14px' }}>
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </div>
            <button type="button" onClick={handleNextMonth} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer', color: 'var(--text-primary)', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '8px', textAlign: 'center' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {days.map((day, i) => {
              const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
              const isSelected = dateStr === value;
              const isToday = day && new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
              
              return (
                <div key={i} 
                  onClick={() => handleSelect(day)}
                  style={{
                    height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', borderRadius: '8px', cursor: day ? 'pointer' : 'default',
                    background: isSelected ? 'var(--violet)' : (isToday ? 'var(--bg-secondary)' : 'transparent'),
                    color: isSelected ? '#121212' : (day ? 'var(--text-primary)' : 'transparent'),
                    fontWeight: isSelected || isToday ? 700 : 500,
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={e => { if (day && !isSelected) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
                  onMouseLeave={e => { if (day && !isSelected) e.currentTarget.style.background = isToday ? 'var(--bg-secondary)' : 'transparent'; }}
                >
                  {day || ''}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
