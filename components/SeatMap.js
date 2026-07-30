import { useState, useCallback, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { supabase } from '@/lib/supabase';
import { normalizeSeatId, SEAT_NUMBERS, buildTakenSeatsSet } from '@/lib/seatUtils';
import styles from './SeatMap.module.css';

// genSeats logic moved inside SeatMap component to allow global numbering

/* ── Single seat ── */
function Seat({ seat, status, isLight, onSelect }) {
  const booked   = status === 'booked';
  const selected = status === 'selected';
  const vip      = seat.isVip;

  let bg, border, shadow, cursor, color;
  if (booked)   { bg = isLight ? '#f3f4f6' : 'var(--bg-secondary)'; border = isLight ? '#d1d5db' : 'var(--border)'; shadow='none'; cursor='not-allowed'; color = isLight ? '#9ca3af' : 'var(--text-muted)'; }
  else if (selected) { bg='linear-gradient(135deg,#FFDD00,#FFDD00)'; border='#FFDD00'; shadow='0 0 14px rgba(255, 221, 0, 0.35)'; cursor='pointer'; color='#fff'; }
  else if (vip) { bg = isLight ? 'rgba(124, 58, 237, 0.15)' : 'rgba(109, 40, 217, 0.15)'; border = isLight ? 'rgba(109, 40, 217, 0.4)' : 'rgba(139, 92, 246, 0.5)'; shadow='none'; cursor='pointer'; color = isLight ? '#6d28d9' : '#c4b5fd'; }
  else          { bg = isLight ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'; border = isLight ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.4)'; shadow='none'; cursor='pointer'; color = isLight ? '#047857' : '#6ee7b7'; }

  return (
    <div
      className={`${styles.seat} ${booked?styles.booked:''} ${selected?styles.selected:''} ${vip?styles.vip:''}`}
      onClick={() => !booked && onSelect(seat)}
      title={booked ? `${seat.id} (Booked)` : vip ? `${seat.id} — VIP` : seat.id}
      style={{ background: bg, borderColor: border, boxShadow: shadow, cursor, color }}
    >
      {seat.num}
    </div>
  );
}

/* ── Block component ── */
function SeatBlock({ block, bookedSet, selectedSet, isLight, onSelect, t }) {
  const { rows, cols, isVip, seats, label } = block;
  return (
    <div className={`${styles.blockWrapper}`} style={isVip ? { borderColor: isLight ? 'rgba(109, 40, 217, 0.3)' : 'rgba(139, 92, 246, 0.3)', background: isLight ? 'rgba(124, 58, 237, 0.05)' : 'rgba(139, 92, 246, 0.05)' } : {}}>
      <div className={`${styles.blockLabel}`} style={{ color: isVip ? (isLight ? '#6d28d9' : '#c4b5fd') : 'var(--text-secondary)' }}>
        {isVip ? `${t?.seatMap?.block || 'Block'} ${label} · ${t?.seatMap?.vip || 'VIP'}` : `${t?.seatMap?.block || 'Block'} ${label}`}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, ri) => (
        <div key={ri} className={styles.seatRow}>
          {[...Array(cols)].map((_, ci) => {
            const seat = seats.find(s => s.row === ri+1 && s.col === ci+1);
            if (!seat) return <div key={ci} style={{width: 32, height: 32}}/>; // placeholder for empty seat
            // Use canonical ID for matching
            const canonicalId = `${seat.block}-${seat.row}-${seat.col}`;
            const isSelected = selectedSet.has(seat.id) || selectedSet.has(canonicalId);
            const isBooked = bookedSet.has(seat.id) || bookedSet.has(canonicalId) || bookedSet.has(`Seat #${seat.num}`);
            const status = isSelected ? 'selected' : isBooked ? 'booked' : 'available';
            return <Seat key={seat.id} seat={seat} status={status} isLight={isLight} onSelect={onSelect} t={t} />;
          })}
        </div>
      ))}
    </div>
  );
}

export default function SeatMap({ eventId, bookedSeats = [], onSelectionChange, maxSelections }) {
  const { t, hallBlocks, theme } = useApp();
  const isLight = theme === 'light';
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [takenSeatsList, setTakenSeatsList] = useState(bookedSeats);

  // Build blocks with global seat numbering — use CANONICAL format "C1-1-5"
  let currentNum = 1;
  const blocks = hallBlocks.map(block => {
    const seats = [];
    for (let r = 1; r <= block.rows; r++) {
      for (let c = 1; c <= block.cols; c++) {
        // CANONICAL: "C1-1-5" (block-row-col with hyphens)
        const canonicalId = `${block.label}-${r}-${c}`;
        seats.push({ id: canonicalId, num: currentNum++, block: block.label, row: r, col: c, isVip: block.isVip });
      }
    }
    return { ...block, seats };
  });
  const allSeats = blocks.flatMap(b => b.seats);

  useEffect(() => {
    if (!eventId) return;
    async function loadEventTakenSeats() {
      try {
        const { createClient } = require('@supabase/supabase-js');
        const anonSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
          auth: { persistSession: false },
          global: { fetch: (url, options) => fetch(url, { ...options, cache: 'no-store' }) }
        });

        const { data: mdData } = await anonSupabase
          .from('movie_registrations')
          .select('id, seat, ticket_id, created_at')
          .order('created_at', { ascending: true });

        const { data: ticketsData } = await anonSupabase
          .from('tickets')
          .select('id, event_id, event_title, created_at, seat')
          .order('created_at', { ascending: true });

        const combined = [];
        const seenCodes = new Set();

        (mdData || []).forEach(r => {
          const rawCode = (r.ticket_id || '').split('::')[0];
          seenCodes.add(rawCode);
          seenCodes.add(r.id);
          combined.push(r);
        });

        (ticketsData || []).forEach(t => {
          if (t.seat) {
            const shortCode = (t.id || '').slice(0, 8).toUpperCase();
            if (!seenCodes.has(t.id) && !seenCodes.has(shortCode)) {
              combined.push(t);
            }
          }
        });

        // Use shared utility to build taken seats
        const taken = buildTakenSeatsSet(combined, eventId);
        // Also add any initially passed bookedSeats
        bookedSeats.forEach(s => {
          const canonical = normalizeSeatId(s);
          if (canonical) taken.add(canonical);
        });

        setTakenSeatsList(Array.from(taken));
      } catch (err) { console.error('loadEventTakenSeats error:', err); }
    }

    loadEventTakenSeats();

    const channel = supabase
      .channel('seat_map_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movie_registrations' }, payload => {
        if (payload.eventType === 'DELETE') {
          loadEventTakenSeats();
        } else if (payload.new?.seat) {
          const { normalizeSeatId, SEAT_NUMBERS } = require('@/lib/seatUtils');
          const canonical = normalizeSeatId(payload.new.seat);
          if (canonical) {
            setTakenSeatsList(prev => {
              const next = new Set(prev);
              next.add(canonical);
              const parts = canonical.split('-');
              if (parts.length === 3) {
                next.add(`${parts[0]}${parts[1]}-${parts[2]}`);
                const num = SEAT_NUMBERS[canonical];
                if (num) next.add(`Seat #${num}`);
              }
              return Array.from(next);
            });
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const bookedSet = new Set(takenSeatsList);
  const totalAvail = allSeats.filter(s => {
    const canonicalId = `${s.block}-${s.row}-${s.col}`;
    return !bookedSet.has(s.id) && !bookedSet.has(canonicalId) && !bookedSet.has(`Seat #${s.num}`);
  }).length;

  const handleSelect = (seat) => {
    const next = new Set(selectedIds);
    if (next.has(seat.id)) {
      next.delete(seat.id);
    } else {
      if (maxSelections && next.size >= maxSelections) {
        alert(t?.eventDetailPage?.maxSeatsReached || `You can only select up to ${maxSelections} seat(s).`);
        return;
      }
      next.add(seat.id);
    }
    setSelectedIds(next);
    onSelectionChange?.(allSeats.filter(s => next.has(s.id)));
  };

  return (
    <div className={styles.mapOuter}>
      {/* Legend */}
      <div className={styles.legend}>
        {[
          { bg: isLight ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)', border: isLight ? 'rgba(5, 150, 105, 0.4)' : 'rgba(16, 185, 129, 0.4)', label: t?.seatMap?.available || 'Available' },
          { bg: isLight ? 'rgba(124, 58, 237, 0.15)' : 'rgba(109, 40, 217, 0.15)', border: isLight ? 'rgba(109, 40, 217, 0.4)' : 'rgba(139, 92, 246, 0.5)', label: t?.seatMap?.vip || 'VIP' },
          { bg:'linear-gradient(135deg,#FFDD00,#FFDD00)', border:'#FFDD00', shadow:'0 0 8px rgba(255, 221, 0, 0.35)', label: t?.seatMap?.selected || 'Selected' },
          { bg: isLight ? '#f3f4f6' : 'var(--bg-secondary)', border: isLight ? '#d1d5db' : 'var(--border)', label: t?.seatMap?.booked || 'Booked', opacity:0.8 },
        ].map(l => (
          <div key={l.label} className={styles.legendItem}>
            <div className={styles.ldot} style={{ background:l.bg, borderColor:l.border, boxShadow:l.shadow, opacity:l.opacity }} />
            <span>{l.label}</span>
          </div>
        ))}
        <div className={styles.legendSep} />
        <span className={styles.legendStat}><b style={{color:'#FFDD00'}}>{selectedIds.size}</b> {t?.seatMap?.selectedCount || 'selected'}</span>
        <span className={styles.legendStat}><b style={{color:'#10b981'}}>{totalAvail}</b> {t?.seatMap?.availableCount || 'available'}</span>
      </div>

      <div className={styles.mobileSwipeHint}>
        <span>{t?.seatMap?.swipeHint || '↔ Swipe horizontally to explore all seats ↔'}</span>
      </div>

      <div className={styles.viewport}>
          {/* SCENE */}
          <div className={styles.sceneBar}>
            <div className={styles.scanLine} />
            <span className={styles.sceneText}>{t?.seatMap?.scene || 'SCENE / SCREEN'}</span>
            <div className={styles.sceneGlow} />
          </div>

        {/* Main layout using CSS Grid */}
        <div className={styles.mainGrid}>
          {blocks.map(b => (
            <div key={b.id} style={{ gridRow: b.gridRow, gridColumn: b.gridCol }}>
              <SeatBlock block={b} bookedSet={bookedSet} selectedSet={selectedIds} isLight={isLight} onSelect={handleSelect} t={t} />
            </div>
          ))}
        </div>

        {/* Entrance */}
        <div className={styles.entranceArea}>
          <div className={styles.entranceLine} />
          <div className={styles.entranceBox}>
            <div className={styles.doorRow}>
              <div className={styles.door} /><div className={styles.doorGap} /><div className={styles.door} />
            </div>
            <div className={styles.entranceLabel}>🚪 {t?.seatMap?.entrance || 'ENTRANCE'}</div>
          </div>
          <div className={styles.entranceLine} />
        </div>
      </div>
    </div>
  );
}
