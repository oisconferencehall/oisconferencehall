'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ChevronLeft, ChevronRight, Calendar, Clock, MapPin, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import YellowShapeBanner from '@/components/YellowShapeBanner';
import './timetable.css';

const START_HOUR = 8;
const END_HOUR = 22;
const ROW_HEIGHT = 45; // 45px per hour

export default function TimetablePage() {
  const { events, lang, t, checkConflict } = useApp();
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState('week');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentMonthStart, setCurrentMonthStart] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  const changeWeek = (offset) => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + offset * 7);
    setCurrentWeekStart(next);
  };

  const jumpToToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
    setSelectedDayIndex(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
  };

  const changeMonth = (offset) => {
    const next = new Date(currentMonthStart);
    next.setMonth(next.getMonth() + offset);
    setCurrentMonthStart(next);
  };

  const jumpToTodayMonth = () => {
    setCurrentMonthStart(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  };

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentWeekStart]);

  const formatWeekRange = () => {
    const start = weekDays[0];
    const end = weekDays[6];
    const options = { month: 'short', day: 'numeric' };
    return `${start.toLocaleDateString(lang, options)} — ${end.toLocaleDateString(lang, { ...options, year: 'numeric' })}`;
  };

  const monthDays = useMemo(() => {
    const year = currentMonthStart.getFullYear();
    const month = currentMonthStart.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    let startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = startOffset; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    let endOffset = 42 - days.length;
    for (let i = 1; i <= endOffset; i++) {
      days.push(new Date(year, month + 1, i));
    }
    return days;
  }, [currentMonthStart]);

  const formatMonthRange = () => {
    return currentMonthStart.toLocaleDateString(lang, { month: 'long', year: 'numeric' });
  };

  const getTitle = (event) => {
    if (lang === 'uz') return event.titleUz || event.title;
    if (lang === 'ru') return event.titleRu || event.title;
    return event.title;
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const dayNames = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

  const getEventStyles = (event) => {
    if (!event.time || !event.endTime) return { display: 'none' };
    
    const [sh, sm] = event.time.split(':').map(Number);
    const [eh, em] = event.endTime.split(':').map(Number);
    
    const top = (sh - START_HOUR) * ROW_HEIGHT + (sm / 60) * ROW_HEIGHT;
    const height = (eh - sh) * ROW_HEIGHT + ((em - sm) / 60) * ROW_HEIGHT;
    
    return {
      top: `${top}px`,
      height: `${Math.max(height, 30)}px`
    };
  };

  const currentMinutesOffset = useMemo(() => {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    if (h < START_HOUR || h >= END_HOUR) return -100;
    return (h - START_HOUR) * ROW_HEIGHT + (m / 60) * ROW_HEIGHT;
  }, [currentTime]);

  const categories = [
    { id: 'conference', color: 'var(--cat-conference)' },
    { id: 'seminar', color: 'var(--cat-seminar)' },
    { id: 'concert', color: 'var(--cat-concert)' },
    { id: 'exhibition', color: 'var(--cat-exhibition)' },
    { id: 'corporate', color: 'var(--cat-corporate)' },
  ];

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="timetable-page container animate-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div style={{ textAlign: 'left' }}>
              <div className="badge badge-gold" style={{ marginBottom: 12 }}>
                {t.timetable?.schedule || 'Schedule'}
              </div>
              <h1 className="section-title" style={{ marginBottom: 8, textAlign: 'left' }}>
                {t.timetable?.title || 'Hall Schedule'}
              </h1>
              <p className="section-subtitle" style={{ margin: 0, textAlign: 'left' }}>
                {t.timetable?.subtitle || 'View all upcoming events and plan your time'}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
              <div className="view-toggle" style={{ margin: 0 }}>
                <button 
                  className={`view-toggle-btn ${viewMode === 'week' ? 'active' : ''}`} 
                  onClick={() => setViewMode('week')}
                >
                  {t.misc?.weekly || t.timetable?.weekView}
                </button>
                <button 
                  className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`} 
                  onClick={() => setViewMode('month')}
                >
                  {t.misc?.monthly}
                </button>
              </div>

              <div className="week-nav" style={{ margin: 0 }}>
                <button onClick={() => viewMode === 'week' ? changeWeek(-1) : changeMonth(-1)}><ChevronLeft size={20} /></button>
                <div className="week-label">
                  {viewMode === 'week' ? formatWeekRange() : formatMonthRange()}
                </div>
                <button onClick={() => viewMode === 'week' ? changeWeek(1) : changeMonth(1)}><ChevronRight size={20} /></button>
                <button className="today-btn" onClick={() => viewMode === 'week' ? jumpToToday() : jumpToTodayMonth()}>
                  {t.timetable?.today || 'Today'}
                </button>
              </div>
            </div>
          </div>

          <div className="timetable-legend" style={{ justifyContent: 'flex-end', marginBottom: '20px' }}>
            {categories.map(c => (
              <div key={c.id} className="legend-item">
                <div className="legend-dot" style={{ background: c.color }} />
                {t.timetable?.[c.id] || t.events?.[c.id] || c.id}
              </div>
            ))}
          </div>

          {/* Mobile Day Selector (Week Only) */}
          {viewMode === 'week' && (
            <div className="day-selector">
              {weekDays.map((date, i) => {
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const hasEvent = events.some(e => e.date === dateStr);
                return (
                  <button
                    key={i}
                    className={`day-selector-btn ${selectedDayIndex === i ? 'active' : ''}`}
                    onClick={() => setSelectedDayIndex(i)}
                  >
                    <span style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: 600, opacity: selectedDayIndex === i ? 1 : 0.6 }}>
                      {t.timetable?.[dayNames[i]] || dayNames[i]}
                    </span>
                    <span style={{ fontSize: 18, fontWeight: 800 }}>{date.getDate()}</span>
                    {hasEvent && <div style={{ width: 4, height: 4, borderRadius: '50%', background: selectedDayIndex === i ? '#fff' : 'var(--text-accent)', marginTop: 2 }} />}
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === 'week' ? (
            <div className="timetable-container reveal visible">
            <div className="day-headers-row">
              <div className="time-gutter-header"></div>
              {weekDays.map((date, i) => {
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const hasEvent = events.some(e => e.date === dateStr);
                return (
                  <div key={i} className={`day-header ${isToday(date) ? 'today' : ''}`}>
                    <div className="day-name">{t.timetable?.[dayNames[i]] || dayNames[i]}</div>
                    <div className="day-number" style={hasEvent && !isToday(date) ? { color: 'var(--text-accent)', background: 'rgba(255, 221, 0, 0.15)' } : {}}>
                      {date.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid-body">
              <div className="time-gutter">
                {hours.map(h => (
                  <div key={h} className="time-label" style={{ top: `${(h - START_HOUR) * ROW_HEIGHT}px` }}>
                    {h.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>

              {weekDays.map((date, i) => {
                const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                const dayEvents = events.filter(e => e.date === dateStr);

                return (
                  <div key={i} className={`day-column ${selectedDayIndex === i ? 'active-mobile' : ''}`}>
                    {hours.map(h => (
                      <div key={h}>
                        <div className="hour-line" style={{ top: `${(h - START_HOUR) * ROW_HEIGHT}px` }} />
                        <div className="half-hour-line" style={{ top: `${(h - START_HOUR + 0.5) * ROW_HEIGHT}px` }} />
                      </div>
                    ))}
                    
                    {isToday(date) && currentMinutesOffset > 0 && (
                      <div className="current-time-line" style={{ top: `${currentMinutesOffset}px` }} />
                    )}

                    {dayEvents.map(event => {
                      const isConflict = checkConflict(event.date, event.time, event.endTime, event.id).hasConflict;
                      return (
                        <div
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          className={`event-block cat-${event.category} ${isConflict ? 'conflict' : ''}`}
                          style={getEventStyles(event)}
                          title={isConflict ? t.timetable?.conflictWarning : ''}
                        >
                          <div className="event-block-time">{event.time} – {event.endTime}</div>
                          <div className="event-block-title">{getTitle(event)}</div>
                          {event.organizer && <div className="event-block-meta">{event.organizer}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          ) : (
            <div className="month-container reveal visible">
              <div className="month-grid">
                {/* Headers */}
                {dayNames.map((name, i) => (
                  <div key={i} className="month-day-header">
                    {t.timetable?.[name] || name}
                  </div>
                ))}
                {/* Cells */}
                {monthDays.map((date, i) => {
                  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                  const dayEvents = events.filter(e => e.date === dateStr);
                  const isCurrentMonth = date.getMonth() === currentMonthStart.getMonth();
                  const hasEvent = dayEvents.length > 0;
                  return (
                    <div key={i} 
                         className={`month-cell ${isCurrentMonth ? '' : 'not-current-month'} ${isToday(date) ? 'today' : ''}`}
                         style={hasEvent ? { background: 'rgba(255, 221, 0, 0.05)' } : {}}
                         onClick={() => {
                            if (dayEvents.length === 1) setSelectedEvent(dayEvents[0]);
                         }}
                    >
                      <div className="month-cell-header">
                        <div className="month-day-number">{date.getDate()}</div>
                      </div>
                      <div className="month-events">
                        {dayEvents.map(event => {
                          const categoryObj = categories.find(c => c.id === event.category) || {};
                          const color = categoryObj.color || 'var(--cat-conference)';
                          return (
                            <div key={event.id} className="month-event-badge" style={{ backgroundColor: color }}
                                 onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}>
                              {event.time} - {getTitle(event)}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Event Modal */}
        {selectedEvent && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px'
          }} onClick={() => setSelectedEvent(null)}>
            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '24px', padding: '32px',
              maxWidth: '500px', width: '100%',
              boxShadow: '0 24px 60px rgba(0,0,0,0.3)',
              position: 'relative'
            }} onClick={e => e.stopPropagation()}>
              <button style={{
                position: 'absolute', top: '24px', right: '24px',
                background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                borderRadius: '50%', width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'var(--text-primary)'
              }} onClick={() => setSelectedEvent(null)}>
                <X size={18} />
              </button>
              
              <div className={`badge badge-violet`} style={{ marginBottom: '16px' }}>
                {t.events?.[selectedEvent.category] || selectedEvent.category}
              </div>
              
              <h2 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {getTitle(selectedEvent)}
              </h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                  <Calendar size={18} style={{ color: 'var(--text-accent)' }} />
                  <span style={{ fontWeight: 500 }}>{selectedEvent.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                  <Clock size={18} style={{ color: 'var(--text-accent)' }} />
                  <span style={{ fontWeight: 500 }}>{selectedEvent.time} – {selectedEvent.endTime}</span>
                </div>
                {selectedEvent.organizer && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)' }}>
                    <MapPin size={18} style={{ color: 'var(--text-accent)' }} />
                    <span style={{ fontWeight: 500 }}>{selectedEvent.organizer}</span>
                  </div>
                )}
              </div>
              
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => router.push(`/events/${selectedEvent.id}`)}
              >
                {t.events?.viewDetails || 'View Full Details'}
              </button>
            </div>
          </div>
        )}
        {/* Yellow Geometric iTicket Banner */}
        <YellowShapeBanner />
      </main>
      <Footer />
    </div>
  );
}
