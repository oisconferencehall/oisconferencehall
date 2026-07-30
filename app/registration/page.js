'use client';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { SEAT_NUMBERS, TOTAL_SEATS, normalizeSeatId, formatSeatDisplay, buildTakenSeatsSet } from '@/lib/seatUtils';
import { QRCodeCanvas } from 'qrcode.react';

// ─── Translations ──────────────────────────────────────────────
const T = {
  en: {
    hero_sub: 'Join us for an unforgettable cinematic experience.<br/>Register below to secure your seat.',
    step_info: 'Your Info', step_seat: 'Choose Seat', step_confirm: 'Confirm',
    first_name: 'First Name', last_name: 'Last Name', phone: 'Phone Number',
    eng_level: 'English Level', select_level: 'Select your level', branch: 'Branch',
    other_branch: 'Please specify your branch', continue_btn: 'Continue to Seat Selection',
    choose_seat: 'Choose Your Seat', seat_sub: 'Click on an available seat to select it',
    confirm_seat: 'Confirm Seat', review_title: 'Review & Submit',
    review_sub: 'Please verify your details before submitting',
    terms: 'I confirm my details are correct and agree to attend the event',
    submit_btn: 'Submit & Get Ticket', success_title: "You're registered!",
    success_sub: 'Your ticket has been generated and downloaded. See you at Movie Day!',
    download_again: 'Download Ticket Again', register_another: 'Register Another Person',
    ph_first_name: 'Enter your first name', ph_last_name: 'Enter your last name',
    ph_other_branch: 'Enter your branch name',
    err_first_name: 'Please enter your first name', err_last_name: 'Please enter your last name',
    err_phone: 'Please enter a valid phone number', err_level: 'Please select your English level',
    err_branch: 'Please select your branch', err_other_branch: 'Please specify your branch name',
    zoom_fit: 'Fit',
  },
  uz: {
    hero_sub: "Unutilmas kino tajribasiga qo'shiling.<br/>O'rningizni band qilish uchun quyida ro'yxatdan o'ting.",
    step_info: "Ma'lumotlar", step_seat: 'Joy tanlash', step_confirm: 'Tasdiqlash',
    first_name: 'Ism', last_name: 'Familiya', phone: 'Telefon raqami',
    eng_level: 'Ingliz tili darajasi', select_level: 'Darajangizni tanlang', branch: 'Filial',
    other_branch: "Filialni ko'rsating", continue_btn: "Joy tanlashga o'tish",
    choose_seat: 'Joyingizni tanlang', seat_sub: "Joy tanlash uchun bo'sh joyni bosing",
    confirm_seat: 'Joyni tasdiqlash', review_title: "Ko'rib chiqish va yuborish",
    review_sub: "Yuborishdan oldin ma'lumotlaringizni tekshiring",
    terms: "Ma'lumotlarim to'g'ri ekanligini va tadbirga qatnashishga roziligimni tasdiqlayman",
    submit_btn: 'Yuborish va chipta olish', success_title: "Ro'yxatdan o'tdingiz!",
    success_sub: "Chiptangiz yuklandi. Movie Day'da ko'rishguncha!",
    download_again: 'Chiptani qayta yuklash', register_another: "Boshqa kishini ro'yxatdan o'tkazish",
    ph_first_name: 'Ismingizni kiriting', ph_last_name: 'Familiyangizni kiriting',
    ph_other_branch: 'Filial nomini kiriting',
    err_first_name: 'Ismingizni kiriting', err_last_name: 'Familiyangizni kiriting',
    err_phone: "Telefon raqamingizni to'liq kiriting", err_level: 'Ingliz tili darajangizni tanlang',
    err_branch: 'Filialingizni tanlang', err_other_branch: 'Filial nomini kiriting', zoom_fit: "Sig'dirish",
  },
  ru: {
    hero_sub: 'Присоединяйтесь к нам для незабываемого опыта.<br/>Зарегистрируйтесь ниже, чтобы забронировать место.',
    step_info: 'Ваши данные', step_seat: 'Выбор места', step_confirm: 'Подтверждение',
    first_name: 'Имя', last_name: 'Фамилия', phone: 'Номер телефона',
    eng_level: 'Уровень английского', select_level: 'Выберите ваш уровень', branch: 'Филиал',
    other_branch: 'Укажите ваш филиал', continue_btn: 'Перейти к выбору места',
    choose_seat: 'Выберите ваше место', seat_sub: 'Нажмите на доступное место для выбора',
    confirm_seat: 'Подтвердить место', review_title: 'Проверка и отправка',
    review_sub: 'Пожалуйста, проверьте ваши данные перед отправкой',
    terms: 'Я подтверждаю правильность своих данных и соглашаюсь посетить мероприятие',
    submit_btn: 'Отправить и получить билет', success_title: 'Вы зарегистрированы!',
    success_sub: 'Ваш билет загружен. Увидимся на Movie Day!',
    download_again: 'Скачать билет снова', register_another: 'Зарегистрировать другого',
    ph_first_name: 'Введите ваше имя', ph_last_name: 'Введите вашу фамилию',
    ph_other_branch: 'Введите название филиала',
    err_first_name: 'Пожалуйста, введите ваше имя', err_last_name: 'Пожалуйста, введите вашу фамилию',
    err_phone: 'Пожалуйста, введите действительный номер', err_level: 'Пожалуйста, выберите уровень',
    err_branch: 'Пожалуйста, выберите ваш филиал', err_other_branch: 'Пожалуйста, укажите филиал',
    zoom_fit: 'Вместить',
  },
};

// ─── Hall Layout Blocks (for seat map rendering in 3 visual rows) ──
const BLOCKS = [
  [
    { id: 'L1', name: 'BLOCK L1', rows: 2, cols: 3, vip: false },
    { id: 'L2', name: 'BLOCK L2 · VIP', rows: 2, cols: 3, vip: true },
    { id: 'C1', name: 'BLOCK C1 · VIP', rows: 2, cols: 5, vip: true },
    { id: 'C2', name: 'BLOCK C2 · VIP', rows: 2, cols: 5, vip: true },
    { id: 'R1', name: 'BLOCK R1 · VIP', rows: 2, cols: 3, vip: true },
    { id: 'R2', name: 'BLOCK R2', rows: 2, cols: 3, vip: false },
  ],
  [
    { id: 'L3', name: 'BLOCK L3', rows: 4, cols: 3, vip: false },
    { id: 'L4', name: 'BLOCK L4', rows: 4, cols: 3, vip: false },
    { id: 'C3', name: 'BLOCK C3', rows: 4, cols: 5, vip: false },
    { id: 'C4', name: 'BLOCK C4', rows: 4, cols: 5, vip: false },
    { id: 'R3', name: 'BLOCK R3', rows: 4, cols: 3, vip: false },
    { id: 'R4', name: 'BLOCK R4', rows: 4, cols: 3, vip: false },
  ],
  [
    { id: 'L5', name: 'BLOCK L5', rows: 2, cols: 3, vip: false },
    { id: 'L6', name: 'BLOCK L6', rows: 2, cols: 3, vip: false },
    { id: 'C5', name: 'BLOCK C5', rows: 3, cols: 5, vip: false },
    { id: 'C6', name: 'BLOCK C6', rows: 3, cols: 5, vip: false },
    { id: 'R5', name: 'BLOCK R5', rows: 2, cols: 3, vip: false },
    { id: 'R6', name: 'BLOCK R6', rows: 2, cols: 3, vip: false },
  ],
];

// formatSeat uses shared utility
function formatSeat(id) {
  if (!id) return '—';
  return formatSeatDisplay(id);
}

function formatEventDate(dateStr) {
  if (!dateStr) return 'Saturday, July 11, 2026';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T00:00:00`);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

function formatPhone(val) {
  const digits = val.replace(/\D/g, '').slice(0, 9);
  let f = '';
  if (digits.length > 0) f = digits.slice(0, 2);
  if (digits.length > 2) f += ' ' + digits.slice(2, 5);
  if (digits.length > 5) f += ' ' + digits.slice(5, 7);
  if (digits.length > 7) f += ' ' + digits.slice(7, 9);
  return f;
}

// ─── Main Component ────────────────────────────────────────────
import { useApp } from '@/context/AppContext';

function RegistrationPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang, changeLang, t: globalT, events: appEvents } = useApp(); // Use global app language
  const eventId = searchParams.get('eventId');
  const isFromTelegram = searchParams.get('source') === 'telegram';
  // Normalize preselected seats from URL (may come as "C11-5" from event page SeatMap)
  const preselectedSeats = (searchParams.get('seats')?.split(',').filter(Boolean) || []).map(s => normalizeSeatId(s.trim()) || s.trim());
  const [activePreselectedSeats, setActivePreselectedSeats] = useState(preselectedSeats);

  const [showLangModal, setShowLangModal] = useState(isFromTelegram);
  const [step, setStep] = useState(1);
  const t = T[lang] || T['en'];

  // Event state
  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);

  const isMovieEvent = !event || !event.category || event.category.toLowerCase() === 'movie';

  useEffect(() => {
    if (eventId) {
      const appFound = appEvents?.find(e => String(e.id) === String(eventId));
      if (appFound) setEvent(appFound);

      async function fetchEventData() {
        const { data } = await supabase.from('movie_events').select('*').eq('id', eventId).single();
        if (data) {
          setEvent(data);
        } else {
          const { data: evData } = await supabase.from('events').select('*').eq('id', eventId).single();
          if (evData) setEvent(evData);
        }
        setEventLoading(false);
      }
      fetchEventData();
    } else {
      setEventLoading(false);
    }
  }, [eventId, appEvents]);

  // Form state
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', englishLevel: '', branch: '', otherBranch: '' });
  const [errors, setErrors] = useState({});
  const [levelOpen, setLevelOpen] = useState(false);

  // Seat state
  const [takenSeats, setTakenSeats] = useState(new Set());
  const [selectedSeat, setSelectedSeat] = useState(preselectedSeats.length > 0 ? preselectedSeats[0] : null);
  const [seatsLoading, setSeatsLoading] = useState(false);
  const [scale, setScale] = useState(1);
  const [isAutoFit, setIsAutoFit] = useState(true);
  const seatContainerRef = useRef(null);
  const seatInnerRef = useRef(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastReg, setLastReg] = useState(null);
  const [ticketUrl, setTicketUrl] = useState(null);
  const [toast, setToast] = useState(null);
  const [termsChecked, setTermsChecked] = useState(false);

  // Realtime subscription
  const subRef = useRef(null);

  // Toast helper
  const showToast = useCallback((msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Load taken seats ────────────────────────────────────────
  const loadSeats = useCallback(async () => {
    setSeatsLoading(true);
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
        .select('id, event_id, event_title, created_at')
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

      // Use shared utility for consistent seat matching
      const taken = buildTakenSeatsSet(combined, eventId);
      setTakenSeats(taken);
    } catch {
      setTakenSeats(new Set());
    }
    setSeatsLoading(false);
  }, [eventId]);

  // ── Realtime subscribe ──────────────────────────────────────
  const subscribeSeats = useCallback(() => {
    if (subRef.current) supabase.removeChannel(subRef.current);
    subRef.current = supabase
      .channel('movie_seats_ch')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'movie_registrations' }, payload => {
        // When a new registration comes in, normalize and add to taken set
        if (payload.new?.seat) {
          const canonical = normalizeSeatId(payload.new.seat);
          if (canonical) {
            setTakenSeats(prev => {
              const next = new Set(prev);
              next.add(canonical);
              // Also add legacy and Seat # formats
              const parts = canonical.split('-');
              if (parts.length === 3) {
                next.add(`${parts[0]}${parts[1]}-${parts[2]}`);
                const num = SEAT_NUMBERS[canonical];
                if (num) next.add(`Seat #${num}`);
              }
              return next;
            });
          }
        }
        if (payload.eventType === 'DELETE') {
          loadSeats(); // Reload from DB to properly sync deletions (as payload.old lacks seat data by default)
        } else if (payload.old?.seat) {
          const canonical = normalizeSeatId(payload.old.seat);
          if (canonical) {
            setTakenSeats(prev => {
              const next = new Set(prev);
              next.delete(canonical);
              const parts = canonical.split('-');
              if (parts.length === 3) {
                next.delete(`${parts[0]}${parts[1]}-${parts[2]}`);
                const num = SEAT_NUMBERS[canonical];
                if (num) next.delete(`Seat #${num}`);
              }
              return next;
            });
          }
        }
      })
      .subscribe();
  }, []);

  useEffect(() => {
    if (step === 2) { loadSeats(); subscribeSeats(); }
    return () => { if (subRef.current) supabase.removeChannel(subRef.current); };
  }, [step, loadSeats, subscribeSeats]);

  // ── Auto-fit zoom ───────────────────────────────────────────
  useEffect(() => {
    if (step !== 2) return;

    const updateScale = () => {
      if (!seatContainerRef.current || !seatInnerRef.current) return;
      const el = seatInnerRef.current;
      const origW = el.scrollWidth || 1050;
      const contW = seatContainerRef.current.clientWidth || (window.innerWidth - 32);
      if (isAutoFit && origW > 0 && contW > 0) {
        const padding = window.innerWidth < 640 ? 12 : 24;
        const fit = (contW - padding) / origW;
        setScale(Math.min(1, Math.max(0.2, fit)));
      }
    };

    updateScale();
    const t1 = setTimeout(updateScale, 60);
    const t2 = setTimeout(updateScale, 300);
    window.addEventListener('resize', updateScale);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateScale);
    };
  }, [step, takenSeats, isAutoFit]);

  // ── Step 1 validation ───────────────────────────────────────
  const validateStep1 = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = t.err_first_name;
    if (!form.lastName.trim()) errs.lastName = t.err_last_name;
    if (!form.phone || form.phone.replace(/\D/g, '').length < 9) errs.phone = t.err_phone;
    
    if (isMovieEvent) {
      if (!form.englishLevel) errs.englishLevel = t.err_level;
      if (!form.branch) errs.branch = t.err_branch;
      if (form.branch === 'Other' && !form.otherBranch.trim()) errs.otherBranch = t.err_other_branch;
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goStep2 = () => { 
    if (validateStep1()) {
      if (activePreselectedSeats.length > 0) {
        const isAnyTaken = activePreselectedSeats.some(s => takenSeats.has(s) || takenSeats.has(normalizeSeatId(s)));
        if (isAnyTaken) {
          showToast('The preselected seat is already reserved. Please select another seat.', 'error');
          setActivePreselectedSeats([]);
          setSelectedSeat(null);
          setStep(2);
        } else {
          setStep(3); // Skip seat selection if seats were already passed from event page
        }
      } else {
        setStep(2); 
      }
    }
  };
  const goStep3 = () => { if (selectedSeat) setStep(3); };

  const submit = async () => {
    if (!termsChecked) { showToast('Please confirm your details first.', 'error'); return; }
    setSubmitting(true);
    const movieTitle = event?.title || 'Movie Day 2026';
    const baseCode = 'MD-' + Date.now().toString(36).toUpperCase();
    const fullTicketId = eventId ? `${baseCode}::${eventId}::${movieTitle}` : `${baseCode}::general::${movieTitle}`;
    const branch = form.branch === 'Other' ? form.otherBranch : form.branch;
    // Normalize seat to canonical format before saving
    const rawSeatInput = activePreselectedSeats.length > 0 ? activePreselectedSeats.join(', ') : selectedSeat;
    const rawSeat = rawSeatInput ? (rawSeatInput.includes(',') 
      ? rawSeatInput.split(',').map(s => normalizeSeatId(s.trim()) || s.trim()).join(', ')
      : normalizeSeatId(rawSeatInput) || rawSeatInput) : rawSeatInput;
    
    // Store composite seat per event to make seat unique per event across database constraints
    const targetEventId = eventId || 'general';
    const dbSeatVal = `${targetEventId}::${rawSeat}`;
    
    const payload = {
      first_name: form.firstName, last_name: form.lastName,
      phone: '+998 ' + form.phone, english_level: form.englishLevel,
      branch, seat: dbSeatVal, ticket_id: fullTicketId,
    };
    
    // Create an anonymous client so it doesn't send the authenticated user's JWT, avoiding RLS 'anon' policy violations
    const { createClient } = require('@supabase/supabase-js');
    const anonSupabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
      auth: { persistSession: false }
    });

    const { data, error } = await anonSupabase.from('movie_registrations').insert([payload]).select().single();

    if (error) {
      if (error.message?.includes('unique constraint') || error.message?.includes('duplicate key') || error.code === '23505') {
        showToast('This seat was just reserved by another attendee. Please select another seat.', 'error');
      } else {
        showToast('Registration failed: ' + error.message, 'error');
      }
      setSubmitting(false);
      return;
    }

    const cleanReg = {
      ...(data || payload),
      seat: rawSeat
    };
    setLastReg(cleanReg);
    showToast("Registered successfully!", 'success');
    generateTicketImage(cleanReg);
    setSubmitted(true);
    setSubmitting(false);
  };

  const DEFAULT_TICKET_PRESET = {
    title: 'Movie Day 2026 Card Pass',
    bgImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
    width: 480, height: 680, flipX: false, flipY: false,
    elements: [
      { id: 'el-bg-card', type: 'rect', x: 10, y: 10, width: 460, height: 660, bgColor: 'rgba(15, 12, 10, 0.92)', borderColor: 'rgba(234, 88, 12, 0.5)', borderWidth: 2, borderRadius: 24, opacity: 100 },
      { id: 'el-hdr-banner', type: 'rect', x: 10, y: 10, width: 460, height: 80, bgColor: 'rgba(234, 88, 12, 0.22)', borderColor: 'rgba(234, 88, 12, 0.35)', borderWidth: 1, borderRadius: 24, opacity: 100 },
      { id: 'el-title', type: 'text', text: 'MOVIE DAY 2026', x: 30, y: 24, fontSize: 24, fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit' },
      { id: 'el-subtitle', type: 'text', text: 'OFFICIAL VIP ENTRY PASS CARD', x: 30, y: 56, fontSize: 10, fontWeight: '800', color: '#fb923c', fontFamily: 'Outfit' },
      
      // Movie Title Box (In place of QR code)
      { id: 'el-movie-box', type: 'rect', x: 30, y: 105, width: 420, height: 115, bgColor: 'rgba(234, 88, 12, 0.18)', borderColor: 'rgba(234, 88, 12, 0.4)', borderWidth: 2, borderRadius: 16, opacity: 100 },
      { id: 'el-movie-lbl', type: 'text', text: '🎬 MOVIE TITLE', x: 50, y: 122, fontSize: 11, fontWeight: '800', color: '#fb923c', fontFamily: 'Outfit' },
      { id: 'el-movie-val', type: 'text', text: '{movie}', x: 50, y: 148, fontSize: 24, fontWeight: '900', color: '#FFDD00', fontFamily: 'Outfit' },
      
      // Ticket Code
      { id: 'el-code-lbl', type: 'text', text: 'TICKET CODE', x: 30, y: 235, fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' },
      { id: 'el-code-val', type: 'text', text: '{ticket_id}', x: 30, y: 250, fontSize: 13, fontWeight: '900', color: '#FFDD00', fontFamily: 'monospace' },
      
      // Pass Holder Name
      { id: 'el-name-lbl', type: 'text', text: 'PASS HOLDER', x: 30, y: 295, fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' },
      { id: 'el-name-val', type: 'text', text: '{first_name} {last_name}', x: 30, y: 310, fontSize: 24, fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit' },
      
      // Location Address
      { id: 'el-location-lbl', type: 'text', text: 'LOCATION ADDRESS', x: 30, y: 365, fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' },
      { id: 'el-location-val', type: 'text', text: '{branch}, Oxford Int. School', x: 30, y: 380, fontSize: 15, fontWeight: '800', color: '#ffffff', fontFamily: 'Outfit' },
      
      // Reserved Seat Box
      { id: 'el-seat-box', type: 'rect', x: 30, y: 440, width: 420, height: 110, bgColor: 'rgba(234, 88, 12, 0.22)', borderColor: '#ea580c', borderWidth: 2, borderRadius: 16, opacity: 100 },
      { id: 'el-seat-lbl', type: 'text', text: '💺 RESERVED SEAT', x: 50, y: 458, fontSize: 11, fontWeight: '800', color: '#fb923c', fontFamily: 'Outfit' },
      { id: 'el-seat-val', type: 'text', text: '{seat}', x: 50, y: 486, fontSize: 24, fontWeight: '900', color: '#FFDD00', fontFamily: 'Outfit' },
      
      { id: 'el-footer-note', type: 'text', text: 'Present this official digital card pass at entry gate', x: 90, y: 640, fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.4)', fontFamily: 'Outfit' }
    ]
  };

  const generateTicketImage = async (reg) => {
    if (typeof window === 'undefined' || !reg) return;

    let design = DEFAULT_TICKET_PRESET;
    try {
      const slugKey = reg.movie_title ? reg.movie_title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'movie-day';
      const templateKey = `ticket_template_${slugKey}`;
      
      // Try local storage first
      try {
        const local = localStorage.getItem(`gch_${templateKey}`);
        if (local) {
          const parsed = JSON.parse(local);
          if (parsed?.elements) design = parsed;
        }
      } catch (e) {}

      const { data } = await supabase.from('page_sections').select('data').eq('type', templateKey).maybeSingle();
      if (data?.data?.elements) {
        design = data.data;
      }
    } catch (e) {
      console.log('Using fallback preset for ticket generation');
    }

    const width = design.width || 480;
    const height = design.height || 680;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Filter out legacy QR / phone / level elements to enforce new requirement
    const cleanElements = (design.elements || []).filter(el => {
      if (el.type === 'qr') return false;
      if (el.id === 'el-qr-box' || el.id === 'el-qr') return false;
      if (el.id === 'el-phone-lbl' || el.id === 'el-phone-val') return false;
      if (el.id === 'el-level-lbl' || el.id === 'el-level-val') return false;
      return true;
    });

    // Ensure movie title box is present if missing from older saved template
    const hasMovieVal = cleanElements.some(el => el.id === 'el-movie-val' || (el.text && el.text.includes('{movie}')));
    if (!hasMovieVal) {
      cleanElements.push(
        { id: 'el-movie-box', type: 'rect', x: 30, y: 105, width: 420, height: 115, bgColor: 'rgba(234, 88, 12, 0.18)', borderColor: 'rgba(234, 88, 12, 0.4)', borderWidth: 2, borderRadius: 16, opacity: 100 },
        { id: 'el-movie-lbl', type: 'text', text: '🎬 MOVIE TITLE', x: 50, y: 122, fontSize: 11, fontWeight: '800', color: '#fb923c', fontFamily: 'Outfit' },
        { id: 'el-movie-val', type: 'text', text: '{movie}', x: 50, y: 148, fontSize: 24, fontWeight: '900', color: '#FFDD00', fontFamily: 'Outfit' }
      );
    }

    const renderAllElements = (bgImg = null) => {
      ctx.clearRect(0, 0, width, height);

      // 1. Draw movie picture background if loaded, else fallback gradient
      if (bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
        ctx.drawImage(bgImg, 0, 0, width, height);
      } else {
        const grad = ctx.createLinearGradient(0, 0, width, height);
        grad.addColorStop(0, '#1c1917');
        grad.addColorStop(0.5, '#292524');
        grad.addColorStop(1, '#0c0a09');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Dark overlay for text contrast and readability
      ctx.save();
      ctx.fillStyle = 'rgba(12, 10, 8, 0.84)';
      ctx.fillRect(0, 0, width, height);

      // 3. Border glow / accent
      ctx.strokeStyle = 'rgba(234, 88, 12, 0.4)';
      ctx.lineWidth = 4;
      ctx.strokeRect(0, 0, width, height);
      ctx.restore();

      cleanElements.forEach(el => {
        const op = el.opacity !== undefined ? el.opacity / 100 : 1;
        ctx.globalAlpha = op;

        if (el.type === 'text') {
          const rawText = el.text || '';
          const rawPhone = reg.phone || '';
          const formattedPhone = rawPhone.startsWith('+998') ? rawPhone : (rawPhone ? `+998 ${rawPhone}` : '');
          const rawTicketId = reg.ticket_id || '';
          const formattedTicketId = rawTicketId.includes('::') ? rawTicketId.split('::')[0] : rawTicketId;
          const movieTitleText = reg.movie_title || event?.title || 'Movie Day 2026';

          const text = rawText
            .replace(/{first_name}/g, reg.first_name || '')
            .replace(/{last_name}/g, reg.last_name || '')
            .replace(/{movie}/g, movieTitleText)
            .replace(/{seat}/g, formatSeat(reg.seat) || '')
            .replace(/{ticket_id}/g, formattedTicketId)
            .replace(/{phone}/g, formattedPhone)
            .replace(/{branch}/g, reg.branch || '')
            .replace(/{level}/g, reg.english_level || '');

          ctx.save();
          const fFamily = el.fontFamily || 'Outfit';
          ctx.font = `${el.fontWeight || '700'} ${el.fontSize || 14}px ${fFamily}, sans-serif`;
          ctx.fillStyle = el.color || '#ffffff';
          ctx.textBaseline = 'top';

          if (el.rotate) {
            ctx.translate(el.x, el.y);
            ctx.rotate((el.rotate * Math.PI) / 180);
            ctx.fillText(text, 0, 0);
          } else {
            ctx.fillText(text, el.x, el.y);
          }
          ctx.restore();
        } else if (el.type === 'rect' || el.type === 'circ') {
          ctx.save();
          const w = el.width || 80;
          const h = el.height || 40;
          const r = el.borderRadius || 0;
          ctx.fillStyle = el.bgColor || 'transparent';
          ctx.strokeStyle = el.borderColor || '#FFDD00';
          ctx.lineWidth = el.borderWidth ?? 2;
          if (el.type === 'circ') {
            ctx.beginPath();
            ctx.ellipse(el.x + w / 2, el.y + h / 2, w / 2, h / 2, 0, 0, 2 * Math.PI);
            if (el.bgColor && el.bgColor !== 'transparent') ctx.fill();
            if (el.borderWidth > 0) ctx.stroke();
          } else {
            ctx.beginPath();
            if (r > 0 && ctx.roundRect) {
              ctx.roundRect(el.x, el.y, w, h, r);
            } else {
              ctx.rect(el.x, el.y, w, h);
            }
            if (el.bgColor && el.bgColor !== 'transparent') ctx.fill();
            if (el.borderWidth > 0) ctx.stroke();
          }
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      });
    };

    const triggerBlobDownload = () => {
      const safeTicketId = String(reg.ticket_id || 'ticket').replace(/[^a-zA-Z0-9-]/g, '-');
      const filename = `MovieDay-Ticket-${safeTicketId}.png`;

      try {
        canvas.toBlob((blob) => {
          if (blob) {
            const blobUrl = URL.createObjectURL(blob);
            setTicketUrl(blobUrl);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
              document.body.removeChild(a);
              // Do not revoke immediately as the user might click download again
            }, 2000);
          } else {
            const dataUrl = canvas.toDataURL('image/png');
            setTicketUrl(dataUrl);
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }, 'image/png');
      } catch (e) {
        console.warn('Canvas export failed:', e);
      }
    };

    const bgUrl = event?.image_url || reg?.movie_image || design.bgImage || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80';
    const bgImg = new Image();
    bgImg.crossOrigin = 'anonymous';

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      renderAllElements(bgImg);
      triggerBlobDownload();
    };

    bgImg.onload = finish;
    bgImg.onerror = finish;
    bgImg.src = bgUrl;

    setTimeout(finish, 1200);
  };

  const LEVELS = [
    { val: 'Beginner', badge: 'A1', color: '#10b981' },
    { val: 'Elementary', badge: 'A2', color: '#34d399' },
    { val: 'Pre-Intermediate', badge: 'B1', color: '#3b82f6' },
    { val: 'Intermediate', badge: 'B2', color: '#6366f1' },
    { val: 'Upper-Intermediate', badge: 'C1', color: '#8b5cf6' },
    { val: 'Advanced', badge: 'C2', color: '#FFDD00' },
  ];

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <>
      <Navbar />
      <style>{`
        .reg-body { min-height: 100vh; background: #0a0a0a; color: #fff; font-family: 'Outfit', 'Inter', sans-serif; padding-top: 72px; position: relative; overflow-x: hidden; }
        .reg-bg { position: fixed; inset: 0; z-index: 0; }
        .reg-bg img { width: 100%; height: 100%; object-fit: cover; opacity: 0.8; }
        .reg-bg-overlay { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.6) 100%); }
        .reg-content { position: relative; z-index: 1; }

        /* Hero */
        .reg-hero { padding: 48px 24px 32px; text-align: center; }
        .reg-badge { display: inline-flex; align-items: center; gap: 7px; padding: 6px 16px; border-radius: 99px; background: rgba(255, 221, 0,0.12); border: 1px solid rgba(255, 221, 0,0.3); color: #FFDD00; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 16px; }
        .reg-hero h1 { font-size: clamp(2rem, 5vw, 3.5rem); font-weight: 900; margin-bottom: 12px; letter-spacing: -0.02em; }
        .reg-hero h1 span { background: linear-gradient(135deg, #ea580c, #fb923c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .reg-hero-sub { color: rgba(255,255,255,0.6); font-size: 15px; line-height: 1.7; max-width: 520px; margin: 0 auto 24px; }
        .reg-meta { display: flex; justify-content: center; gap: 24px; flex-wrap: wrap; }
        .reg-meta-item { display: flex; align-items: center; gap: 7px; font-size: 13px; color: rgba(255,255,255,0.55); font-weight: 500; }

        /* Steps indicator */
        .reg-steps { display: flex; align-items: center; justify-content: center; gap: 0; max-width: 480px; margin: 0 auto 32px; padding: 0 24px; }
        .reg-step { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .reg-step-circle { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; transition: all 0.3s ease; background: rgba(255,255,255,0.07); border: 2px solid rgba(255,255,255,0.15); color: rgba(255,255,255,0.4); }
        .reg-step.active .reg-step-circle { background: linear-gradient(135deg, #ea580c, #fb923c); border-color: transparent; color: #fff; box-shadow: 0 0 20px rgba(234,88,12,0.4); }
        .reg-step.done .reg-step-circle { background: rgba(16,185,129,0.15); border-color: #10b981; color: #10b981; }
        .reg-step-label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.35); text-align: center; transition: color 0.3s; }
        .reg-step.active .reg-step-label { color: #fb923c; }
        .reg-step.done .reg-step-label { color: #10b981; }
        .reg-step-line { flex: 1; height: 2px; background: rgba(255,255,255,0.1); margin: 0 8px; margin-bottom: 18px; transition: background 0.3s; }
        .reg-step-line.done { background: #10b981; }

        /* Card */
        .reg-card { max-width: 640px; margin: 0 auto 32px; background: rgba(20, 20, 26, 0.45) !important; border: 1px solid rgba(255, 255, 255, 0.16) !important; border-radius: 24px; padding: 36px 32px; backdrop-filter: blur(28px) saturate(180%) !important; -webkit-backdrop-filter: blur(28px) saturate(180%) !important; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.25) !important; animation: fadeInUp 0.4s ease; }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .reg-card-header h2 { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; margin-bottom: 6px; color: #ffffff !important; }
        .reg-card-header p { font-size: 13px; color: rgba(255,255,255,0.7) !important; margin-bottom: 24px; }

        /* Form */
        .reg-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .reg-form-full { grid-column: span 2; }
        .reg-form-group { display: flex; flex-direction: column; gap: 6px; }
        .reg-label { font-size: 14px; font-weight: 700; color: #ffffff !important; letter-spacing: 0.01em; }
        .reg-req { color: #fb923c; margin-left: 2px; }
        .reg-input { background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.14) !important; border-radius: 14px; padding: 12px 16px; color: #ffffff !important; font-size: 14px; font-family: inherit; outline: none; backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.2) !important; transition: all 0.2s ease; }
        .reg-input:focus { background: rgba(255, 255, 255, 0.09) !important; border-color: rgba(251, 146, 60, 0.7) !important; box-shadow: 0 0 25px rgba(234, 88, 12, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.15) !important; }
        .reg-input::placeholder { color: rgba(255,255,255,0.45) !important; }
        .reg-input.err { border-color: rgba(239,68,68,0.8) !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.2) !important; }
        .reg-err { font-size: 12px; color: #f87171; display: flex; align-items: center; gap: 5px; margin-top: 4px; font-weight: 500; }
        .reg-phone-wrap { display: flex; align-items: stretch; background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.14) !important; border-radius: 14px; backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.2) !important; transition: all 0.2s ease; }
        .reg-phone-wrap:focus-within { background: rgba(255, 255, 255, 0.09) !important; border-color: rgba(251, 146, 60, 0.7) !important; box-shadow: 0 0 25px rgba(234, 88, 12, 0.3), inset 0 1px 2px rgba(255, 255, 255, 0.15) !important; }
        .reg-phone-wrap.err { border-color: rgba(239,68,68,0.8) !important; box-shadow: 0 0 0 3px rgba(239,68,68,0.2) !important; }
        .reg-phone-prefix { padding: 12px 14px; font-size: 14px; font-weight: 700; color: #ffffff !important; border-right: 1px solid rgba(255,255,255,0.14) !important; }
        .reg-phone-wrap .reg-input { border: none !important; box-shadow: none !important; background: transparent !important; flex: 1; border-radius: 0 14px 14px 0; }

        /* Custom select */
        .reg-cs { position: relative; }
        .reg-cs-trigger { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255, 255, 255, 0.05) !important; border: 1px solid rgba(255, 255, 255, 0.14) !important; border-radius: 14px; backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.08), 0 4px 16px rgba(0, 0, 0, 0.2) !important; cursor: pointer; transition: all 0.2s ease; user-select: none; }
        .reg-cs-trigger:hover { background: rgba(255, 255, 255, 0.09) !important; border-color: rgba(255, 255, 255, 0.3) !important; }
        .reg-cs-trigger.open { border-color: rgba(251, 146, 60, 0.7) !important; box-shadow: 0 0 25px rgba(234, 88, 12, 0.3) !important; }
        .reg-cs-trigger.err { border-color: rgba(239,68,68,0.8) !important; }
        .reg-cs-val { font-size: 14px; color: rgba(255,255,255,0.45) !important; }
        .reg-cs-val.filled { color: #ffffff !important; }
        .reg-cs-arrow { transition: transform 0.2s; color: rgba(255,255,255,0.6) !important; }
        .reg-cs-arrow.open { transform: rotate(180deg); }
        .reg-cs-dropdown { position: absolute; top: calc(100% + 6px); left: 0; right: 0; background: rgba(22, 22, 28, 0.85) !important; border: 1px solid rgba(255,255,255,0.18) !important; border-radius: 16px; overflow: hidden; z-index: 50; backdrop-filter: blur(24px) !important; -webkit-backdrop-filter: blur(24px) !important; box-shadow: 0 20px 50px rgba(0,0,0,0.6); animation: fadeInDown 0.15s ease; }
        @keyframes fadeInDown { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }
        .reg-cs-option { display: flex; align-items: center; gap: 10px; padding: 12px 16px; cursor: pointer; font-size: 14px; transition: background 0.15s; color: #ffffff !important; }
        .reg-cs-option:hover { background: rgba(255,255,255,0.12) !important; }
        .reg-cs-option.selected { background: rgba(234,88,12,0.25) !important; }
        .reg-badge-pill { padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; }

        /* Branch cards */
        .reg-branch-grid { display: flex; gap: 12px; }
        .reg-branch-card { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 16px 8px; background: rgba(255, 255, 255, 0.04) !important; border: 1px solid rgba(255, 255, 255, 0.14) !important; border-radius: 16px; backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 4px 16px rgba(0, 0, 0, 0.2) !important; cursor: pointer; transition: all 0.25s ease; min-height: 90px; }
        .reg-branch-card:hover { border-color: rgba(251, 146, 60, 0.6) !important; background: rgba(234, 88, 12, 0.12) !important; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(234, 88, 12, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2) !important; }
        .reg-branch-card.selected { border-color: #ea580c !important; background: linear-gradient(135deg, rgba(234, 88, 12, 0.25), rgba(251, 146, 60, 0.12)) !important; box-shadow: 0 0 25px rgba(234, 88, 12, 0.35), inset 0 1px 1px rgba(255, 255, 255, 0.3) !important; }
        .reg-branch-logo { width: 52px; height: 32px; object-fit: contain; }
        .reg-branch-name { font-size: 12px; font-weight: 800; color: #ffffff !important; text-align: center; }

        /* Seat map */
        .reg-seat-wrap { max-width: 1050px; margin: 0 auto 32px; background: rgba(20, 20, 26, 0.45) !important; border: 1px solid rgba(255,255,255,0.16) !important; border-radius: 24px; padding: 24px; backdrop-filter: blur(28px) saturate(180%) !important; -webkit-backdrop-filter: blur(28px) saturate(180%) !important; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.25) !important; width: 100%; box-sizing: border-box; }
        .reg-seat-legend { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 16px; justify-content: center; }
        .reg-legend-item { display: flex; align-items: center; gap: 7px; font-size: 12px; color: rgba(255,255,255,0.7); }
        .reg-legend-dot { width: 14px; height: 14px; border-radius: 4px; }
        .reg-legend-regular { background: rgba(16,185,129,0.3); border: 1px solid #10b981; }
        .reg-legend-vip { background: rgba(139,92,246,0.3); border: 1px solid #8b5cf6; }
        .reg-legend-selected { background: linear-gradient(135deg,#ea580c,#fb923c); }
        .reg-legend-taken { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); }
        .reg-zoom-panel { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; justify-content: center; }
        .reg-zoom-btn { width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 18px; transition: all 0.2s; backdrop-filter: blur(12px); }
        .reg-zoom-btn:hover { border-color: rgba(251,146,60,0.6); background: rgba(234,88,12,0.15); }
        .reg-zoom-label { font-size: 12px; color: rgba(255,255,255,0.6); font-weight: 700; min-width: 44px; text-align: center; }
        .reg-fit-btn { padding: 6px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.7); font-size: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; font-family: inherit; backdrop-filter: blur(12px); }
        .reg-fit-btn.active { border-color: rgba(251,146,60,0.6); background: rgba(234,88,12,0.15); color: #fb923c; }
        .reg-screen-wrap { text-align: center; margin-bottom: 16px; }
        .reg-screen { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03)); border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 8px 32px; font-size: 12px; font-weight: 800; letter-spacing: 0.15em; color: rgba(255,255,255,0.6); backdrop-filter: blur(12px); }
        .reg-seat-scroll { overflow-x: auto; overflow-y: hidden; border-radius: 12px; background: rgba(0,0,0,0.35); text-align: center; width: 100%; display: flex; justify-content: center; padding: 12px 0; border: 1px solid rgba(255,255,255,0.08); }
        .reg-seat-inner { transform-origin: top left; display: inline-block; padding: 12px 8px; }
        .block-row { display: flex; gap: 8px; margin-bottom: 10px; justify-content: center; }
        .block-group { display: flex; gap: 6px; }
        .seat-block { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 10px; padding: 6px; }
        .seat-block.vip { background: rgba(139,92,246,0.05); border-color: rgba(139,92,246,0.2); }
        .block-title { font-size: 8.5px; font-weight: 800; color: rgba(255,255,255,0.4); letter-spacing: 0.08em; text-align: center; margin-bottom: 5px; }
        .seat-block.vip .block-title { color: rgba(139,92,246,0.7); }
        .block-rows-container { display: flex; flex-direction: column; gap: 3px; }
        .block-row-item { display: flex; gap: 3px; }
        .seat { width: 22px; height: 22px; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 8.5px; font-weight: 800; cursor: pointer; transition: all 0.15s; user-select: none; }
        .seat.regular { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.4); color: #10b981; }
        .seat.regular:hover { background: rgba(16,185,129,0.3); transform: scale(1.12); box-shadow: 0 0 8px rgba(16,185,129,0.4); }
        .seat.vip { background: rgba(139,92,246,0.15); border: 1px solid rgba(139,92,246,0.4); color: #a78bfa; }
        .seat.vip:hover { background: rgba(139,92,246,0.3); transform: scale(1.12); box-shadow: 0 0 8px rgba(139,92,246,0.4); }
        .seat.selected { background: linear-gradient(135deg,#ea580c,#fb923c) !important; border-color: transparent !important; color: #fff !important; transform: scale(1.15); box-shadow: 0 0 12px rgba(234,88,12,0.6); cursor: default; }
        .seat.taken { background: rgba(255,255,255,0.05) !important; border: 1px solid rgba(255,255,255,0.1) !important; color: rgba(255,255,255,0.2) !important; cursor: not-allowed !important; transform: none !important; }
        .reg-entrance { text-align: center; margin-top: 12px; font-size: 11px; font-weight: 800; letter-spacing: 0.2em; color: rgba(255,255,255,0.4); }
        .reg-selected-info { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: rgba(234,88,12,0.15); border: 1px solid rgba(234,88,12,0.4); border-radius: 10px; margin-top: 12px; font-size: 13px; font-weight: 700; color: #fb923c; backdrop-filter: blur(12px); }

        /* Buttons */
        .reg-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 24px; border-radius: 14px; background: linear-gradient(135deg,#ea580c,#fb923c); color: #fff; font-size: 14px; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; width: 100%; box-shadow: 0 8px 24px rgba(234,88,12,0.35); }
        .reg-btn-primary:hover { opacity: 0.95; transform: translateY(-2px); box-shadow: 0 12px 30px rgba(234,88,12,0.5); }
        .reg-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        .reg-btn-secondary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 13px 20px; border-radius: 14px; background: rgba(255, 255, 255, 0.06) !important; border: 1px solid rgba(255, 255, 255, 0.16) !important; color: #ffffff !important; font-size: 14px; font-weight: 700; cursor: pointer; backdrop-filter: blur(16px) !important; -webkit-backdrop-filter: blur(16px) !important; box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.15), 0 4px 16px rgba(0, 0, 0, 0.2) !important; transition: all 0.2s ease; font-family: inherit; }
        .reg-btn-secondary:hover { background: rgba(255, 255, 255, 0.14) !important; border-color: rgba(255, 255, 255, 0.35) !important; transform: translateY(-1px); }
        .reg-actions { display: flex; gap: 12px; margin-top: 24px; align-items: center; justify-content: center; }
        .reg-actions .reg-btn-primary { padding: 14px 48px; width: auto; }
        .reg-actions .reg-btn-secondary { flex-shrink: 0; }

        /* Ticket stub */
        .reg-stub { background: linear-gradient(135deg,rgba(234,88,12,0.15),rgba(251,146,60,0.08)); border: 1px solid rgba(234,88,12,0.3); border-radius: 20px; overflow: hidden; backdrop-filter: blur(20px); }
        .reg-stub-head { padding: 20px 24px; background: linear-gradient(135deg,rgba(234,88,12,0.25),rgba(139,92,246,0.18)); display: flex; justify-content: space-between; align-items: center; }
        .reg-stub-event { font-size: 18px; font-weight: 900; letter-spacing: 0.03em; }
        .reg-stub-sub { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.6); letter-spacing: 0.15em; margin-top: 2px; }
        .reg-stub-logo { width: 52px; height: 36px; object-fit: contain; }
        .reg-stub-divider { height: 1px; background: repeating-linear-gradient(90deg,rgba(255,255,255,0.18) 0,rgba(255,255,255,0.18) 8px,transparent 8px,transparent 16px); }
        .reg-stub-body { padding: 20px 24px; }
        .reg-stub-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px; }
        .reg-stub-item { display: flex; flex-direction: column; gap: 3px; }
        .reg-stub-lbl { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.5); letter-spacing: 0.1em; text-transform: uppercase; }
        .reg-stub-val { font-size: 14px; font-weight: 700; color: #ffffff; }
        .reg-stub-seat { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: rgba(255,255,255,0.06); border-radius: 12px; border: 1px solid rgba(255,255,255,0.12); backdrop-filter: blur(12px); }
        .reg-stub-seat-label { font-size: 10px; font-weight: 800; color: rgba(255,255,255,0.5); letter-spacing: 0.1em; }
        .reg-stub-seat-val { font-size: 20px; font-weight: 900; color: #fb923c; }

        /* Terms */
        .reg-terms-row { display: flex; align-items: flex-start; gap: 10px; margin-top: 16px; }
        .reg-terms-row input { margin-top: 2px; accent-color: #ea580c; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }
        .reg-terms-row label { font-size: 13px; color: rgba(255,255,255,0.75); cursor: pointer; }

        /* Success */
        .reg-success { text-align: center; padding: 48px 24px; }
        .reg-success-icon { width: 80px; height: 80px; margin: 0 auto 24px; background: rgba(16,185,129,0.15); border: 2px solid #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #10b981; box-shadow: 0 0 30px rgba(16,185,129,0.3); }
        .reg-success h2 { font-size: 28px; font-weight: 900; margin-bottom: 10px; color: #ffffff; }
        .reg-success p { color: rgba(255,255,255,0.75); font-size: 15px; margin-bottom: 24px; }
        .reg-success-ticket { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.14); border-radius: 16px; padding: 20px; font-size: 14px; line-height: 1.8; margin-bottom: 24px; backdrop-filter: blur(16px); }

        /* Lang modal */
        .reg-lang-overlay { position: fixed; inset: 0; z-index: 2000; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; padding: 24px; }
        .reg-lang-box { background: rgba(20, 20, 26, 0.55) !important; border: 1px solid rgba(255,255,255,0.2) !important; border-radius: 28px; padding: 40px 32px; max-width: 420px; width: 100%; text-align: center; color: #ffffff !important; backdrop-filter: blur(32px) saturate(180%) !important; -webkit-backdrop-filter: blur(32px) saturate(180%) !important; box-shadow: 0 30px 90px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.25) !important; }
        .reg-lang-icon { font-size: 48px; margin-bottom: 16px; }
        .reg-lang-box h2 { font-size: 24px; font-weight: 900; margin-bottom: 8px; color: #ffffff !important; }
        .reg-lang-box p { color: rgba(255,255,255,0.7) !important; font-size: 14px; margin-bottom: 28px; }
        .reg-lang-options { display: flex; flex-direction: column; gap: 12px; }
        .reg-lang-option { display: flex; align-items: center; gap: 14px; padding: 16px 20px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); cursor: pointer; transition: all 0.2s; color: #ffffff !important; text-align: left; width: 100%; box-sizing: border-box; }
        .reg-lang-option:hover { border-color: #FFDD00 !important; background: rgba(255, 221, 0, 0.15) !important; transform: translateY(-2px); }
        .reg-lang-code { width: 44px; height: 44px; border-radius: 50%; background: rgba(255, 221, 0, 0.15); border: 1.5px solid #FFDD00; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 900; flex-shrink: 0; color: #FFDD00 !important; }
        .reg-lang-name { font-weight: 800; font-size: 16px; text-align: left; color: #ffffff !important; margin-bottom: 2px; }
        .reg-lang-native { font-size: 13px; color: rgba(255,255,255,0.75) !important; text-align: left; }
        .reg-lang-switcher { position: fixed; top: 84px; right: 20px; z-index: 99; display: flex; gap: 4px; background: rgba(0,0,0,0.4); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 99px; padding: 4px; }
        .reg-lang-btn { padding: 5px 13px; border-radius: 99px; border: none; background: none; color: rgba(255,255,255,0.4); font-size: 12px; font-weight: 800; cursor: pointer; transition: all 0.18s; font-family: inherit; }
        .reg-lang-btn.active { background: linear-gradient(135deg,#ea580c,#fb923c); color: #fff; }

        /* Toast */
        .reg-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); padding: 12px 20px; border-radius: 14px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 10px; z-index: 9999; box-shadow: 0 8px 32px rgba(0,0,0,0.3); backdrop-filter: blur(16px); white-space: nowrap; animation: slideUp 0.3s ease; }
        @keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .reg-toast.success { background: rgba(16,185,129,0.15); border: 1px solid rgba(16,185,129,0.3); color: #34d399; }
        .reg-toast.error { background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.3); color: #f87171; }
        .reg-toast.info { background: rgba(59,130,246,0.15); border: 1px solid rgba(59,130,246,0.3); color: #93c5fd; }
        .reg-footer { text-align: center; padding: 32px; color: rgba(255,255,255,0.2); font-size: 13px; }

        @media (max-width: 640px) {
          .reg-form-grid { grid-template-columns: 1fr; }
          .reg-form-full { grid-column: span 1; }
          .reg-card { padding: 20px 16px; }
          .reg-branch-grid { flex-wrap: wrap; }
          .reg-stub-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="reg-body">
        {/* Background */}
        <div className="reg-bg">
          <Image src={event?.bgImage || event?.bg_image || event?.image || '/reg-bg.png'} alt="Background" fill style={{ objectFit: 'cover', opacity: 0.8 }} priority />
          <div className="reg-bg-overlay" />
        </div>

        <div className="reg-content">
          {/* Language modal for direct Telegram links */}
          {showLangModal && (
            <div className="reg-lang-overlay">
              <div className="reg-lang-box">
                <div className="reg-lang-icon">🎬</div>
                <h2>{event ? event.title : 'Movie Day 2026'}</h2>
                <p>Please choose your preferred language to continue</p>
                <div className="reg-lang-options">
                  {[{ code: 'en', name: 'English', native: 'Continue in English' },
                    { code: 'ru', name: 'Русский', native: 'Продолжить на русском' },
                    { code: 'uz', name: "O'zbekcha", native: "O'zbek tilida davom etish" }].map(l => (
                    <button key={l.code} className="reg-lang-option" onClick={() => { changeLang(l.code); setShowLangModal(false); }}>
                      <div className="reg-lang-code">{l.code.toUpperCase()}</div>
                      <div><div className="reg-lang-name">{l.name}</div><div className="reg-lang-native">{l.native}</div></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hero */}
          <div className="reg-hero">
            <div className="reg-badge">
              🎬 {event?.category ? `${event.category.toUpperCase()} EVENT` : 'MOVIE EVENT'}
            </div>
            <h1>{event ? event.title : <>Movie Day <span>2026</span></>}</h1>
            <p className="reg-hero-sub" dangerouslySetInnerHTML={{ __html: event ? event.description : t.hero_sub }} />
            <div className="reg-meta">
              <div className="reg-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {formatEventDate(event?.date)}
              </div>
              <div className="reg-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
                Grand Conference Hall
              </div>
              <div className="reg-meta-item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="9" y1="9" x2="9" y2="15"/><line x1="15" y1="9" x2="15" y2="15"/></svg>
                {preselectedSeats.length > 0 ? `Selected ${preselectedSeats.length} Seats` : 'Limited Seats'}
              </div>
            </div>
          </div>

          {/* Step indicators */}
          {!submitted && (
            <div className="reg-steps">
              {[1,2,3].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`reg-step${step===s?' active':step>s?' done':''}`}>
                    <div className="reg-step-circle">
                      {step > s ? '✓' : s === 1 ? '👤' : s === 2 ? '🎟' : '✓'}
                    </div>
                    <div className="reg-step-label">{s===1?t.step_info:s===2?t.step_seat:t.step_confirm}</div>
                  </div>
                  {i < 2 && <div className={`reg-step-line${step > s+1 ? ' done' : ''}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* ─── STEP 1 ─── */}
          {!submitted && step === 1 && (
            <div className="reg-card" style={{ maxWidth: 640, margin: '0 auto 32px' }}>
              <div className="reg-card-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Personal Information
                </h2>
                <p>Fill in your details to get started</p>
              </div>
              <div className="reg-form-grid">
                {/* First Name */}
                <div className="reg-form-group">
                  <label className="reg-label">{t.first_name} <span className="reg-req">*</span></label>
                  <input className={`reg-input${errors.firstName?' err':''}`} placeholder={t.ph_first_name}
                    value={form.firstName} onChange={e => { setForm(p=>({...p,firstName:e.target.value})); if(errors.firstName) setErrors(p=>({...p,firstName:''})); }} />
                  {errors.firstName && <div className="reg-err"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.firstName}</div>}
                </div>
                {/* Last Name */}
                <div className="reg-form-group">
                  <label className="reg-label">{t.last_name} <span className="reg-req">*</span></label>
                  <input className={`reg-input${errors.lastName?' err':''}`} placeholder={t.ph_last_name}
                    value={form.lastName} onChange={e => { setForm(p=>({...p,lastName:e.target.value})); if(errors.lastName) setErrors(p=>({...p,lastName:''})); }} />
                  {errors.lastName && <div className="reg-err"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.lastName}</div>}
                </div>
                {/* Phone */}
                <div className="reg-form-group">
                  <label className="reg-label">{t.phone} <span className="reg-req">*</span></label>
                  <div className={`reg-phone-wrap${errors.phone?' err':''}`}>
                    <div className="reg-phone-prefix">+998</div>
                    <input className="reg-input" placeholder="99 111 11 22"
                      value={form.phone} onChange={e => { const v=formatPhone(e.target.value); setForm(p=>({...p,phone:v})); if(errors.phone) setErrors(p=>({...p,phone:''})); }} />
                  </div>
                  {errors.phone && <div className="reg-err"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.phone}</div>}
                </div>
                {/* English Level */}
                {isMovieEvent && (
                  <div className="reg-form-group">
                    <label className="reg-label">{t.eng_level} <span className="reg-req">*</span></label>
                    <div className="reg-cs" onClick={() => setLevelOpen(v=>!v)}>
                      <div className={`reg-cs-trigger${levelOpen?' open':''}${errors.englishLevel?' err':''}`}>
                        <span className={`reg-cs-val${form.englishLevel?' filled':''}`}>{form.englishLevel || t.select_level}</span>
                        <svg className={`reg-cs-arrow${levelOpen?' open':''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                      {levelOpen && (
                        <div className="reg-cs-dropdown">
                          {LEVELS.map(l => (
                            <div key={l.val} className={`reg-cs-option${form.englishLevel===l.val?' selected':''}`}
                              onClick={e => { e.stopPropagation(); setForm(p=>({...p,englishLevel:l.val})); setLevelOpen(false); setErrors(p=>({...p,englishLevel:''})); }}>
                              <span className="reg-badge-pill" style={{background:`${l.color}20`,color:l.color,border:`1px solid ${l.color}40`}}>{l.badge}</span>
                              {l.val}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.englishLevel && <div className="reg-err"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.englishLevel}</div>}
                  </div>
                )}
                {/* Branch */}
                {isMovieEvent && (
                  <div className="reg-form-group reg-form-full">
                    <label className="reg-label">{t.branch} <span className="reg-req">*</span></label>
                    <div className="reg-branch-grid">
                      {[
                        { val: 'Fast Education', logo: '/logo-fast.png', name: 'Fast Education' },
                        { val: 'Oxford International School', logo: '/logo-ois.png', name: 'Oxford Int\'l' },
                        { val: 'Other', name: 'Other' },
                      ].map(b => (
                        <div key={b.val} className={`reg-branch-card${form.branch===b.val?' selected':''}`}
                          onClick={() => { setForm(p=>({...p,branch:b.val,otherBranch:''})); setErrors(p=>({...p,branch:''})); }}>
                          {b.logo
                            ? <img src={b.logo} className="reg-branch-logo" alt={b.name} />
                            : <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                          }
                          <div className="reg-branch-name">{b.name}</div>
                        </div>
                      ))}
                    </div>
                    {errors.branch && <div className="reg-err"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.branch}</div>}
                  </div>
                )}
                {isMovieEvent && form.branch === 'Other' && (
                  <div className="reg-form-group reg-form-full">
                    <label className="reg-label">{t.other_branch} <span className="reg-req">*</span></label>
                    <input className={`reg-input${errors.otherBranch?' err':''}`} placeholder={t.ph_other_branch}
                      value={form.otherBranch} onChange={e => { setForm(p=>({...p,otherBranch:e.target.value})); setErrors(p=>({...p,otherBranch:''})); }} />
                    {errors.otherBranch && <div className="reg-err"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> {errors.otherBranch}</div>}
                  </div>
                )}
                <div className="reg-form-full" style={{ display: 'flex', gap: '16px' }}>
                  <button className="reg-btn-secondary" onClick={() => {
                    if (eventId) {
                      router.push(`/events/${eventId}`);
                    } else {
                      router.back();
                    }
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                    Back
                  </button>
                  <button className="reg-btn-primary" style={{ flex: 1 }} onClick={goStep2}>
                    {t.continue_btn}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── STEP 2: SEAT MAP ─── */}
          {!submitted && step === 2 && (
            <div className="reg-seat-wrap">
              <div className="reg-card-header">
                <h2 style={{display:'flex',alignItems:'center',gap:10,fontSize:20,fontWeight:800,marginBottom:6}}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2"><path d="M3 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"/><path d="M10 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9z"/><path d="M17 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9z"/><path d="M2 19h20"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>
                  {t.choose_seat}
                </h2>
                <p style={{fontSize:13,color:'rgba(255,255,255,0.45)',marginBottom:16}}>{t.seat_sub}</p>
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '14px', padding: '8px 16px', background: 'rgba(255,255,255,0.04)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '13px', fontWeight: 800 }}>
                <span style={{ color: '#10b981' }}>🟢 {Math.max(0, TOTAL_SEATS - Array.from(takenSeats).filter(s => SEAT_NUMBERS[s] !== undefined).length)} Available</span>
                <span style={{ color: '#f87171' }}>🔴 {Array.from(takenSeats).filter(s => SEAT_NUMBERS[s] !== undefined).length} Booked</span>
                {selectedSeat && <span style={{ color: '#fb923c' }}>🟡 1 Selected</span>}
              </div>

              <div className="reg-seat-legend">
                <div className="reg-legend-item"><div className="reg-legend-dot reg-legend-regular"/><span>Available (Regular)</span></div>
                <div className="reg-legend-item"><div className="reg-legend-dot reg-legend-vip"/><span>Available (VIP)</span></div>
                <div className="reg-legend-item"><div className="reg-legend-dot reg-legend-selected"/><span>Your Selection</span></div>
                <div className="reg-legend-item"><div className="reg-legend-dot reg-legend-taken"/><span>Taken / Booked</span></div>
              </div>

              {/* Zoom controls */}
              <div className="reg-zoom-panel">
                <button className="reg-zoom-btn" onClick={() => { setIsAutoFit(false); setScale(s => Math.max(0.2, s-0.15)); }}>−</button>
                <span className="reg-zoom-label">{Math.round(scale*100)}%</span>
                <button className="reg-zoom-btn" onClick={() => { setIsAutoFit(false); setScale(s => Math.min(2.0, s+0.15)); }}>+</button>
                <button className={`reg-fit-btn${isAutoFit?' active':''}`} onClick={() => setIsAutoFit(true)}>{t.zoom_fit}</button>
              </div>

              {/* Screen */}
              <div className="reg-screen-wrap">
                <div className="reg-screen">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
                  SCREEN
                </div>
              </div>

              {/* Seat map */}
              <div className="reg-seat-scroll" ref={seatContainerRef}>
                {seatsLoading ? (
                  <div style={{textAlign:'center',padding:'40px',color:'rgba(255,255,255,0.4)'}}>Loading seats…</div>
                ) : (
                  <div style={{
                    width: seatInnerRef.current ? seatInnerRef.current.scrollWidth * scale : 'auto',
                    height: seatInnerRef.current ? seatInnerRef.current.scrollHeight * scale : 'auto',
                    position: 'relative',
                    margin: '0 auto',
                    overflow: 'hidden'
                  }}>
                    <div ref={seatInnerRef} className="reg-seat-inner" style={{transform:`scale(${scale})`,transformOrigin:'top left'}}>
                      {BLOCKS.map((blockRow, ri) => (
                        <div key={ri} className="block-row">
                          {[blockRow.slice(0,2), blockRow.slice(2,4), blockRow.slice(4,6)].map((group, gi) => (
                            <div key={gi} className="block-group">
                              {group.map(block => (
                                <div key={block.id} className={`seat-block${block.vip?' vip':''}`}>
                                  <div className="block-title">{block.name}</div>
                                  <div className="block-rows-container">
                                    {Array.from({length:block.rows},(_,r)=>(
                                      <div key={r} className="block-row-item">
                                        {Array.from({length:block.cols},(_,c)=>{
                                          const id=`${block.id}-${r+1}-${c+1}`;
                                          const num=SEAT_NUMBERS[id];
                                          const taken=takenSeats.has(id) || takenSeats.has(`Seat #${num}`) || takenSeats.has(`Seat ${num}`);
                                          const sel=selectedSeat===id;
                                          return (
                                            <div key={id} title={`Seat #${num}${taken?' (Taken)':sel?' (Selected)':' (Available)'}`}
                                              className={`seat${block.vip?' vip':' regular'}${taken?' taken':''}${sel?' selected':''}`}
                                              onClick={()=>{ if(!taken){ setSelectedSeat(id); } }}>
                                              {num}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                      <div className="reg-entrance">── ENTRANCE ──</div>
                    </div>
                  </div>
                )}
              </div>

              {selectedSeat && (
                <div className="reg-selected-info">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  Selected: <strong>{formatSeat(selectedSeat)}</strong>
                </div>
              )}

              <div className="reg-actions">
                <button className="reg-btn-secondary" onClick={() => setStep(1)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Back
                </button>
                <button className="reg-btn-primary" disabled={!selectedSeat} onClick={goStep3}>
                  {t.confirm_seat}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* ─── STEP 3: REVIEW ─── */}
          {!submitted && step === 3 && (
            <div className="reg-card" style={{ maxWidth: 640, margin: '0 auto 32px' }}>
              <div className="reg-card-header">
                <h2>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  {t.review_title}
                </h2>
                <p>{t.review_sub}</p>
              </div>

              {/* Ticket stub */}
              <div className="reg-stub">
                <div className="reg-stub-head">
                  <div>
                    <div className="reg-stub-event">MOVIE DAY 2026</div>
                    <div className="reg-stub-sub">EVENT ENTRY PASS</div>
                  </div>
                  {form.branch.includes('Fast')
                    ? <img src="/logo-fast.png" className="reg-stub-logo" alt="Fast" />
                    : form.branch.includes('Oxford')
                    ? <img src="/logo-ois.png" className="reg-stub-logo" alt="OIS" />
                    : <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  }
                </div>
                <div className="reg-stub-divider"/>
                <div className="reg-stub-body">
                  <div className="reg-stub-grid">
                    <div className="reg-stub-item"><span className="reg-stub-lbl">Phone</span><span className="reg-stub-val">+998 {form.phone}</span></div>
                    <div className="reg-stub-item"><span className="reg-stub-lbl">Branch</span><span className="reg-stub-val">{form.branch==='Other'?form.otherBranch:form.branch}</span></div>
                    <div className="reg-stub-item"><span className="reg-stub-lbl">English Level</span><span className="reg-stub-val">{form.englishLevel}</span></div>
                  </div>
                  <div className="reg-stub-seat">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fb923c" strokeWidth="2"><path d="M3 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9z"/><path d="M10 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9z"/><path d="M17 9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V9z"/><path d="M2 19h20"/><path d="M6 8V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2"/></svg>
                    <div><div className="reg-stub-seat-label">RESERVED SEAT</div><div className="reg-stub-seat-val">{formatSeat(selectedSeat)}</div></div>
                  </div>
                </div>
              </div>

              <div className="reg-terms-row">
                <input type="checkbox" id="termsCheck" checked={termsChecked} onChange={e => setTermsChecked(e.target.checked)} />
                <label htmlFor="termsCheck">{t.terms}</label>
              </div>

              <div className="reg-actions">
                <button className="reg-btn-secondary" onClick={() => setStep(2)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                  Back
                </button>
                <button className="reg-btn-primary" disabled={submitting} onClick={submit}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="9" y1="9" x2="9" y2="15"/><line x1="15" y1="9" x2="15" y2="15"/></svg>
                  {submitting ? 'Submitting…' : t.submit_btn}
                </button>
              </div>
            </div>
          )}

          {/* ─── SUCCESS ─── */}
          {submitted && lastReg && (
            <div className="reg-card" style={{ maxWidth: 560, margin: '0 auto 32px', textAlign:'center' }}>
              <div className="reg-success-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h2 style={{fontSize:28,fontWeight:900,marginBottom:10}}>{t.success_title}</h2>
              <p style={{color:'rgba(255,255,255,0.55)',fontSize:15,marginBottom:24}}>{t.success_sub}</p>
              <div className="reg-success-ticket">
                <strong style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,marginBottom:8,fontSize:'1.1rem',color:'#fb923c'}}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z"/><line x1="9" y1="9" x2="9" y2="15"/><line x1="15" y1="9" x2="15" y2="15"/></svg>
                  {lastReg.ticket_id}
                </strong>
                {lastReg.first_name} {lastReg.last_name} · {lastReg.branch}<br/>
                Seat: {formatSeat(lastReg.seat)} · {lastReg.english_level}
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {ticketUrl ? (
                  <a href={ticketUrl} download={`MovieDay-Ticket-${String(lastReg?.ticket_id || 'ticket').replace(/[^a-zA-Z0-9-]/g, '-')}.png`} className="reg-btn-primary" style={{display:'flex',justifyContent:'center',textDecoration:'none'}}>
                    {t.download_again}
                  </a>
                ) : (
                  <button className="reg-btn-primary" onClick={() => generateTicketImage(lastReg)}>{t.download_again}</button>
                )}
                <button className="reg-btn-secondary" style={{justifyContent:'center'}} onClick={() => { setStep(1); setSubmitted(false); setLastReg(null); setTicketUrl(null); setForm({firstName:'',lastName:'',phone:'',englishLevel:'',branch:'',otherBranch:''}); setSelectedSeat(null); setActivePreselectedSeats([]); setTermsChecked(false); }}>
                  {t.register_another}
                </button>
              </div>
            </div>
          )}

          {/* Hidden QR canvas for canvas ticket generator */}
          <div style={{ display: 'none' }}>
            <QRCodeCanvas
              id="ticket-qr-canvas"
              value={`TicketPass:${lastReg ? lastReg.ticket_id : 'sample-pass'}`}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>

          <div className="reg-footer">Movie Day 2026 • Oxford International School Grand Conference Hall</div>
        </div>
      </div>

      {/* Toast */}
      {toast && <div className={`reg-toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>Loading...</div>}>
      <RegistrationPageContent />
    </Suspense>
  );
}
