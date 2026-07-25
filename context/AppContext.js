'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '@/lib/translations';
import { supabase } from '@/lib/supabase';
import { HALLS_LIST } from '@/lib/data';

const AppContext = createContext();

// Default hall layout — perfectly matching the user's 5x3 drawing grid
export const DEFAULT_BLOCKS = [
  // Front Row (Row 1)
  { id: 'L1', label: 'L1', rows: 2, cols: 3, isVip: false, gridRow: 1, gridCol: 1 },
  { id: 'L2', label: 'L2', rows: 2, cols: 3, isVip: true,  gridRow: 1, gridCol: 2 },
  { id: 'C1', label: 'C1', rows: 2, cols: 5, isVip: true,  gridRow: 1, gridCol: 3 },
  { id: 'C2', label: 'C2', rows: 2, cols: 5, isVip: true,  gridRow: 1, gridCol: 4 },
  { id: 'R1', label: 'R1', rows: 2, cols: 3, isVip: true,  gridRow: 1, gridCol: 5 },
  { id: 'R2', label: 'R2', rows: 2, cols: 3, isVip: false, gridRow: 1, gridCol: 6 },
  
  // Middle Row (Row 2)
  { id: 'L3', label: 'L3', rows: 4, cols: 3, isVip: false, gridRow: 2, gridCol: 1 },
  { id: 'L4', label: 'L4', rows: 4, cols: 3, isVip: false, gridRow: 2, gridCol: 2 },
  { id: 'C3', label: 'C3', rows: 4, cols: 5, isVip: false, gridRow: 2, gridCol: 3 },
  { id: 'C4', label: 'C4', rows: 4, cols: 5, isVip: false, gridRow: 2, gridCol: 4 },
  { id: 'R3', label: 'R3', rows: 4, cols: 3, isVip: false, gridRow: 2, gridCol: 5 },
  { id: 'R4', label: 'R4', rows: 4, cols: 3, isVip: false, gridRow: 2, gridCol: 6 },
  
  // Back Row (Row 3)
  { id: 'L5', label: 'L5', rows: 2, cols: 3, isVip: false, gridRow: 3, gridCol: 1 },
  { id: 'L6', label: 'L6', rows: 2, cols: 3, isVip: false, gridRow: 3, gridCol: 2 },
  { id: 'C5', label: 'C5', rows: 3, cols: 5, isVip: false, gridRow: 3, gridCol: 3 },
  { id: 'C6', label: 'C6', rows: 3, cols: 5, isVip: false, gridRow: 3, gridCol: 4 },
  { id: 'R5', label: 'R5', rows: 2, cols: 3, isVip: false, gridRow: 3, gridCol: 5 },
  { id: 'R6', label: 'R6', rows: 2, cols: 3, isVip: false, gridRow: 3, gridCol: 6 },
];

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [rentRequests, setRentRequests] = useState([]);
  const [features, setFeatures] = useState([]);
  const [cart, setCart] = useState({ eventId: null, seats: [], payerInfo: null });
  const [hallBlocks, setHallBlocksState] = useState(DEFAULT_BLOCKS);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [partners, setPartnersState] = useState([
    { id: 1, name: 'Microsoft', logo: '' }, { id: 2, name: 'Google', logo: '' }, { id: 3, name: 'Amazon', logo: '' },
    { id: 4, name: 'Tesla', logo: '' }, { id: 5, name: 'Apple', logo: '' }, { id: 6, name: 'Netflix', logo: '' },
    { id: 7, name: 'Meta', logo: '' }, { id: 8, name: 'IBM', logo: '' }
  ]);

  const [cmsVideos, setCmsVideosState] = useState([
    { id: 1, title: "Global Tech Summit Highlights", category: "Conference", platform: "youtube", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80", embedUrl: "https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1", videoUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A" },
    { id: 2, title: "Annual Award Gala Night", category: "Ceremony", platform: "youtube", image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80", embedUrl: "https://www.youtube.com/embed/L_LUpnjgPso?autoplay=1", videoUrl: "https://www.youtube.com/watch?v=L_LUpnjgPso" },
    { id: 3, title: "Grand Hall Interior & Setup", category: "Instagram Reel", platform: "instagram", image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80", embedUrl: "https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1", videoUrl: "https://www.instagram.com/" },
    { id: 4, title: "Corporate Strategy Offsite", category: "Corporate", platform: "youtube", image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80", embedUrl: "https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1", videoUrl: "https://www.youtube.com/watch?v=5qap5aO4i9A" }
  ]);

  const [cmsContacts, setCmsContactsState] = useState({
    address: '123 Main Street, Suite 400 Samarkand, 140100, Uzbekistan',
    phone1: '+998 90 123 45 67', phone2: '+998 71 234 56 78',
    email1: 'info@conferencehall.uz', email2: 'events@conferencehall.uz',
    hoursWeek: 'Mon - Sat: 9:00 AM - 6:00 PM', hoursSun: 'Sun: Closed (Except for Events)'
  });

  const [cmsFaq, setCmsFaqState] = useState([
    { id: 1, question: "What is included in the hall rental?", answer: "Our standard rental includes access to the main hall, basic AV equipment (projector and sound system), high-speed Wi-Fi, and standard seating arrangements." },
    { id: 2, question: "Can I bring my own catering service?", answer: "Yes, we allow external catering services, though we also offer premium in-house catering options." },
    { id: 3, question: "Is there parking available for guests?", answer: "Absolutely. We have a secure, underground parking facility that can accommodate up to 300 vehicles." }
  ]);

  const [hallsList, setHallsListState] = useState(HALLS_LIST);

  const [cmsAdvantages, setCmsAdvantagesState] = useState([
    { id: 1, image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80', label: 'Convenient location for everyone' },
    { id: 2, image: 'https://images.unsplash.com/photo-1572025442646-866d16c84a54?w=800&q=80', label: 'State-of-the-art technologies' },
    { id: 3, image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', label: 'Premium event spaces' },
    { id: 4, image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80', label: 'High-level service' },
    { id: 5, image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80', label: 'Spacious and bright halls' },
  ]);

  const DEFAULT_ANNOUNCEMENT = {
    enabled: true,
    badge: "Grand Hall Premier Venue",
    title: "KEYINGI TADBIRINGIZ UCHUN ZAL VA CHIPTALARNI TOPING",
    desc: "Grand Conference Hall platformasi orqali zallarni 24/7 online bron qilish, film va tadbirlarga chiptalarni bir necha sekundda xarid qiling.",
    btnPrimaryText: "Zalni bron qilish",
    btnPrimaryLink: "/rent",
    btnSecondaryText: "Barcha tadbirlar",
    btnSecondaryLink: "/events",
    cardTitle: "Main Auditorium & Cinema",
    cardSubtitle: "98 Executive Seats • Cinema 4K • Acoustic Isolation",
    cardPrice: "300,000 UZS / hr",
    cardImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80",
    tickerText: "Hozir yuklab oling ★ ONLINE BRON ★ OXFORD HALL ★ CHIPTA XARID QILISH ★ "
  };

  const [cmsAnnouncement, setCmsAnnouncementState] = useState(DEFAULT_ANNOUNCEMENT);

  // FETCH DATA FROM SUPABASE & LOCALSTORAGE
  useEffect(() => {
    const savedLang = localStorage.getItem('gch-lang');
    if (savedLang) setLang(savedLang);

    const savedTheme = localStorage.getItem('gch-theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }

    // Load saved CMS sections from localStorage
    try {
      const p = localStorage.getItem('gch-partners'); if (p) setPartnersState(JSON.parse(p));
      const v = localStorage.getItem('gch-videos'); if (v) setCmsVideosState(JSON.parse(v));
      const c = localStorage.getItem('gch-contacts'); if (c) setCmsContactsState(JSON.parse(c));
      const f = localStorage.getItem('gch-faq'); if (f) setCmsFaqState(JSON.parse(f));
      const h = localStorage.getItem('gch-halls'); if (h) setHallsListState(JSON.parse(h));
      const adv = localStorage.getItem('gch-advantages'); if (adv) setCmsAdvantagesState(JSON.parse(adv));
      const ann = localStorage.getItem('gch-announcement'); if (ann) setCmsAnnouncementState(JSON.parse(ann));
    } catch (e) {
      console.error('Error reading saved CMS state:', e);
    }

    // Auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const fetchData = async () => {
      const [eventsRes, bookedSeatsRes, rentRes, hallRes, featuresRes, cmsRes] = await Promise.all([
        supabase.from('events').select('*').order('created_at', { ascending: true }),
        supabase.from('booked_seats').select('*'),
        supabase.from('rent_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('hall_blocks').select('*'),
        fetch('/api/features').then(res => res.json()).catch(() => []),
        supabase.from('page_sections').select('*')
      ]);

      if (cmsRes && cmsRes.data) {
        cmsRes.data.forEach(sec => {
          if (sec.type === 'partners' && sec.data?.partners) setPartnersState(sec.data.partners);
          if (sec.type === 'cases_videos' && sec.data?.videos) setCmsVideosState(sec.data.videos);
          if (sec.type === 'contacts' && sec.data) setCmsContactsState(sec.data);
          if (sec.type === 'faq' && sec.data?.faq) setCmsFaqState(sec.data.faq);
          if (sec.type === 'halls' && sec.data?.halls) setHallsListState(sec.data.halls);
          if (sec.type === 'advantages' && sec.data?.advantages) setCmsAdvantagesState(sec.data.advantages);
          if (sec.type === 'announcement' && sec.data) setCmsAnnouncementState({ ...DEFAULT_ANNOUNCEMENT, ...sec.data });
        });
      }

      setFeatures(featuresRes || []);

      if (eventsRes.data) {
        const formattedEvents = eventsRes.data.map(e => ({
          id: e.id,
          title: e.title, titleRu: e.title_ru, titleUz: e.title_uz,
          description: e.description, descriptionRu: e.description_ru, descriptionUz: e.description_uz,
          date: e.date, time: e.time, endTime: e.end_time,
          category: e.category, image: e.image, bgImage: e.bg_image,
          price: e.price, organizer: e.organizer, featured: e.featured,
          bookedSeats: bookedSeatsRes.data ? bookedSeatsRes.data.filter(s => s.event_id === e.id).map(s => s.seat_id) : []
        }));
        setEvents(formattedEvents);
      }

      if (rentRes.data) {
         setRentRequests(rentRes.data.map(r => ({
            id: r.id, name: r.name, phone: r.phone, email: r.email,
            eventType: r.event_type, date: r.date, guests: r.guests,
            status: r.status, createdAt: r.created_at
         })));
      }
      
      if (hallRes.data && hallRes.data.length > 0) {
        if (hallRes.data.length !== DEFAULT_BLOCKS.length) {
          // Force reset to new layout
          setHallBlocksState(DEFAULT_BLOCKS);
          const supabaseBlocks = DEFAULT_BLOCKS.map(b => ({
            id: b.id, label: b.label, rows: b.rows, cols: b.cols,
            is_vip: b.isVip, grid_row: b.gridRow, grid_col: b.gridCol
          }));
          await supabase.from('hall_blocks').delete().neq('id', '0'); 
          await supabase.from('hall_blocks').insert(supabaseBlocks);
        } else {
          const blocks = hallRes.data.map(b => ({
            id: b.id, label: b.label, rows: b.rows, cols: b.cols,
            isVip: b.is_vip, gridRow: b.grid_row, gridCol: b.grid_col
          }));
          setHallBlocksState(blocks);
        }
      }
      setLoading(false);
    };

    fetchData();

    return () => subscription.unsubscribe();
  }, []);

  // Fetch tickets whenever the user changes
  useEffect(() => {
    if (!user) {
      setTickets([]);
      return;
    }
    const fetchUserTickets = async () => {
      const [ticketsRes, bookedSeatsRes] = await Promise.all([
        supabase.from('tickets').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('booked_seats').select('*')
      ]);

      if (ticketsRes.data) {
        const formattedTickets = ticketsRes.data.map(t => ({
          id: t.id,
          eventId: t.event_id,
          eventTitle: t.event_title,
          payerName: t.payer_name,
          payerPhone: t.payer_phone,
          totalPrice: t.total_price,
          status: t.status,
          seats: bookedSeatsRes.data ? bookedSeatsRes.data.filter(s => s.ticket_id === t.id).map(s => ({ id: s.seat_id })) : [],
          createdAt: t.created_at
        }));
        setTickets(formattedTickets);
      }
    };
    fetchUserTickets();
  }, [user]);

  const changeLang = (newLang) => {
    setLang(newLang);
    localStorage.setItem('gch-lang', newLang);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('gch-theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const t = translations[lang];

  const saveHallBlocks = async (blocks) => {
    setHallBlocksState(blocks);
    
    const supabaseBlocks = blocks.map(b => ({
      id: b.id, label: b.label, rows: b.rows, cols: b.cols,
      is_vip: b.isVip, grid_row: b.gridRow, grid_col: b.gridCol
    }));
    
    await supabase.from('hall_blocks').delete().neq('id', '0'); 
    await supabase.from('hall_blocks').insert(supabaseBlocks);
  };

  const resetHallBlocks = async () => {
    setHallBlocksState(DEFAULT_BLOCKS);
    await supabase.from('hall_blocks').delete().neq('id', '0');
  };

  const addTicket = async (ticket) => {
    const { data: tData, error: tErr } = await supabase.from('tickets').insert([{
       event_id: ticket.eventId,
       event_title: ticket.eventTitle,
       payer_name: ticket.payerName,
       payer_phone: ticket.payerPhone,
       total_price: ticket.totalPrice,
       user_id: user?.id || null
    }]).select();

    if (tData && tData[0]) {
      const newTicketId = tData[0].id;
      const seatsToInsert = ticket.seats.map(s => ({
         ticket_id: newTicketId,
         event_id: ticket.eventId,
         seat_id: s.id
      }));
      await supabase.from('booked_seats').insert(seatsToInsert);

      setTickets([...tickets, { ...ticket, id: newTicketId, createdAt: tData[0].created_at }]);
      setEvents(events.map(ev => {
        if (ev.id === ticket.eventId) {
          return { ...ev, bookedSeats: [...(ev.bookedSeats || []), ...ticket.seats.map(s => s.id)] };
        }
        return ev;
      }));
    }
  };

  // ===== CONFLICT DETECTION =====
  const checkConflict = (date, time, endTime, excludeId = null) => {
    if (!date || !time || !endTime) return { hasConflict: false, conflictingEvents: [] };
    
    const toMinutes = (t) => {
      if (!t) return 0;
      const [h, m] = t.split(':').map(Number);
      return h * 60 + (m || 0);
    };
    
    const newStart = toMinutes(time);
    const newEnd = toMinutes(endTime);
    
    if (newStart >= newEnd) return { hasConflict: false, conflictingEvents: [] };
    
    const conflicting = events.filter(ev => {
      if (excludeId && ev.id === excludeId) return false;
      if (ev.date !== date) return false;
      
      const evStart = toMinutes(ev.time);
      const evEnd = toMinutes(ev.endTime);
      
      // Overlap: newStart < evEnd && newEnd > evStart
      return newStart < evEnd && newEnd > evStart;
    });
    
    return { hasConflict: conflicting.length > 0, conflictingEvents: conflicting };
  };

  const addEvent = async (event) => {
    // Check for time conflicts before saving
    const conflict = checkConflict(event.date, event.time, event.endTime);
    if (conflict.hasConflict) {
      return { error: 'conflict', conflictingEvents: conflict.conflictingEvents };
    }

    const { data, error } = await supabase.from('events').insert([{
        title: event.title,
        title_ru: event.titleRu,
        title_uz: event.titleUz,
        description: event.description,
        description_ru: event.descriptionRu,
        description_uz: event.descriptionUz,
        date: event.date,
        time: event.time,
        end_time: event.endTime,
        category: event.category,
        image: event.image,
        bg_image: event.bgImage,
        price: event.price,
        organizer: event.organizer,
        featured: event.featured || false
    }]).select();

    if (data && data[0]) {
      const e = data[0];
      const newEvent = {
          id: e.id,
          title: e.title, titleRu: e.title_ru, titleUz: e.title_uz,
          description: e.description, descriptionRu: e.description_ru, descriptionUz: e.description_uz,
          date: e.date, time: e.time, endTime: e.end_time,
          category: e.category, image: e.image, bgImage: e.bg_image,
          price: e.price, organizer: e.organizer, featured: e.featured,
          bookedSeats: []
      };
      setEvents([...events, newEvent]);
      return { success: true };
    }
    return { error: 'save_failed' };
  };

  const updateEvent = async (id, data) => {
    // Check for time conflicts before updating (exclude current event)
    if (data.date !== undefined && data.time !== undefined && data.endTime !== undefined) {
      const currentEvent = events.find(ev => ev.id === id);
      const checkDate = data.date || currentEvent?.date;
      const checkTime = data.time || currentEvent?.time;
      const checkEndTime = data.endTime || currentEvent?.endTime;
      const conflict = checkConflict(checkDate, checkTime, checkEndTime, id);
      if (conflict.hasConflict) {
        return { error: 'conflict', conflictingEvents: conflict.conflictingEvents };
      }
    }

    const updated = events.map(ev => ev.id === id ? { ...ev, ...data } : ev);
    setEvents(updated);
    
    const sbData = {};
    if (data.title !== undefined) sbData.title = data.title;
    if (data.titleRu !== undefined) sbData.title_ru = data.titleRu;
    if (data.titleUz !== undefined) sbData.title_uz = data.titleUz;
    if (data.description !== undefined) sbData.description = data.description;
    if (data.descriptionRu !== undefined) sbData.description_ru = data.descriptionRu;
    if (data.descriptionUz !== undefined) sbData.description_uz = data.descriptionUz;
    if (data.date !== undefined) sbData.date = data.date;
    if (data.time !== undefined) sbData.time = data.time;
    if (data.endTime !== undefined) sbData.end_time = data.endTime;
    if (data.category !== undefined) sbData.category = data.category;
    if (data.image !== undefined) sbData.image = data.image;
    if (data.bgImage !== undefined) sbData.bg_image = data.bgImage;
    if (data.price !== undefined) sbData.price = data.price;
    if (data.organizer !== undefined) sbData.organizer = data.organizer;
    if (data.featured !== undefined) sbData.featured = data.featured;
    
    await supabase.from('events').update(sbData).eq('id', id);
    return { success: true };
  };

  const deleteEvent = async (id) => {
    setEvents(events.filter(ev => ev.id !== id));
    await supabase.from('events').delete().eq('id', id);
  };

  const addRentRequest = async (request) => {
    const { data, error } = await supabase.from('rent_requests').insert([{
       name: request.name,
       phone: request.phone,
       email: request.email,
       event_type: request.eventType,
       date: request.date,
       guests: request.guests
    }]).select();

    if (data && data[0]) {
       const r = data[0];
       setRentRequests([...rentRequests, {
          id: r.id, name: r.name, phone: r.phone, email: r.email,
          eventType: r.event_type, date: r.date, guests: r.guests,
          status: r.status, createdAt: r.created_at
       }]);
    }
  };

  const updateRentRequest = async (id, status) => {
    const updated = rentRequests.map(r => r.id === id ? { ...r, status } : r);
    setRentRequests(updated);
    await supabase.from('rent_requests').update({ status }).eq('id', id);
  };

  const clearCart = () => setCart({ eventId: null, seats: [], payerInfo: null });

  const saveFeatures = async (newFeatures) => {
    try {
      await fetch('/api/features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeatures)
      });
      setFeatures(newFeatures);
    } catch (error) {
      console.error('Error saving features:', error);
    }
  };

  const upsertPageSection = async (type, data) => {
    try {
      const { data: existing } = await supabase.from('page_sections').select('id').eq('type', type).maybeSingle();
      if (existing) {
        await supabase.from('page_sections').update({ data }).eq('id', existing.id);
      } else {
        await supabase.from('page_sections').insert({ type, page_slug: 'home', data, order_index: 0 });
      }
    } catch (err) {
      console.error(`Error saving CMS section [${type}]:`, err);
    }
  };

  const savePartners = async (newPartners) => {
    setPartnersState(newPartners);
    localStorage.setItem('gch-partners', JSON.stringify(newPartners));
    await upsertPageSection('partners', { partners: newPartners });
  };

  const saveCmsVideos = async (newVideos) => {
    setCmsVideosState(newVideos);
    localStorage.setItem('gch-videos', JSON.stringify(newVideos));
    await upsertPageSection('cases_videos', { videos: newVideos });
  };

  const saveCmsContacts = async (newContacts) => {
    setCmsContactsState(newContacts);
    localStorage.setItem('gch-contacts', JSON.stringify(newContacts));
    await upsertPageSection('contacts', newContacts);
  };

  const saveCmsFaq = async (newFaq) => {
    setCmsFaqState(newFaq);
    localStorage.setItem('gch-faq', JSON.stringify(newFaq));
    await upsertPageSection('faq', { faq: newFaq });
  };

  const saveHallsList = async (newHalls) => {
    setHallsListState(newHalls);
    localStorage.setItem('gch-halls', JSON.stringify(newHalls));
    await upsertPageSection('halls', { halls: newHalls });
  };

  const saveCmsAdvantages = async (newAdvantages) => {
    setCmsAdvantagesState(newAdvantages);
    localStorage.setItem('gch-advantages', JSON.stringify(newAdvantages));
    await upsertPageSection('advantages', { advantages: newAdvantages });
  };

  const saveCmsAnnouncement = async (newAnnouncement) => {
    setCmsAnnouncementState(newAnnouncement);
    localStorage.setItem('gch-announcement', JSON.stringify(newAnnouncement));
    await upsertPageSection('announcement', newAnnouncement);
  };

  return (
    <AppContext.Provider value={{
      lang, changeLang, t,
      theme, toggleTheme,
      user,
      tickets, addTicket,
      events, addEvent, updateEvent, deleteEvent, checkConflict,
      rentRequests, addRentRequest, updateRentRequest,
      cart, clearCart,
      hallBlocks, saveHallBlocks, resetHallBlocks,
      features, saveFeatures,
      partners, savePartners,
      cmsVideos, saveCmsVideos,
      cmsContacts, saveCmsContacts,
      cmsFaq, saveCmsFaq,
      hallsList, saveHallsList,
      cmsAdvantages, saveCmsAdvantages,
      cmsAnnouncement, saveCmsAnnouncement,
      loading
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
