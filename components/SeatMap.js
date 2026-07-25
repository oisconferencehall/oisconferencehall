'use client';
import { useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
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
  else          { bg = isLight ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)'; border = isLight ? 'rgba(5, 150, 105, 0.4)' : 'rgba(16, 185, 129, 0.4)'; shadow='none'; cursor='pointer'; color = isLight ? '#047857' : '#6ee7b7'; }

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
            const status = selectedSet.has(seat.id) ? 'selected' : bookedSet.has(seat.id) ? 'booked' : 'available';
            return <Seat key={seat.id} seat={seat} status={status} isLight={isLight} onSelect={onSelect} t={t} />;
          })}
        </div>
      ))}
    </div>
  );
}

export default function SeatMap({ bookedSeats = [], onSelectionChange }) {
  const { t, hallBlocks, theme } = useApp();
  const isLight = theme === 'light';
  const [selectedIds, setSelectedIds] = useState(new Set());
  const bookedSet = new Set(bookedSeats);

  // Build blocks with global seat numbering
  let currentNum = 1;
  const blocks = hallBlocks.map(block => {
    const seats = [];
    for (let r = 1; r <= block.rows; r++) {
      for (let c = 1; c <= block.cols; c++) {
        seats.push({ id: `${block.label}${r}-${c}`, num: currentNum++, block: block.label, row: r, col: c, isVip: block.isVip });
      }
    }
    return { ...block, seats };
  });
  const allSeats = blocks.flatMap(b => b.seats);
  const totalAvail = allSeats.filter(s => !bookedSet.has(s.id)).length;

  const handleSelect = (seat) => {
    const next = new Set(selectedIds);
    next.has(seat.id) ? next.delete(seat.id) : next.add(seat.id);
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
            <span className={styles.sceneText} style={isLight ? { color: '#6d28d9' } : {}}>🎭 &nbsp; {t?.seatMap?.scene || 'SCENE / SCREEN'} &nbsp; 🎭</span>
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
