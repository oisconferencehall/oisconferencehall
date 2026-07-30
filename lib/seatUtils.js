/**
 * Shared seat utilities for consistent seat ID handling across the app.
 * 
 * CANONICAL FORMAT: "C1-1-5" (block-row-col, all separated by hyphens)
 * LEGACY FORMAT:    "C11-5"  (block+row concatenated, then hyphen, then col)
 * DB FORMAT:        "eventId::C1-1-5" (event-prefixed)
 */

// ─── Hall Layout Blocks (single source of truth) ───────────────────
export const HALL_BLOCKS = [
  { id: 'L1', label: 'L1', name: 'BLOCK L1', rows: 2, cols: 3, isVip: false },
  { id: 'L2', label: 'L2', name: 'BLOCK L2 · VIP', rows: 2, cols: 3, isVip: true },
  { id: 'C1', label: 'C1', name: 'BLOCK C1 · VIP', rows: 2, cols: 5, isVip: true },
  { id: 'C2', label: 'C2', name: 'BLOCK C2 · VIP', rows: 2, cols: 5, isVip: true },
  { id: 'R1', label: 'R1', name: 'BLOCK R1 · VIP', rows: 2, cols: 3, isVip: true },
  { id: 'R2', label: 'R2', name: 'BLOCK R2', rows: 2, cols: 3, isVip: false },
  { id: 'L3', label: 'L3', name: 'BLOCK L3', rows: 4, cols: 3, isVip: false },
  { id: 'L4', label: 'L4', name: 'BLOCK L4', rows: 4, cols: 3, isVip: false },
  { id: 'C3', label: 'C3', name: 'BLOCK C3', rows: 4, cols: 5, isVip: false },
  { id: 'C4', label: 'C4', name: 'BLOCK C4', rows: 4, cols: 5, isVip: false },
  { id: 'R3', label: 'R3', name: 'BLOCK R3', rows: 4, cols: 3, isVip: false },
  { id: 'R4', label: 'R4', name: 'BLOCK R4', rows: 4, cols: 3, isVip: false },
  { id: 'L5', label: 'L5', name: 'BLOCK L5', rows: 2, cols: 3, isVip: false },
  { id: 'L6', label: 'L6', name: 'BLOCK L6', rows: 2, cols: 3, isVip: false },
  { id: 'C5', label: 'C5', name: 'BLOCK C5', rows: 3, cols: 5, isVip: false },
  { id: 'C6', label: 'C6', name: 'BLOCK C6', rows: 3, cols: 5, isVip: false },
  { id: 'R5', label: 'R5', name: 'BLOCK R5', rows: 2, cols: 3, isVip: false },
  { id: 'R6', label: 'R6', name: 'BLOCK R6', rows: 2, cols: 3, isVip: false },
];

// ─── Build seat number lookup ──────────────────────────────────────
// Maps canonical ID "C1-1-5" -> global number 17
export const SEAT_NUMBERS = {};
(function () {
  let counter = 1;
  HALL_BLOCKS.forEach(block => {
    for (let r = 1; r <= block.rows; r++)
      for (let c = 1; c <= block.cols; c++)
        SEAT_NUMBERS[`${block.id}-${r}-${c}`] = counter++;
  });
})();

export const TOTAL_SEATS = Object.keys(SEAT_NUMBERS).length; // 186

/**
 * Normalize any seat ID format to the canonical "C1-1-5" format.
 * Handles:
 *   - "eventId::C1-1-5"  → "C1-1-5"
 *   - "eventId::C11-5"   → "C1-1-5"
 *   - "C11-5"            → "C1-1-5"
 *   - "C1-1-5"           → "C1-1-5"
 *   - "Seat #17"         → "C1-1-5"
 *   - null/Reserved Pass → null
 */
export function normalizeSeatId(raw) {
  if (!raw) return null;
  let clean = String(raw).split('::').pop().trim();
  
  if (!clean || clean === 'Reserved Pass' || clean === 'Reserved' || clean === 'General Entry') {
    return null;
  }
  
  // Handle "Seat #17", "Seat 17", or numeric strings
  if (clean.startsWith('Seat #') || clean.startsWith('Seat ') || (!isNaN(parseInt(clean, 10)) && Number(clean) > 0 && Number(clean) <= TOTAL_SEATS)) {
    const num = parseInt(clean.replace(/Seat\s*#?/i, '').trim(), 10);
    if (!isNaN(num)) {
      const entry = Object.entries(SEAT_NUMBERS).find(([, v]) => v === num);
      if (entry) return entry[0];
    }
  }
  
  // Already canonical: "C1-1-5" (block has 1-2 letter + 1 digit, then dash, row, dash, col)
  if (SEAT_NUMBERS[clean] !== undefined) return clean;
  
  // Legacy format: "C11-5" → need to find which block matches
  for (const block of HALL_BLOCKS) {
    for (let r = 1; r <= block.rows; r++) {
      for (let c = 1; c <= block.cols; c++) {
        const legacyId = `${block.id}${r}-${c}`;
        if (clean === legacyId) {
          return `${block.id}-${r}-${c}`;
        }
      }
    }
  }
  
  // If it's a comma-separated list, normalize each part
  if (clean.includes(',')) {
    return clean.split(',').map(s => normalizeSeatId(s.trim())).filter(Boolean).join(', ');
  }
  
  return null; // Unknown format
}

/**
 * Get the global seat number for any seat ID format.
 */
export function getSeatNumber(raw) {
  const canonical = normalizeSeatId(raw);
  if (!canonical) return null;
  // Handle comma-separated
  if (canonical.includes(',')) {
    return canonical.split(',').map(s => SEAT_NUMBERS[s.trim()]).filter(Boolean);
  }
  return SEAT_NUMBERS[canonical] || null;
}

/**
 * Format a seat for display: "Seat #17 (C1 R1-5)"
 * If no specific seat ID is present, format based on index (Seat #1, Seat #2, etc.)
 */
export function formatSeatDisplay(raw, index) {
  const clean = raw ? String(raw).split('::').pop().trim() : '';

  if (!clean || clean === 'Reserved Pass' || clean === 'Reserved' || clean === 'General Entry') {
    const seatNum = (typeof index === 'number' && index >= 0) ? index + 1 : 1;
    const entry = Object.entries(SEAT_NUMBERS).find(([, v]) => v === seatNum);
    if (entry) {
      const canonical = entry[0];
      const parts = canonical.split('-');
      return `Seat #${seatNum} (${parts[0]} R${parts[1]}-${parts[2]})`;
    }
    return `Seat #${seatNum}`;
  }
  
  // Handle comma-separated seats
  if (clean.includes(',')) {
    return clean.split(',').map((s, i) => formatSeatDisplay(s.trim(), typeof index === 'number' ? index + i : undefined)).join(', ');
  }

  // Handle direct seat number strings e.g. "Seat #17" or "17"
  if (clean.startsWith('Seat #') || clean.startsWith('Seat ') || (!isNaN(parseInt(clean, 10)) && Number(clean) > 0 && Number(clean) <= TOTAL_SEATS)) {
    const num = parseInt(clean.replace(/Seat\s*#?/i, '').trim(), 10);
    if (!isNaN(num)) {
      const entry = Object.entries(SEAT_NUMBERS).find(([, v]) => v === num);
      if (entry) {
        const canonical = entry[0];
        const parts = canonical.split('-');
        return `Seat #${num} (${parts[0]} R${parts[1]}-${parts[2]})`;
      }
      return `Seat #${num}`;
    }
  }

  const canonical = normalizeSeatId(raw);
  if (!canonical) {
    return clean.startsWith('Seat #') ? clean : `Seat #${clean}`;
  }

  const num = SEAT_NUMBERS[canonical];
  if (num === undefined) {
    return clean.startsWith('Seat #') ? clean : `Seat #${clean}`;
  }
  
  const parts = canonical.split('-');
  return `Seat #${num} (${parts[0]} R${parts[1]}-${parts[2]})`;
}

/**
 * Build a Set of all taken canonical seat IDs from raw database records.
 * Returns a Set containing canonical IDs like "C1-1-5".
 */
export function buildTakenSeatsSet(registrations, eventId) {
  const taken = new Set();
  const shortId = eventId ? String(eventId).slice(0, 8) : '';
  
  registrations.forEach(r => {
    const rawSeat = r.seat;
    if (!rawSeat) return;
    const cleanSeat = String(rawSeat).split('::').pop().trim();
    
    // Check if this registration belongs to the current event
    const isForThisEvent = !eventId || (
      (r.ticket_id && String(r.ticket_id).includes(shortId)) ||
      (r.event_id && String(r.event_id).includes(shortId)) ||
      (rawSeat && String(rawSeat).includes(shortId))
    );
    
    if (!isForThisEvent) return;
    if (!cleanSeat || cleanSeat === 'Reserved Pass' || cleanSeat === 'Reserved' || cleanSeat === 'General Entry') return;
    
    // Handle comma-separated seats
    const tokens = cleanSeat.split(',').map(s => s.trim());
    tokens.forEach(token => {
      // Ignore artificial fallback labels ("Seat #1") if they were not explicitly selected physical seats
      if (token.startsWith('Seat #') && !rawSeat.includes('::')) {
        const isFromCanonical = Object.keys(SEAT_NUMBERS).some(k => String(rawSeat).includes(k));
        if (!isFromCanonical) return;
      }
      const canonical = normalizeSeatId(token);
      if (canonical) {
        // Add all possible formats so matching works everywhere
        taken.add(canonical); // "C1-1-5"
        const parts = canonical.split('-');
        taken.add(`${parts[0]}${parts[1]}-${parts[2]}`); // "C11-5" (legacy)
        const num = SEAT_NUMBERS[canonical];
        if (num) taken.add(`Seat #${num}`); // "Seat #17"
      }
    });
  });
  
  return taken;
}
