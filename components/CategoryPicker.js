'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus } from 'lucide-react';

export default function CategoryPicker({ value, onChange, placeholder = "Select category" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [customVal, setCustomVal] = useState('');
  const containerRef = useRef(null);

  const defaultCategories = ['conference', 'seminar', 'concert', 'exhibition', 'corporate', 'movie'];
  
  const allCategories = [...defaultCategories];
  if (value && !defaultCategories.includes(value)) {
    allCategories.push(value);
  }

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCustomAdd = () => {
    if (customVal.trim()) {
      onChange(customVal.trim().toLowerCase());
      setIsOpen(false);
      setCustomVal('');
    }
  };

  return (
    <div className="custom-categorypicker" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="form-input" 
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', height: '42px', textTransform: 'capitalize' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span style={{ color: value ? 'var(--text-primary)' : 'var(--text-muted)' }}>
          {value || placeholder}
        </span>
        <ChevronDown size={16} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 1000,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '12px', width: '100%', maxHeight: '300px', overflowY: 'auto',
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          padding: '8px', display: 'flex', flexDirection: 'column'
        }}>
          {allCategories.map(c => (
            <div key={c} 
              onClick={() => { onChange(c); setIsOpen(false); }}
              style={{
                padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
                background: value === c ? 'var(--violet)' : 'transparent',
                color: value === c ? '#121212' : 'var(--text-primary)',
                fontWeight: value === c ? 700 : 500,
                borderRadius: '6px', marginBottom: '2px', textTransform: 'capitalize',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={e => { if (value !== c) e.currentTarget.style.background = 'var(--bg-secondary)'; }}
              onMouseLeave={e => { if (value !== c) e.currentTarget.style.background = 'transparent'; }}
            >
              {c}
            </div>
          ))}
          
          <div style={{ height: '1px', background: 'var(--border)', margin: '8px 0' }} />
          
          <div style={{ display: 'flex', gap: '8px', padding: '0 4px' }}>
            <input 
              type="text" 
              placeholder="Or type custom..." 
              value={customVal}
              onChange={e => setCustomVal(e.target.value)}
              style={{
                flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: '6px', padding: '8px 10px', color: 'var(--text-primary)', fontSize: '13px', outline: 'none'
              }}
              onKeyDown={e => { if (e.key === 'Enter') handleCustomAdd(); }}
            />
            <button 
              type="button"
              onClick={handleCustomAdd}
              style={{
                background: 'var(--violet)', border: 'none', borderRadius: '6px',
                width: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#121212', cursor: 'pointer', transition: 'opacity 0.2s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
