'use client';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import DatePicker from '@/components/DatePicker';
import TimePicker from '@/components/TimePicker';
import CategoryPicker from '@/components/CategoryPicker';
import { QRCodeSVG } from 'qrcode.react';
import {
  LayoutDashboard, CalendarDays, Ticket, Building2, LogOut,
  Plus, Trash2, Check, X, TrendingUp, Users, DollarSign,
  ClipboardList, Map, RotateCcw, Save, Edit2, Crown, LayoutTemplate,
  Clock, Printer, Eye
} from 'lucide-react';
import { formatPrice } from '@/lib/data';
import { supabase } from '@/lib/supabase';
import TicketDesignerStudio from '@/components/TicketDesignerStudio';
import EventWorkspaceModal from '@/components/EventWorkspaceModal';

const ADMIN_PASSWORD = 'admin2026';

const EMPTY_BLOCK = { id: '', label: '', rows: 5, cols: 6, isVip: false, gridRow: 1, gridCol: 1 };

export default function AdminPage() {
  const { lang, t, theme, events, addEvent, updateEvent, deleteEvent, checkConflict,
          tickets, addTicket,
          rentRequests, addRentRequest, updateRentRequest,
          partners, savePartners,
          cmsVideos: appVideos, saveCmsVideos,
          cmsContacts: appContacts, saveCmsContacts,
          cmsFaq: appFaq, saveCmsFaq,
          hallsList: appHalls, saveHallsList,
          cmsAdvantages: appAdvantages, saveCmsAdvantages,
          cmsAnnouncement: appAnnouncement, saveCmsAnnouncement,
          hallBlocks, saveHallBlocks, resetHallBlocks } = useApp();
  const isLight = theme === 'light';

  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [wrongPass, setWrongPass] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedWorkspaceEvent, setSelectedWorkspaceEvent] = useState(null);
  const [cmsSections, setCmsSections] = useState([]);
  const [editingSection, setEditingSection] = useState(null);

  // ── CMS Section Modals State ──
  const [activeCmsModal, setActiveCmsModal] = useState(null); // 'partners' | 'videos' | 'contacts' | 'faq'
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerLogo, setNewPartnerLogo] = useState('');
  const [cmsPartners, setCmsPartners] = useState([
    { id: 1, name: 'Microsoft', logo: '' }, { id: 2, name: 'Google', logo: '' }, { id: 3, name: 'Amazon', logo: '' },
    { id: 4, name: 'Tesla', logo: '' }, { id: 5, name: 'Apple', logo: '' }, { id: 6, name: 'Netflix', logo: '' },
    { id: 7, name: 'Meta', logo: '' }, { id: 8, name: 'IBM', logo: '' }
  ]);

  const [newVideo, setNewVideo] = useState({ title: '', category: 'Conference', videoUrl: '', image: '' });
  const [cmsVideos, setCmsVideos] = useState([
    { id: 1, title: 'Global Tech Summit Highlights', category: 'Conference', videoUrl: 'https://www.youtube.com/watch?v=5qap5aO4i9A', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80' },
    { id: 2, title: 'Annual Award Gala Night', category: 'Ceremony', videoUrl: 'https://www.youtube.com/watch?v=L_LUpnjgPso', image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80' },
    { id: 3, title: 'Grand Hall Interior & Setup', category: 'Instagram Reel', videoUrl: 'https://www.instagram.com/', image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80' }
  ]);

  const [cmsContacts, setCmsContacts] = useState({
    address: '123 Main Street, Suite 400 Samarkand, 140100, Uzbekistan',
    phone1: '+998 90 123 45 67', phone2: '+998 71 234 56 78',
    email1: 'info@conferencehall.uz', email2: 'events@conferencehall.uz',
    hoursWeek: 'Mon - Sat: 9:00 AM - 6:00 PM', hoursSun: 'Sun: Closed (Except for Events)'
  });

  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [cmsFaq, setCmsFaq] = useState([
    { id: 1, question: 'What is included in the hall rental?', answer: 'Our standard rental includes access to the main hall, basic AV equipment (projector & sound), high-speed Wi-Fi, and standard seating.' },
    { id: 2, question: 'Can I bring my own catering service?', answer: 'Yes, we allow external catering services.' },
    { id: 3, question: 'Is there parking available for guests?', answer: 'Absolutely. Secure parking facility accommodating up to 300 vehicles.' }
  ]);

  const [cmsHalls, setCmsHalls] = useState([]);
  const [cmsAdvantages, setCmsAdvantages] = useState([]);
  const [cmsAnnouncement, setCmsAnnouncement] = useState({});
  const [newAdvLabel, setNewAdvLabel] = useState('');
  const [newAdvImage, setNewAdvImage] = useState('');

  useEffect(() => {
    if (partners && partners.length > 0) setCmsPartners(partners);
    if (appVideos && appVideos.length > 0) setCmsVideos(appVideos);
    if (appContacts && appContacts.address) setCmsContacts(appContacts);
    if (appFaq && appFaq.length > 0) setCmsFaq(appFaq);
    if (appHalls && appHalls.length > 0) setCmsHalls(appHalls);
    if (appAdvantages && appAdvantages.length > 0) setCmsAdvantages(appAdvantages);
    if (appAnnouncement && appAnnouncement.title) setCmsAnnouncement(appAnnouncement);
  }, [partners, appVideos, appContacts, appFaq, appHalls, appAdvantages, appAnnouncement]);

  // ── Movie Day Registrations & Ticket Designer ──
  const [mdRegs, setMdRegs] = useState([]);
  const [mdLoading, setMdLoading] = useState(false);
  const [mdSearch, setMdSearch] = useState('');
  const [mdFilter, setMdFilter] = useState('all');
  const [mdMovieFilter, setMdMovieFilter] = useState('all');
  const [designTicket, setDesignTicket] = useState(null);
  const [ticketDesignTheme, setTicketDesignTheme] = useState('gold');
  const [mdSubTab, setMdSubTab] = useState('designer');

  const parseTicketId = (rawId) => {
    if (!rawId) return { code: 'MD-—', eventId: '', movieTitle: 'Movie Day 2026' };
    if (rawId.includes('::')) {
      const parts = rawId.split('::');
      return {
        code: parts[0],
        eventId: parts[1] || '',
        movieTitle: parts[2] || 'Movie Day 2026'
      };
    }
    return { code: rawId, eventId: '', movieTitle: 'Movie Day 2026' };
  };

  const loadMdRegs = async () => {
    setMdLoading(true);
    try {
      const { data: mdData } = await supabase.from('movie_registrations').select('*').order('created_at', { ascending: false });
      const { data: ticketsData } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });

      const combined = [];
      const seenCodes = new Set();

      (mdData || []).forEach(r => {
        const rawCode = (r.ticket_id || '').split('::')[0];
        seenCodes.add(rawCode);
        seenCodes.add(r.id);
        combined.push(r);
      });

      (ticketsData || []).forEach(t => {
        const shortCode = (t.id || '').slice(0, 8).toUpperCase();
        if (!seenCodes.has(t.id) && !seenCodes.has(shortCode)) {
          const nameParts = (t.payer_name || '').split(' ');
          const fName = nameParts[0] || 'Attendee';
          const lName = nameParts.slice(1).join(' ') || '';
          combined.push({
            id: t.id,
            ticket_id: `${shortCode}::${t.event_id || ''}::${t.event_title || 'General Event'}`,
            first_name: fName,
            last_name: lName,
            phone: t.payer_phone || '—',
            english_level: 'Confirmed',
            branch: t.event_title || 'General',
            seat: 'Reserved Pass',
            created_at: t.created_at,
            source: 'tickets'
          });
        }
      });

      setMdRegs(combined);
    } catch (err) {
      console.error('Error loading registrations:', err);
    } finally {
      setMdLoading(false);
    }
  };

  useEffect(() => {
    if (authenticated) {
      loadMdRegs();
    }
  }, [authenticated, activeTab]);

  const deleteMdReg = async (id) => {
    await supabase.from('movie_registrations').delete().eq('id', id);
    await supabase.from('tickets').delete().eq('id', id);
    setMdRegs(prev => prev.filter(r => r.id !== id));
  };

  const exportMdCSV = () => {
    const rows = [['Ticket ID','Movie / Event','First Name','Last Name','Phone','Level','Branch','Seat','Registered']];
    mdRegs.forEach(r => {
      const parsed = parseTicketId(r.ticket_id);
      rows.push([parsed.code, parsed.movieTitle, r.first_name, r.last_name, r.phone, r.english_level, r.branch, r.seat||'', new Date(r.created_at).toLocaleString()]);
    });
    const csv = rows.map(r => r.map(c => `"${(c||'').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'MovieDay_Registrations.csv';
    a.click();
  };

  // ── A4 Batch PDF Ticket Sheet Printer for All Movie Attendees ──
  const handlePrintAllTicketsA4 = async () => {
    const filtered = mdRegs.filter(r => {
      const parsed = parseTicketId(r.ticket_id);
      if (mdMovieFilter !== 'all' && parsed.movieTitle !== mdMovieFilter) return false;
      if (mdSearch) {
        const q = mdSearch.toLowerCase();
        const matchName = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase().includes(q);
        const matchPhone = (r.phone || '').toLowerCase().includes(q);
        const matchTicket = (parsed.code || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchTicket) return false;
      }
      if (mdFilter === 'all') return true;
      if (mdFilter === 'Other') return r.branch !== 'Fast Education' && r.branch !== 'Oxford International School';
      return r.branch === mdFilter;
    });

    if (filtered.length === 0) {
      alert('No registrations found for the selected movie/filter to print.');
      return;
    }

    const slugKey = mdMovieFilter === 'all' ? 'movie-day' : mdMovieFilter.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const templateKey = `ticket_template_${slugKey}`;
    let design = null;

    try {
      const { data } = await supabase.from('page_sections').select('data').eq('type', templateKey).single();
      if (data?.data && data.data.elements) {
        design = data.data;
      }
    } catch (e) {}

    if (!design || !design.elements) {
      design = {
        bgImage: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
        width: 800, height: 226, flipX: false, flipY: false,
        elements: [
          { id: 'el-1', type: 'text', text: 'OFFICIAL ENTRY PASS', x: 24, y: 32, fontSize: 11, fontWeight: '800', color: '#FFDD00', fontFamily: 'Outfit' },
          { id: 'el-2', type: 'text', text: '{movie}', x: 24, y: 52, fontSize: 26, fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit' },
          { id: 'el-3', type: 'text', text: '{first_name} {last_name}', x: 24, y: 110, fontSize: 20, fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit' },
          { id: 'el-4', type: 'text', text: '{seat}', x: 24, y: 160, fontSize: 15, fontWeight: '800', color: '#FFDD00', fontFamily: 'monospace' },
          { id: 'el-5', type: 'text', text: 'Oxford Grand Conference Hall', x: 420, y: 180, fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit' },
          { id: 'el-qr', type: 'qr', x: 615, y: 35, size: 84 },
        ]
      };
    }

    const renderAttendeeTicketHtml = (r) => {
      const parsed = parseTicketId(r.ticket_id);
      const attendeeData = {
        first_name: r.first_name || '',
        last_name: r.last_name || '',
        movie: parsed.movieTitle || 'Movie Day 2026',
        seat: r.seat || 'Reserved Pass',
        ticket_id: parsed.code || r.ticket_id || 'MD-PASS',
        phone: r.phone || '',
        branch: r.branch || '',
        level: r.english_level || ''
      };

      const elementsHtml = design.elements.map(el => {
        const op = el.opacity !== undefined ? el.opacity / 100 : 1;
        if (el.type === 'text') {
          let text = (el.text || '')
            .replace(/{first_name}/g, attendeeData.first_name)
            .replace(/{last_name}/g, attendeeData.last_name)
            .replace(/{movie}/g, attendeeData.movie)
            .replace(/{seat}/g, attendeeData.seat)
            .replace(/{ticket_id}/g, attendeeData.ticket_id)
            .replace(/{phone}/g, attendeeData.phone)
            .replace(/{branch}/g, attendeeData.branch)
            .replace(/{level}/g, attendeeData.level);

          return `
            <div style="
              position: absolute;
              left: ${el.x}px;
              top: ${el.y}px;
              font-size: ${el.fontSize || 14}px;
              font-weight: ${el.fontWeight || '700'};
              color: ${el.color || '#ffffff'};
              font-family: ${el.fontFamily || 'Outfit'};
              opacity: ${op};
              transform: ${el.rotate ? `rotate(${el.rotate}deg)` : 'none'};
              white-space: nowrap;
            ">${text}</div>
          `;
        }

        if (el.type === 'qr') {
          const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent('TicketPass:' + attendeeData.ticket_id)}`;
          return `
            <div style="
              position: absolute;
              left: ${el.x}px;
              top: ${el.y}px;
              background: #ffffff;
              padding: 6px;
              border-radius: 10px;
              opacity: ${op};
              transform: ${el.rotate ? `rotate(${el.rotate}deg)` : 'none'};
            ">
              <img src="${qrUrl}" width="${el.size || 84}" height="${el.size || 84}" style="display:block;" />
            </div>
          `;
        }

        if (el.type === 'rect' || el.type === 'circ') {
          return `
            <div style="
              position: absolute;
              left: ${el.x}px;
              top: ${el.y}px;
              width: ${el.width || 80}px;
              height: ${el.height || 40}px;
              background-color: ${el.bgColor || 'transparent'};
              border: ${el.borderWidth ?? 2}px solid ${el.borderColor || '#FFDD00'};
              border-radius: ${el.type === 'circ' ? '50%' : (el.borderRadius ?? 8) + 'px'};
              opacity: ${op};
              transform: ${el.rotate ? `rotate(${el.rotate}deg)` : 'none'};
            "></div>
          `;
        }
        return '';
      }).join('');

      return `
        <div class="ticket-card" style="
          width: 210mm;
          height: 59.4mm;
          position: relative;
          border-radius: 0px;
          overflow: hidden;
          background: ${design.bgImage ? `url(${design.bgImage}) center/cover no-repeat` : 'linear-gradient(135deg, #181507 0%, #0a0802 100%)'};
          border: none;
          page-break-inside: avoid;
        ">
          ${elementsHtml}
        </div>
      `;
    };

    const TICKETS_PER_PAGE = 5;
    let pagesHtml = '';
    
    for (let i = 0; i < filtered.length; i += TICKETS_PER_PAGE) {
      const pageTickets = filtered.slice(i, i + TICKETS_PER_PAGE);
      const ticketsMarkup = pageTickets.map(r => renderAttendeeTicketHtml(r)).join('');
      pagesHtml += `
        <div class="a4-page">
          ${ticketsMarkup}
        </div>
      `;
    }

    let iframe = document.getElementById('a4-print-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'a4-print-iframe';
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = '0';
      iframe.style.visibility = 'hidden';
      document.body.appendChild(iframe);
    }

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>All Movie Tickets A4 PDF Sheet (${filtered.length} Attendees)</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box;
            }
            html, body {
              background: #ffffff !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 210mm;
              font-family: 'Outfit', sans-serif;
            }
            .a4-page {
              width: 210mm;
              height: 297mm;
              margin: 0 auto !important;
              padding: 0 !important;
              display: flex;
              flex-direction: column;
              gap: 0 !important;
              page-break-after: always;
            }
          </style>
        </head>
        <body>
          ${pagesHtml}
        </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 600);
  };

  const fetchCms = async () => {
    const { data } = await supabase.from('page_sections').select('*').order('order_index', { ascending: true });
    setCmsSections(data || []);
  };

  const handleImageUpload = async (e, fieldKey = 'image') => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('events')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('events').getPublicUrl(filePath);
      setEventForm(p => ({ ...p, [fieldKey]: data.publicUrl }));
    } catch (error) {
      console.error('Error uploading image:', error.message);
      alert('Error uploading image!');
    } finally {
      setIsUploading(false);
    }
  };

  // Hall map builder state
  const [draftBlocks, setDraftBlocks] = useState(null); // null = not editing
  const [editingBlock, setEditingBlock] = useState(null);
  const [blockForm, setBlockForm] = useState(EMPTY_BLOCK);
  const [mapSaved, setMapSaved] = useState(false);

  const defaultForm = {
    title: '', titleRu: '', titleUz: '',
    date: '', time: '', endTime: '',
    category: 'conference', price: '',
    description: '', descriptionRu: '', descriptionUz: '',
    organizer: '', image: '', bgImage: '', featured: false,
  };
  const [eventForm, setEventForm] = useState(defaultForm);

  const login = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); setWrongPass(false); }
    else setWrongPass(true);
  };

  const startEdit = (ev) => {
    setEditingEvent(ev.id);
    setEventForm({
      title: ev.title||'', titleRu: ev.titleRu||'', titleUz: ev.titleUz||'',
      date: ev.date||'', time: ev.time||'', endTime: ev.endTime||'',
      category: ev.category||'conference', price: ev.price||'',
      description: ev.description||'', descriptionRu: ev.descriptionRu||'', descriptionUz: ev.descriptionUz||'',
      organizer: ev.organizer||'', image: ev.image||'', bgImage: ev.bgImage||'', featured: ev.featured||false,
    });
    setShowEventForm(true);
  };

  const saveEvent = async () => {
    const data = { ...eventForm, price: Number(eventForm.price) };
    let res;
    if (editingEvent) res = await updateEvent(editingEvent, data);
    else res = await addEvent(data);
    
    if (res?.error === 'conflict') {
      alert(`Time Conflict Detected!\nThis overlaps with: ${res.conflictingEvents.map(e => e.title).join(', ')}`);
      return;
    }
    
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const totalRevenue = tickets.reduce((sum, t) => sum + (t.totalPrice || 0), 0);

  // ── Hall map helpers ──
  const startMapEdit = () => {
    setDraftBlocks(JSON.parse(JSON.stringify(hallBlocks)));
    setEditingBlock(null);
  };

  const openBlockForm = (block = null) => {
    setBlockForm(block ? { ...block } : { ...EMPTY_BLOCK, id: Date.now().toString() });
    setEditingBlock(block ? block.id : 'new');
  };

  const saveBlock = () => {
    if (!blockForm.label || !blockForm.rows || !blockForm.cols) return;
    const next = [...(draftBlocks || hallBlocks)];
    const idx = next.findIndex(b => b.id === blockForm.id);
    if (idx >= 0) next[idx] = { ...blockForm };
    else next.push({ ...blockForm, id: Date.now().toString() });
    setDraftBlocks(next);
    setEditingBlock(null);
  };

  const removeBlock = (id) => {
    setDraftBlocks((draftBlocks || hallBlocks).filter(b => b.id !== id));
  };

  const saveMap = () => {
    if (draftBlocks) {
      saveHallBlocks(draftBlocks);
      setDraftBlocks(null);
      setMapSaved(true);
      setTimeout(() => setMapSaved(false), 2500);
    }
  };

  const discardMap = () => { setDraftBlocks(null); setEditingBlock(null); };

  const currentBlocks = draftBlocks || hallBlocks;
  const totalSeats = currentBlocks.reduce((s, b) => s + b.rows * b.cols, 0);

  // ── Login ──
  if (!authenticated) {
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
        background:'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(/admin_bg.png) center/cover no-repeat', padding:'24px' }}>
        <div style={{ width:'100%', maxWidth:'400px', background:'var(--bg-secondary)',
          border:'1px solid var(--border)', borderRadius:'24px', padding:'40px',
          backdropFilter:'blur(16px)' }}>
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ width:'60px', height:'60px', background:'linear-gradient(135deg, #FFDD00, #FFDD00)',
              borderRadius:'16px', display:'flex', alignItems:'center', justifyContent:'center',
              fontWeight:900, fontSize:'16px', color:'var(--text-primary)', margin:'0 auto 16px',
              boxShadow:'0 8px 24px rgba(255, 221, 0, 0.35)' }}>GCH</div>
            <h1 style={{ fontSize:'22px', fontWeight:800 }}>{t.admin.title}</h1>
            <p style={{ fontSize:'14px', color:'var(--text-muted)', marginTop:'4px' }}>Sign in to manage your venue</p>
          </div>
          <form onSubmit={login} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            <div className="form-group">
              <label className="form-label">{t.admin.password}</label>
              <input type="password" className="form-input" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoFocus />
            </div>
            {wrongPass && (
              <div style={{ color:'#f87171', fontSize:'13px', textAlign:'center',
                padding:'10px', background:'rgba(239,68,68,0.1)', borderRadius:'8px',
                border:'1px solid rgba(239,68,68,0.2)' }}>{t.admin.wrongPass}</div>
            )}
            <button type="submit" className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'15px' }}>
              {t.admin.loginBtn}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── Tab nav items ──
  const navItems = [
    { id:'dashboard',    icon:<LayoutDashboard size={18}/>, label:'Dashboard' },
    { id:'events',       icon:<CalendarDays size={18}/>,    label:t.admin.events },
    { id:'schedule',     icon:<Clock size={18}/>,           label:t.timetable?.schedule || 'Schedule' },
    { id:'bookings',     icon:<Ticket size={18}/>,          label:t.admin.bookings },
    { id:'rentRequests', icon:<Building2 size={18}/>,       label:t.admin.rentRequests },
    { id:'hallMap',      icon:<Map size={18}/>,             label:'Hall Map' },
    { id:'pages',        icon:<LayoutTemplate size={18}/>,  label:'Pages (CMS)' },
  ];

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', background:'var(--bg-primary)' }}>
      <Navbar />
      <div style={{ display:'flex', flex:1, paddingTop:'72px' }}>

        {/* Sidebar */}
        <aside style={{
          width:'240px', flexShrink:0,
          background:'var(--bg-secondary)',
          borderRight:'1px solid var(--border)',
          padding:'24px 12px',
          display:'flex', flexDirection:'column', gap:'4px',
          position:'sticky', top:'72px', height:'calc(100vh - 72px)', overflowY:'auto',
        }}>
          <div style={{ padding:'8px 12px', marginBottom:'8px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.12em' }}>Admin Panel</div>
          </div>

          {navItems.map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); if(item.id === 'pages') fetchCms(); if(item.id === 'movieDay') loadMdRegs(); }} style={{
              display:'flex', alignItems:'center', gap:'10px',
              padding:'11px 14px', borderRadius:'10px', border:'none',
              background: activeTab===item.id
                ? (item.accent
                    ? (isLight ? `linear-gradient(135deg,${item.accent},${item.accent}dd)` : `linear-gradient(135deg,${item.accent}22,${item.accent}05)`)
                    : (isLight ? 'linear-gradient(135deg, #FFDD00, #ea580c)' : 'linear-gradient(135deg,rgba(255, 221, 0, 0.35),rgba(79,70,229,0.15))'))
                : 'transparent',
              color: activeTab===item.id ? '#ffffff' : 'var(--text-secondary)',
              fontSize:'13px', fontWeight: activeTab===item.id ? 700 : 500,
              cursor:'pointer', transition:'all 0.2s ease',
              fontFamily:'var(--font-sans)',
              borderLeft: activeTab===item.id ? `2px solid ${item.accent || '#FFDD00'}` : '2px solid transparent',
              textAlign:'left', width:'100%',
            }}>
              {item.icon} {item.label}
              {(item.id === 'hallMap' || item.id === 'pages') && (
                <span style={{ marginLeft:'auto', fontSize:'9px', background:'rgba(255, 221, 0, 0.35)', color:'var(--text-primary)',
                  padding:'2px 6px', borderRadius:'9999px', fontWeight:800, letterSpacing:'0.05em' }}>NEW</span>
              )}
            </button>
          ))}

          <div style={{ marginTop:'auto', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
            <button onClick={() => setAuthenticated(false)} style={{
              display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px',
              borderRadius:'10px', border:'none', background:'transparent',
              color:'var(--text-muted)', fontSize:'13px', cursor:'pointer',
              transition:'all 0.2s ease', fontFamily:'var(--font-sans)', width:'100%',
            }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--text-muted)'; }}
            >
              <LogOut size={18} /> {t.admin.logout}
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex:1, padding:'32px', overflowY:'auto' }}>

          {/* ═══════ DASHBOARD ═══════ */}
          {activeTab === 'dashboard' && (
            <div style={{ animation:'fadeInUp 0.4s ease' }}>
              <h2 style={{ fontSize:'24px', fontWeight:800, marginBottom:'24px' }}>{t.admin.dashboard}</h2>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'32px' }}>
                {[
                  { icon:<CalendarDays size={22}/>, label:t.admin.totalEvents, value:events.length, color:'#FFDD00' },
                  { icon:<Ticket size={22}/>,       label:t.admin.totalBookings, value:tickets.length, color:'#FFDD00' },
                  { icon:<DollarSign size={22}/>,   label:t.admin.totalRevenue, value:formatPrice(totalRevenue)+' UZS', color:'#10b981' },
                  { icon:<ClipboardList size={22}/>,label:t.admin.rentRequests, value:rentRequests.length, color:'#6366f1' },
                ].map((s,i) => (
                  <div key={i} style={{
                    padding:'20px', borderRadius:'16px',
                    background:'var(--bg-secondary)', border:'1px solid var(--border)',
                    transition:'all 0.25s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor=`${s.color}44`; e.currentTarget.style.transform='translateY(-4px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.transform='translateY(0)'; }}
                  >
                    <div style={{ width:'40px', height:'40px', borderRadius:'10px', marginBottom:'12px',
                      background:`${s.color}18`, border:`1px solid ${s.color}30`,
                      display:'flex', alignItems:'center', justifyContent:'center', color:s.color }}>
                      {s.icon}
                    </div>
                    <div style={{ fontSize:'22px', fontWeight:900, marginBottom:'4px' }}>{s.value}</div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════ EVENTS ═══════ */}
          {activeTab === 'events' && (
            <div style={{ animation:'fadeInUp 0.4s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
                <h2 style={{ fontSize:'24px', fontWeight:800 }}>{t.admin.events}</h2>
                <button className="btn btn-primary" onClick={() => { setEditingEvent(null); setEventForm(defaultForm); setShowEventForm(true); }}>
                  <Plus size={16} /> {t.admin.addEvent}
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {events.map(ev => (
                  <div key={ev.id} style={{
                    display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px',
                    background:'var(--bg-secondary)', border:'1px solid var(--border)',
                    borderRadius:'12px', transition:'all 0.2s ease', cursor: 'pointer'
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(255, 221, 0, 0.5)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; }}
                    onClick={() => setSelectedWorkspaceEvent(ev)}
                  >
                    <img src={ev.image} alt={ev.title} style={{ width:'52px', height:'52px', borderRadius:'10px', objectFit:'cover', flexShrink:0 }} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, marginBottom:'2px', fontSize:'15px', color:'#ffffff' }}>{ev.title}</div>
                      <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{ev.date} · {ev.organizer}</div>
                    </div>
                    <div style={{ fontSize:'13px', fontWeight:800, color:'#FFDD00' }}>{formatPrice(ev.price)} UZS</div>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center' }} onClick={e => e.stopPropagation()}>
                      <button className="btn btn-ghost btn-sm" title="Copy Telegram Link" onClick={() => {
                        const link = `${window.location.origin}/registration?eventId=${ev.id}&source=telegram`;
                        navigator.clipboard.writeText(link);
                        alert('Telegram Registration Link copied!\n\n' + link);
                      }}>
                        <span style={{ fontSize: '16px' }}>🔗</span>
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(ev)}><Edit2 size={13} /></button>
                      <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete(ev.id)}><Trash2 size={13} /></button>
                    </div>
                  </div>
                ))}
                {events.length === 0 && (
                  <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)' }}>{t.admin.noEvents}</div>
                )}
              </div>
            </div>
          )}

          {/* ═══════ SCHEDULE ═══════ */}
          {activeTab === 'schedule' && (
            <div style={{ animation:'fadeInUp 0.4s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
                <h2 style={{ fontSize:'24px', fontWeight:800 }}>Schedule Overview</h2>
                <a href="/timetable" target="_blank" className="btn btn-outline btn-sm">
                  View Public Calendar ↗
                </a>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[...events].sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`)).map(ev => {
                  const { hasConflict } = checkConflict ? checkConflict(ev.date, ev.time, ev.endTime, ev.id) : { hasConflict: false };
                  return (
                    <div key={ev.id} style={{
                      display:'flex', alignItems:'center', gap:'14px', padding:'14px 18px',
                      background:'var(--bg-secondary)', border: hasConflict ? '2px dashed var(--red)' : '1px solid var(--border)',
                      borderRadius:'12px', transition:'all 0.2s ease',
                    }}>
                      <div style={{ flexShrink: 0, width: '80px', textAlign: 'center' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{ev.date}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ev.time}</div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingLeft: '16px', borderLeft: '2px solid var(--border)' }}>
                        <div style={{ fontWeight: 700, marginBottom: '2px', fontSize: '14px' }}>{ev.title}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ev.endTime ? `Ends at ${ev.endTime}` : ''}</div>
                      </div>
                      {hasConflict && (
                        <div style={{ color: 'var(--red)', fontSize: '12px', fontWeight: 600, padding: '4px 10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '6px' }}>
                          ⚠️ Overlap Detected
                        </div>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => { setActiveTab('events'); startEdit(ev); }}>
                        Edit
                      </button>
                    </div>
                  );
                })}
                {events.length === 0 && (
                  <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)' }}>No scheduled events</div>
                )}
              </div>
            </div>
          )}

          {/* ═══════ BOOKINGS ═══════ */}
          {activeTab === 'bookings' && (
            <div style={{ animation:'fadeInUp 0.4s ease' }}>
              <h2 style={{ fontSize:'24px', fontWeight:800, marginBottom:'24px' }}>{t.admin.bookings}</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {tickets.map(tk => (
                  <div key={tk.id} style={{
                    padding:'16px 18px', background:'var(--bg-secondary)',
                    border:'1px solid var(--border)', borderRadius:'12px',
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                      <div style={{ fontWeight:700, fontSize:'14px' }}>{tk.eventTitle}</div>
                      <span className="badge badge-green" style={{ fontSize:'10px' }}>{tk.status}</span>
                    </div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', display:'flex', gap:'16px' }}>
                      <span>👤 {tk.payerName}</span>
                      <span>📞 {tk.payerPhone}</span>
                      <span>🎟 {tk.seats?.length} seats</span>
                      <span>💰 {formatPrice(tk.totalPrice)} UZS</span>
                      <span>🆔 {tk.id}</span>
                    </div>
                  </div>
                ))}
                {tickets.length === 0 && (
                  <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)' }}>{t.admin.noBookings}</div>
                )}
              </div>
            </div>
          )}

          {/* ═══════ RENT REQUESTS ═══════ */}
          {activeTab === 'rentRequests' && (
            <div style={{ animation:'fadeInUp 0.4s ease' }}>
              <h2 style={{ fontSize:'24px', fontWeight:800, marginBottom:'24px' }}>{t.admin.rentRequests}</h2>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {rentRequests.map(req => (
                  <div key={req.id} style={{
                    padding:'16px 18px', background:'var(--bg-secondary)',
                    border:'1px solid var(--border)', borderRadius:'12px',
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'8px' }}>
                      <div style={{ fontWeight:700, fontSize:'14px' }}>{req.name} — {req.eventType}</div>
                      <span className={`badge ${req.status==='approved'?'badge-green':req.status==='rejected'?'badge-red':'badge-violet'}`}>{req.status}</span>
                    </div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)', marginBottom:'12px', display:'flex', gap:'16px', flexWrap:'wrap' }}>
                      <span>📅 {req.date}</span>
                      <span>👥 {req.guests} guests</span>
                      <span>📞 {req.phone}</span>
                    </div>
                    {req.status === 'pending' && (
                      <div style={{ display:'flex', gap:'8px' }}>
                        <button className="btn btn-primary btn-sm" onClick={() => updateRentRequest(req.id, 'approved')}><Check size={13} /> Approve</button>
                        <button className="btn btn-danger btn-sm" onClick={() => updateRentRequest(req.id, 'rejected')}><X size={13} /> Reject</button>
                      </div>
                    )}
                  </div>
                ))}
                {rentRequests.length === 0 && (
                  <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)' }}>{t.admin.noRequests}</div>
                )}
              </div>
            </div>
          )}

          {/* ═══════ HALL MAP BUILDER ═══════ */}
          {activeTab === 'hallMap' && (
            <div style={{ animation:'fadeInUp 0.4s ease' }}>
              {/* Header */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                <div>
                  <h2 style={{ fontSize:'24px', fontWeight:800 }}>Hall Map Builder</h2>
                  <p style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'4px' }}>
                    Click <b>Edit Map</b>, then map blocks to a 5x3 flexible grid.
                  </p>
                </div>
                <div style={{ display:'flex', gap:'10px' }}>
                  {draftBlocks ? (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={discardMap}><X size={14}/> Discard</button>
                      <button className="btn btn-primary btn-sm" onClick={saveMap}><Save size={14}/> Save Map</button>
                    </>
                  ) : (
                    <>
                      <button className="btn btn-ghost btn-sm" onClick={() => { resetHallBlocks(); }}>
                        <RotateCcw size={14}/> Reset to Default 15-Block Layout
                      </button>
                      <button className="btn btn-primary btn-sm" onClick={startMapEdit}>
                        <Edit2 size={14}/> Edit Map
                      </button>
                    </>
                  )}
                </div>
              </div>

              {mapSaved && (
                <div style={{ padding:'12px 16px', borderRadius:'10px', background:'rgba(16,185,129,0.1)',
                  border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', fontSize:'13px', fontWeight:600,
                  marginBottom:'16px', display:'flex', alignItems:'center', gap:'8px' }}>
                  <Check size={15}/> Map saved! Changes are live on the event pages.
                </div>
              )}

              {draftBlocks && (
                <div style={{ padding:'12px 16px', borderRadius:'10px', background:'rgba(255, 221, 0, 0.35)',
                  border:'1px solid rgba(255, 221, 0, 0.35)', color:'#FFDD00', fontSize:'13px',
                  marginBottom:'16px' }}>
                  ✏️ You are editing an unsaved draft. Click <b>Save Map</b> when done.
                </div>
              )}

              {/* Stats bar */}
              <div style={{ display:'flex', gap:'16px', marginBottom:'24px' }}>
                {[
                  { label:'Total Blocks', value:currentBlocks.length, color:'#FFDD00' },
                  { label:'Total Seats', value:totalSeats, color:'#10b981' },
                  { label:'VIP Seats', value:currentBlocks.filter(b=>b.isVip).reduce((s,b)=>s+b.rows*b.cols,0), color:'var(--text-primary)' },
                ].map((s,i)=>(
                  <div key={i} style={{ padding:'12px 20px', borderRadius:'12px',
                    background:'var(--bg-secondary)', border:'1px solid var(--border)',
                    display:'flex', flexDirection:'column', gap:'2px' }}>
                    <div style={{ fontSize:'22px', fontWeight:900, color:s.color }}>{s.value}</div>
                    <div style={{ fontSize:'11px', color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Layout visual diagram (5x3 Grid) */}
              <div style={{ padding:'16px', borderRadius:'14px', background:'var(--bg-secondary)',
                border:'1px solid var(--border)', marginBottom:'24px' }}>
                <div style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)',
                  textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:'16px' }}>Layout Preview (SCENE TOP)</div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gridTemplateRows: 'repeat(3, auto)',
                  gap: '8px',
                }}>
                  {[1,2,3].map(row => (
                    [1,2,3,4,5,6].map(col => {
                      const block = currentBlocks.find(b => b.gridRow === row && b.gridCol === col);
                      return (
                        <div key={`${row}-${col}`} style={{
                          padding:'12px 8px', borderRadius:'8px', textAlign:'center', minHeight:'50px',
                          display:'flex', flexDirection:'column', justifyContent:'center',
                          background: block ? (block.isVip ? 'rgba(255, 221, 0, 0.35)' : 'rgba(16,185,129,0.12)') : 'rgba(255,255,255,0.02)',
                          border: block ? (block.isVip ? '1px solid rgba(255, 221, 0, 0.35)' : '1px solid rgba(16,185,129,0.25)') : '1px dashed rgba(255,255,255,0.08)',
                        }}>
                          {block ? (
                            <>
                              <div style={{ fontSize:'13px', fontWeight:800, color: block.isVip ? '#ffffff' : '#10b981' }}>
                                {block.label}
                              </div>
                              <div style={{ fontSize:'9px', color:'var(--text-muted)', marginTop:'2px' }}>
                                {block.rows}x{block.cols}
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize:'9px', color:'var(--text-muted)' }}>Empty</div>
                          )}
                        </div>
                      );
                    })
                  ))}
                </div>
              </div>

              {/* Block list */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
                {currentBlocks.map(block => (
                  <div key={block.id} style={{
                    display:'flex', alignItems:'center', gap:'16px',
                    padding:'14px 18px',
                    background: block.isVip ? 'rgba(255, 221, 0, 0.35)' : 'rgba(255,255,255,0.03)',
                    border: block.isVip ? '1px solid rgba(255, 221, 0, 0.35)' : '1px solid rgba(255,255,255,0.07)',
                    borderRadius:'12px', transition:'all 0.2s ease',
                  }}>
                    {/* Color circle */}
                    <div style={{
                      width:'36px', height:'36px', borderRadius:'50%', flexShrink:0,
                      background: block.isVip ? 'linear-gradient(135deg,rgba(255, 221, 0, 0.35),rgba(109, 40, 217,0.5))' : 'linear-gradient(135deg,#10b981,#059669)',
                      border: block.isVip ? '2px solid rgba(167, 139, 250,0.5)' : '2px solid #34d399',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontWeight:900, fontSize:'13px', color:'var(--text-primary)',
                    }}>
                      {block.label}
                    </div>

                    {/* Info */}
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px' }}>
                        <span style={{ fontWeight:700, fontSize:'15px' }}>Block {block.label}</span>
                        {block.isVip && <span className="badge badge-violet" style={{ fontSize:'9px', padding:'2px 8px' }}>👑 VIP</span>}
                      </div>
                      <div style={{ fontSize:'12px', color:'var(--text-muted)', display:'flex', gap:'12px' }}>
                        <span>📐 {block.rows} rows × {block.cols} cols</span>
                        <span>🪑 {block.rows * block.cols} seats</span>
                        <span>📍 Grid R{block.gridRow}:C{block.gridCol}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {draftBlocks && (
                      <div style={{ display:'flex', gap:'8px' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openBlockForm(block)}>
                          <Edit2 size={13}/> Edit
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => removeBlock(block.id)}>
                          <Trash2 size={13}/> Remove
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add block button */}
              {draftBlocks && (
                <button className="btn btn-outline" style={{ width:'100%', justifyContent:'center', padding:'14px', fontSize:'14px' }}
                  onClick={() => openBlockForm()}>
                  <Plus size={16}/> Add New Block
                </button>
              )}

              {!draftBlocks && (
                <div style={{ textAlign:'center', padding:'16px', color:'var(--text-muted)', fontSize:'13px' }}>
                  Click <b style={{color:'var(--text-primary)'}}>Edit Map</b> above to start customizing your hall layout.
                </div>
              )}
            </div>
          )}

          {/* ═══════ PAGES CMS ═══════ */}
          {activeTab === 'pages' && (
            <div style={{ animation:'fadeInUp 0.4s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
                <div>
                  <h2 style={{ fontSize:'24px', fontWeight:800 }}>Pages & Content Manager (CMS)</h2>
                  <p style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'4px' }}>Edit Partners, Cases & Videos, Contact details, FAQ, and page layouts live.</p>
                </div>
              </div>

              {/* CMS Section Cards */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(320px, 1fr))', gap:'20px' }}>
                
                {/* 1. Partners Section Card */}
                <div style={{ padding:'24px', borderRadius:'18px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <h3 style={{ fontSize:'18px', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'8px' }}>
                      🤝 Partners & Brand Logos
                    </h3>
                    <span style={{ fontSize:'11px', background:'#FFDD00', color:'#000', fontWeight:800, padding:'3px 8px', borderRadius:'6px' }}>Active</span>
                  </div>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'18px', lineHeight:1.5 }}>
                    Manage brand names and logo images shown in the trusted industry leaders marquee loop.
                  </p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveCmsModal('partners')}>
                      <Edit2 size={14}/> Edit Partners
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => window.open('/', '_blank')}>
                      Preview ↗
                    </button>
                  </div>
                </div>

                {/* 2. Cases & Videos Card */}
                <div style={{ padding:'24px', borderRadius:'18px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <h3 style={{ fontSize:'18px', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'8px' }}>
                      🎬 Cases & Videos (YouTube / IG)
                    </h3>
                    <span style={{ fontSize:'11px', background:'#FFDD00', color:'#000', fontWeight:800, padding:'3px 8px', borderRadius:'6px' }}>Active</span>
                  </div>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'18px', lineHeight:1.5 }}>
                    Paste YouTube links or Instagram Reel links. Automatic video embed and thumbnail setup.
                  </p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveCmsModal('videos')}>
                      <Plus size={14}/> Add / Edit Videos
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => window.open('/', '_blank')}>
                      Preview ↗
                    </button>
                  </div>
                </div>

                {/* 3. Contacts Card */}
                <div style={{ padding:'24px', borderRadius:'18px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <h3 style={{ fontSize:'18px', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'8px' }}>
                      📞 Contacts & Working Hours
                    </h3>
                    <span style={{ fontSize:'11px', background:'#FFDD00', color:'#000', fontWeight:800, padding:'3px 8px', borderRadius:'6px' }}>Active</span>
                  </div>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'18px', lineHeight:1.5 }}>
                    Update address, phone lines (+998 90 123 45 67), email addresses, and working hours.
                  </p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveCmsModal('contacts')}>
                      <Edit2 size={14}/> Edit Contacts
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => window.open('/rent', '_blank')}>
                      Preview ↗
                    </button>
                  </div>
                </div>

                {/* 4. FAQ Card */}
                <div style={{ padding:'24px', borderRadius:'18px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <h3 style={{ fontSize:'18px', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'8px' }}>
                      ❓ FAQ Questions & Answers
                    </h3>
                    <span style={{ fontSize:'11px', background:'#FFDD00', color:'#000', fontWeight:800, padding:'3px 8px', borderRadius:'6px' }}>Active</span>
                  </div>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'18px', lineHeight:1.5 }}>
                    Add, edit, or reorder Frequently Asked Questions (Question & Answer dropdown items).
                  </p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveCmsModal('faq')}>
                      <Plus size={14}/> Manage FAQ
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => window.open('/', '_blank')}>
                      Preview ↗
                    </button>
                  </div>
                </div>

                {/* 5. Our Halls Cards Manager */}
                <div style={{ padding:'24px', borderRadius:'18px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <h3 style={{ fontSize:'18px', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'8px' }}>
                      🏰 Our Halls & Rental Cards
                    </h3>
                    <span style={{ fontSize:'11px', background:'#FFDD00', color:'#000', fontWeight:800, padding:'3px 8px', borderRadius:'6px' }}>Active</span>
                  </div>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'18px', lineHeight:1.5 }}>
                    Edit hall titles, prices per hour, capacity, area (m²), change cover photos, or upload new pictures for your hall cards.
                  </p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveCmsModal('halls')}>
                      <Edit2 size={14}/> Edit Our Halls Cards
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => window.open('/', '_blank')}>
                      Preview ↗
                    </button>
                  </div>
                </div>

                {/* 6. Our Advantages Carousel Manager */}
                <div style={{ padding:'24px', borderRadius:'18px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <h3 style={{ fontSize:'18px', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'8px' }}>
                      🌟 Our Advantages Carousel
                    </h3>
                    <span style={{ fontSize:'11px', background:'#FFDD00', color:'#000', fontWeight:800, padding:'3px 8px', borderRadius:'6px' }}>Active</span>
                  </div>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'18px', lineHeight:1.5 }}>
                    Manage slide pictures, titles, and card labels displayed in the interactive Our Advantages section.
                  </p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveCmsModal('advantages')}>
                      <Edit2 size={14}/> Edit Advantages
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => window.open('/', '_blank')}>
                      Preview ↗
                    </button>
                  </div>
                </div>

                {/* 7. Live Announcement & Promo Banner Manager */}
                <div style={{ padding:'24px', borderRadius:'18px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                    <h3 style={{ fontSize:'18px', fontWeight:800, color:'var(--text-primary)', display:'flex', alignItems:'center', gap:'8px' }}>
                      📢 Live Announcement Banner
                    </h3>
                    <span style={{ fontSize:'11px', background: cmsAnnouncement.enabled !== false ? '#10b981' : '#64748b', color:'#fff', fontWeight:800, padding:'3px 8px', borderRadius:'6px' }}>
                      {cmsAnnouncement.enabled !== false ? 'Live ON' : 'OFF'}
                    </span>
                  </div>
                  <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'18px', lineHeight:1.5 }}>
                    Edit the yellow announcement card at the bottom of your website. Change titles, descriptions, button links, card pictures, or toggle ON/OFF live.
                  </p>
                  <div style={{ display:'flex', gap:'8px' }}>
                    <button className="btn btn-primary btn-sm" onClick={() => setActiveCmsModal('announcement')}>
                      <Edit2 size={14}/> Edit Announcement
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => window.open('/', '_blank')}>
                      Preview ↗
                    </button>
                  </div>
                </div>

              </div>

              {/* Background Images Section */}
              <div style={{ marginTop:'32px' }}>
                <h3 style={{ fontSize:'18px', fontWeight:800, marginBottom:'16px' }}>🖼️ Custom Background Images</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                  {cmsSections.map(sec => (
                    <div key={sec.id} style={{
                      padding:'20px', borderRadius:'16px', background:'var(--bg-secondary)',
                      border:'1px solid var(--border)'
                    }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
                        <div style={{ fontWeight: 800, color:'var(--text-primary)', textTransform: 'capitalize' }}>
                          {sec.type.replace('_', ' ')} Section Backgrounds
                        </div>
                        <button className="btn btn-outline btn-sm" onClick={() => setEditingSection(sec)}>
                          <Edit2 size={14}/> Edit Images
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        {Object.entries(sec?.data || {}).filter(([k]) => k.toLowerCase().includes('bgimage')).map(([key, val]) => (
                          <div key={key} style={{ position: 'relative', width: '120px', height: '80px', borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={val} alt="Bg" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '4px', fontSize: '10px', textAlign: 'center' }}>
                              {key}
                            </div>
                          </div>
                        ))}
                        {Object.keys(sec?.data || {}).filter(k => k.toLowerCase().includes('bgimage')).length === 0 && (
                          <div style={{ fontSize: '12px', color:'var(--text-muted)' }}>No custom backgrounds set. Defaults will be used.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ═══════ MOVIE DAY REGISTRATIONS ═══════ */}
          {activeTab === 'movieDay' && (
            <div style={{ animation:'fadeInUp 0.4s ease' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
                <div>
                  <h2 style={{ fontSize:'24px', fontWeight:800, display:'flex', alignItems:'center', gap:'10px' }}>🎬 Movie Day Registrations & Ticket Designer</h2>
                  <p style={{ fontSize:'13px', color:'var(--text-muted)', marginTop:'4px' }}>Filter registrations per movie, manage attendee passes, and design tickets live.</p>
                </div>
                <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                  <button className="btn" onClick={handlePrintAllTicketsA4} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', background:'linear-gradient(135deg, #FFDD00, #FFDD00)', color:'#000000', fontWeight:800, padding:'10px 18px', borderRadius:'10px', boxShadow:'0 4px 14px rgba(255, 221, 0, 0.35)', border:'none', cursor:'pointer' }}>
                    🖨️ Print All Tickets (A4 PDF)
                  </button>
                  <button className="btn btn-primary" onClick={exportMdCSV} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px' }}>
                    <Users size={14}/> Export CSV
                  </button>
                  <button className="btn btn-ghost" onClick={loadMdRegs} style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px' }}>
                    <RotateCcw size={14}/> Refresh
                  </button>
                </div>
              </div>

              {/* Direct Registrations View */}
              <div>
                  {/* Stats row */}
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'20px' }}>
                    {[
                      { label:'Total Registrations', value: mdRegs.length, color:'#ea580c' },
                      { label:'Fast Education', value: mdRegs.filter(r=>r.branch==='Fast Education').length, color:'#FFDD00' },
                      { label:'Oxford Int\'l', value: mdRegs.filter(r=>r.branch==='Oxford International School').length, color:'#3b82f6' },
                      { label:'Seats Taken', value: mdRegs.filter(r=>r.seat).length, color:'#10b981' },
                    ].map((s,i) => (
                      <div key={i} style={{ padding:'16px', borderRadius:'14px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                        <div style={{ fontSize:'24px', fontWeight:900, color:s.color }}>{s.value}</div>
                        <div style={{ fontSize:'11px', color:'var(--text-muted)', fontWeight:600, marginTop:'2px' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

              {/* Search + Filters */}
              <div style={{ display:'flex', gap:'10px', marginBottom:'16px', flexWrap:'wrap', alignItems:'center' }}>
                <input placeholder="Search name, phone, ticket…" value={mdSearch} onChange={e=>setMdSearch(e.target.value)}
                  className="form-input" style={{ flex:1, minWidth:'180px', fontSize:'13px' }} />

                {/* Movie Selector Dropdown */}
                <select 
                  className="form-input" 
                  style={{ width:'auto', minWidth:'180px', fontSize:'13px', background:'var(--bg-secondary)', color:'var(--text-primary)', border:'1px solid var(--border)' }}
                  value={mdMovieFilter}
                  onChange={e => setMdMovieFilter(e.target.value)}
                >
                  <option value="all">🎬 All Movies / Events</option>
                  {events.map(ev => (
                    <option key={ev.id} value={ev.title}>{ev.title}</option>
                  ))}
                </select>

                {['all','Fast Education','Oxford International School','Other'].map(f=>(
                  <button key={f} onClick={()=>setMdFilter(f)}
                    className={`btn btn-sm ${mdFilter===f?'btn-primary':'btn-ghost'}`} style={{ fontSize:'12px', whiteSpace:'nowrap' }}>
                    {f==='all'?'All Branches':f==='Oxford International School'?'Oxford Int\'l':f}
                  </button>
                ))}
              </div>

              {/* Table */}
              {mdLoading ? (
                <div style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)' }}>Loading registrations…</div>
              ) : (
                <div style={{ overflowX:'auto', borderRadius:'14px', border:'1px solid var(--border)' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'13px' }}>
                    <thead>
                      <tr style={{ background:'var(--bg-secondary)' }}>
                        {['#','Ticket ID','Movie / Event','Name','Phone','Level','Branch','Seat','Date','Actions'].map(h=>(
                          <th key={h} style={{ padding:'12px 14px', textAlign:'left', fontWeight:700, fontSize:'11px', color:'var(--text-muted)', letterSpacing:'0.05em', textTransform:'uppercase', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mdRegs
                        .filter(r => {
                          const parsed = parseTicketId(r.ticket_id);
                          if (mdMovieFilter !== 'all' && parsed.movieTitle !== mdMovieFilter) return false;
                          if (mdFilter === 'all') return true;
                          if (mdFilter === 'Other') return r.branch !== 'Fast Education' && r.branch !== 'Oxford International School';
                          return r.branch === mdFilter;
                        })
                        .filter(r => {
                          const parsed = parseTicketId(r.ticket_id);
                          return !mdSearch || `${r.first_name} ${r.last_name} ${r.phone} ${parsed.code} ${parsed.movieTitle}`.toLowerCase().includes(mdSearch.toLowerCase());
                        })
                        .map((r, i) => {
                          const parsed = parseTicketId(r.ticket_id);
                          return (
                            <tr key={r.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}
                              onMouseEnter={e=>e.currentTarget.style.background='var(--bg-secondary)'}
                              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                              <td style={{ padding:'12px 14px', color:'var(--text-muted)' }}>{i+1}</td>
                              <td style={{ padding:'12px 14px', fontWeight:700, color:'#fb923c', fontFamily:'monospace', fontSize:'12px' }}>{parsed.code}</td>
                              <td style={{ padding:'12px 14px', fontWeight:700, color:'#FFDD00', fontSize:'12px' }}>{parsed.movieTitle}</td>
                              <td style={{ padding:'12px 14px', fontWeight:600 }}>{r.first_name} {r.last_name}</td>
                              <td style={{ padding:'12px 14px', color:'var(--text-secondary)' }}>{r.phone}</td>
                              <td style={{ padding:'12px 14px' }}>
                                <span style={{ padding:'2px 8px', borderRadius:'6px', fontSize:'11px', fontWeight:800, background:'rgba(234,88,12,0.1)', color:'#fb923c' }}>{r.english_level}</span>
                              </td>
                              <td style={{ padding:'12px 14px', color:'var(--text-secondary)', maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{r.branch}</td>
                              <td style={{ padding:'12px 14px', fontWeight:700 }}>{r.seat || '—'}</td>
                              <td style={{ padding:'12px 14px', color:'var(--text-muted)', fontSize:'12px', whiteSpace:'nowrap' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                              <td style={{ padding:'12px 14px', display:'flex', gap:'6px' }}>
                                <button className="btn btn-outline btn-sm" style={{ padding:'4px 8px', fontSize:'11px', display:'flex', alignItems:'center', gap:'4px' }} onClick={() => setDesignTicket({ ...r, parsed })}>
                                  <Eye size={12}/> Ticket
                                </button>
                                <button className="btn btn-danger btn-sm" onClick={()=>{ if(confirm('Delete this registration?')) deleteMdReg(r.id); }}>
                                  <Trash2 size={12}/>
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      {mdRegs.length === 0 && (
                        <tr><td colSpan={10} style={{ textAlign:'center', padding:'48px', color:'var(--text-muted)' }}>No registrations found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Quick link */}
              <div style={{ marginTop:'20px', padding:'16px', borderRadius:'12px', background:'rgba(234,88,12,0.06)', border:'1px solid rgba(234,88,12,0.2)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexWrap:'wrap' }}>
                <div style={{ fontSize:'13px' }}>
                  <span style={{ fontWeight:700, color:'#fb923c' }}>Registration Link: </span>
                  <span style={{ color:'var(--text-muted)' }}>/registration</span>
                </div>
                <a href="/registration" target="_blank" className="btn btn-outline" style={{ fontSize:'12px', display:'inline-flex', alignItems:'center', gap:'6px' }}>
                  Open Page ↗
                </a>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>

      {/* ═══ EVENT FORM MODAL ═══ */}
      {showEventForm && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowEventForm(false)}>
          <div className="modal" style={{ maxWidth:'680px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800 }}>
                {editingEvent ? t.admin.editEvent : t.admin.addEvent}
              </h2>
              <button onClick={() => setShowEventForm(false)} style={{
                background:'var(--border)', border:'1px solid var(--border)',
                borderRadius:'9px', width:'34px', height:'34px', display:'flex', alignItems:'center',
                justifyContent:'center', cursor:'pointer', color:'var(--text-primary)' }}><X size={15}/></button>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
              {[
                { key:'title', label:'Title (EN)', full:true },
                { key:'titleRu', label:'Title (RU)' },
                { key:'titleUz', label:'Title (UZ)' },
                { key:'date', label:t.admin.eventDate, type:'date' },
                { key:'time', label:t.admin.eventTime+' (start)', type:'time' },
                { key:'endTime', label:t.admin.eventTime+' (end)', type:'time' },
                { key:'organizer', label:t.admin.eventOrganizer },
                { key:'price', label:t.admin.eventPrice, type:'number' },
                { key:'image', label:t.admin.imageUrl, full:true, isImage: true },
                { key:'bgImage', label:'Background Image URL', full:true, isImage: true },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ gridColumn: f.full ? 'span 2' : 'span 1' }}>
                  <label className="form-label">{f.label}</label>
                  {f.isImage ? (
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input type="text" className="form-input" style={{ flex: 1 }}
                        value={eventForm[f.key]||''} onChange={e => setEventForm(p=>({...p,[f.key]:e.target.value}))} />
                      <label className="btn btn-outline" style={{ cursor: 'pointer', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleImageUpload(e, f.key)} disabled={isUploading} />
                      </label>
                    </div>
                  ) : f.type === 'date' ? (
                    <DatePicker 
                      value={eventForm[f.key]||''} 
                      onChange={val => setEventForm(p=>({...p,[f.key]:val}))} 
                    />
                  ) : f.type === 'time' ? (
                    <TimePicker 
                      value={eventForm[f.key]||''} 
                      onChange={val => setEventForm(p=>({...p,[f.key]:val}))} 
                    />
                  ) : (
                    <input type={f.type||'text'} className="form-input"
                      value={eventForm[f.key]||''} onChange={e => setEventForm(p=>({...p,[f.key]:e.target.value}))} />
                  )}
                </div>
              ))}

              <div className="form-group">
                <label className="form-label">{t.admin.eventCategory}</label>
                <CategoryPicker 
                  value={eventForm.category || ''} 
                  onChange={val => setEventForm(p=>({...p,category:val}))} 
                  placeholder="Select category"
                />
              </div>

              <div className="form-group" style={{ display:'flex', alignItems:'center', gap:'10px', flexDirection:'row', paddingTop:'20px' }}>
                <input type="checkbox" id="featured" checked={eventForm.featured}
                  onChange={e => setEventForm(p=>({...p,featured:e.target.checked}))}
                  style={{ width:'16px', height:'16px', accentColor:'#FFDD00', cursor:'pointer' }} />
                <label htmlFor="featured" style={{ fontSize:'13px', cursor:'pointer' }}>Featured event</label>
              </div>

              {[
                { key:'description', label:'Description (EN)' },
                { key:'descriptionRu', label:'Description (RU)' },
                { key:'descriptionUz', label:'Description (UZ)' },
              ].map(f => (
                <div key={f.key} className="form-group" style={{ gridColumn:'span 2' }}>
                  <label className="form-label">{f.label}</label>
                  <textarea className="form-textarea" value={eventForm[f.key]||''}
                    onChange={e => setEventForm(p=>({...p,[f.key]:e.target.value}))} rows={3} />
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'24px', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={() => setShowEventForm(false)}>{t.admin.cancel}</button>
              <button className="btn btn-primary" onClick={saveEvent}><Save size={14}/> {t.admin.save}</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ BLOCK EDIT MODAL ═══ */}
      {editingBlock && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setEditingBlock(null)}>
          <div className="modal" style={{ maxWidth:'500px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800 }}>
                {editingBlock === 'new' ? 'Add New Block' : `Edit Block ${blockForm.label}`}
              </h2>
              <button onClick={() => setEditingBlock(null)} style={{
                background:'var(--border)', border:'1px solid var(--border)',
                borderRadius:'9px', width:'34px', height:'34px', display:'flex', alignItems:'center',
                justifyContent:'center', cursor:'pointer', color:'var(--text-primary)' }}><X size={15}/></button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div className="form-group">
                <label className="form-label">Block Name / Label</label>
                <input type="text" className="form-input" maxLength={4}
                  value={blockForm.label}
                  onChange={e => setBlockForm(p => ({ ...p, label: e.target.value.toUpperCase(), id: p.id || e.target.value.toUpperCase() }))}
                  placeholder="e.g. A1, B2, VIP..." />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div className="form-group">
                  <label className="form-label">Number of Rows</label>
                  <input type="number" className="form-input" min={1} max={30}
                    value={blockForm.rows}
                    onChange={e => setBlockForm(p => ({ ...p, rows: Math.max(1,parseInt(e.target.value)||1) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Number of Columns</label>
                  <input type="number" className="form-input" min={1} max={30}
                    value={blockForm.cols}
                    onChange={e => setBlockForm(p => ({ ...p, cols: Math.max(1,parseInt(e.target.value)||1) }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ marginBottom: '12px' }}>
                  Position in Hall (Click grid coordinate to place this block)
                </label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(6, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                  gap: '6px',
                  background: 'rgba(0,0,0,0.2)',
                  border:'1px solid var(--border)',
                  padding: '12px',
                  borderRadius: '12px',
                  minHeight: '160px'
                }}>
                  {[1,2,3].map(row => (
                    [1,2,3,4,5,6].map(col => {
                      const isSelected = blockForm.gridRow === row && blockForm.gridCol === col;
                      const occupiedBy = currentBlocks.find(b => b.gridRow === row && b.gridCol === col && b.id !== blockForm.id);
                      return (
                        <div
                          key={`${row}-${col}`}
                          onClick={() => setBlockForm(p => ({ ...p, gridRow: row, gridCol: col }))}
                          style={{
                            background: isSelected ? 'rgba(255, 221, 0, 0.35)' : (occupiedBy ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)'),
                            border: isSelected ? '2px solid #ffffff' : (occupiedBy ? '1px solid rgba(239,68,68,0.3)' : '1px dashed rgba(255,255,255,0.15)'),
                            borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', padding: '6px 4px', textAlign: 'center', fontSize: '11px',
                            color: isSelected ? '#fff' : (occupiedBy ? '#fca5a5' : 'rgba(255,255,255,0.35)'), transition: 'all 0.2s',
                            fontWeight: isSelected ? 700 : 500
                          }}>
                          {occupiedBy ? (
                            <>
                              <span style={{ fontSize:'9px', opacity:0.6 }}>R{row} C{col}</span>
                              <span style={{ fontSize:'12px', fontWeight:800, marginTop:'2px', color: occupiedBy.isVip ? '#ffffff' : '#fca5a5' }}>{occupiedBy.label}</span>
                            </>
                          ) : (
                            <>R{row}<br/>C{col}</>
                          )}
                        </div>
                      );
                    })
                  ))}
                </div>
                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'8px', textAlign:'center' }}>
                  R1 = Front row (Near Scene) &nbsp;|&nbsp; R3 = Back row (Near Entrance)
                </div>
              </div>

              <label style={{ display:'flex', alignItems:'center', gap:'12px', cursor:'pointer',
                padding:'14px 16px', borderRadius:'10px',
                background: blockForm.isVip ? 'rgba(255, 221, 0, 0.35)' : 'rgba(255,255,255,0.03)',
                border: blockForm.isVip ? '1px solid rgba(255, 221, 0, 0.35)' : '1px solid rgba(255,255,255,0.07)',
                transition:'all 0.2s ease' }}>
                <input type="checkbox" checked={blockForm.isVip}
                  onChange={e => setBlockForm(p => ({ ...p, isVip: e.target.checked }))}
                  style={{ width:'18px', height:'18px', accentColor:'#FFDD00', cursor:'pointer' }} />
                <div>
                  <div style={{ fontSize:'14px', fontWeight:700, color: blockForm.isVip ? '#ffffff' : 'rgba(255,255,255,0.65)' }}>
                    👑 VIP Block
                  </div>
                  <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Seats appear in purple with higher pricing</div>
                </div>
              </label>
            </div>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'24px', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={() => setEditingBlock(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={saveBlock}
                disabled={!blockForm.label || blockForm.rows < 1 || blockForm.cols < 1}>
                <Check size={14}/> {editingBlock === 'new' ? 'Add Block' : 'Update Block'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONFIRM DELETE EVENT ═══ */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth:'380px', textAlign:'center' }}>
            <div style={{ fontSize:'48px', marginBottom:'16px' }}>🗑️</div>
            <h3 style={{ fontSize:'20px', fontWeight:800, marginBottom:'10px' }}>Delete Event?</h3>
            <p style={{ color:'var(--text-secondary)', marginBottom:'24px', fontSize:'14px' }}>This cannot be undone.</p>
            <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => { deleteEvent(confirmDelete); setConfirmDelete(null); }}>
                <Trash2 size={14}/> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ SECTION EDIT MODAL ═══ */}
      {editingSection && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setEditingSection(null)}>
          <div className="modal" style={{ maxWidth:'600px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800, textTransform: 'capitalize' }}>
                Edit {editingSection.type.replace('_', ' ')}
              </h2>
              <button onClick={() => setEditingSection(null)} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer' }}><X size={20}/></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {editingSection && Object.entries(editingSection.data || {}).map(([key, value]) => {
                const isImage = key.toLowerCase().includes('image');
                return (
                  <div key={key} className="form-group">
                    <label className="form-label" style={{ textTransform: 'capitalize' }}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </label>
                    {isImage ? (
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input type="text" className="form-input" style={{ flex: 1 }} value={value || ''}
                          onChange={e => setEditingSection(p => p ? { ...p, data: { ...(p.data || {}), [key]: e.target.value } } : p)} />
                        <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' }}>
                          {isUploading ? 'Uploading...' : 'Upload Image'}
                          <input type="file" accept="image/*" style={{ display: 'none' }} disabled={isUploading} onChange={async (e) => {
                            const file = e.target.files[0]; if (!file) return;
                            setIsUploading(true);
                            const { data } = await supabase.storage.from('events').upload(`${Math.random()}.${file.name.split('.').pop()}`, file);
                            if(data) {
                              const url = supabase.storage.from('events').getPublicUrl(data.path).data.publicUrl;
                              setEditingSection(p => p ? { ...p, data: { ...(p.data || {}), [key]: url } } : p);
                            }
                            setIsUploading(false);
                          }} />
                        </label>
                      </div>
                    ) : (
                      <textarea className="form-textarea" rows={typeof value === 'string' && value.length > 50 ? 3 : 1} value={value || ''}
                        onChange={e => setEditingSection(p => p ? { ...p, data: { ...(p.data || {}), [key]: e.target.value } } : p)} />
                    )}
                  </div>
                );
              })}
            </div>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'30px' }}>
              <button className="btn btn-ghost" onClick={() => setEditingSection(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                await supabase.from('page_sections').update({ data: editingSection.data }).eq('id', editingSection.id);
                setEditingSection(null);
                fetchCms();
              }}>
                <Save size={14}/> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══ PARTNERS MANAGER MODAL ═══ */}
      {activeCmsModal === 'partners' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setActiveCmsModal(null)}>
          <div className="modal" style={{ maxWidth:'580px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800, display:'flex', alignItems:'center', gap:'8px' }}>
                🤝 Partners & Brand Logos
              </h2>
              <button onClick={() => setActiveCmsModal(null)} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer' }}><X size={20}/></button>
            </div>

            {/* Add new partner form */}
            <div style={{ padding:'20px', borderRadius:'16px', background:'var(--bg-secondary)', border:'1px solid var(--border)', marginBottom:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>
              <div style={{ fontSize:'15px', fontWeight:800, color:'var(--text-primary)' }}>
                ➕ Add New Partner Logo
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>Brand Name</label>
                <input 
                  type="text" className="form-input" 
                  placeholder="e.g. Google, Samsung, Fast Education..."
                  value={newPartnerName} onChange={e => setNewPartnerName(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>Logo Image (Upload File or Paste URL)</label>
                <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                  <input 
                    type="text" className="form-input" style={{ flex:1 }} 
                    placeholder="https://... or click upload file button"
                    value={newPartnerLogo} onChange={e => setNewPartnerLogo(e.target.value)} 
                  />
                  <label className="btn btn-outline" style={{ cursor:'pointer', whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                    {isUploading ? 'Uploading...' : '📁 Upload File'}
                    <input type="file" accept="image/*" style={{ display:'none' }} disabled={isUploading} onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      setIsUploading(true);
                      try {
                        const fileExt = file.name.split('.').pop();
                        const fileName = `partner_${Math.random()}.${fileExt}`;
                        const { data, error } = await supabase.storage.from('events').upload(fileName, file);
                        if (error) throw error;
                        const publicUrl = supabase.storage.from('events').getPublicUrl(fileName).data.publicUrl;
                        setNewPartnerLogo(publicUrl);
                      } catch (err) {
                        console.error('Error uploading logo:', err);
                        alert('Error uploading logo image');
                      } finally {
                        setIsUploading(false);
                      }
                    }} />
                  </label>
                </div>
              </div>

              {newPartnerLogo && (
                <div style={{ display:'flex', alignItems:'center', gap:'12px', background:'var(--bg-card)', padding:'10px 14px', borderRadius:'12px', border:'1px solid var(--border)' }}>
                  <div style={{ width:'48px', height:'48px', borderRadius:'8px', background:'#ffffff', padding:'6px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)' }}>
                    <img src={newPartnerLogo} alt="Preview" style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} />
                  </div>
                  <div style={{ fontSize:'13px', color:'var(--text-secondary)' }}>
                    Logo image ready to add!
                  </div>
                </div>
              )}

              <button 
                className="btn btn-primary" 
                style={{ justifyContent:'center', padding:'12px', fontSize:'14px', marginTop:'4px' }} 
                onClick={() => {
                  if(!newPartnerName.trim() && !newPartnerLogo.trim()) return;
                  setCmsPartners(p => [...p, { id: Date.now(), name: newPartnerName.trim() || 'Partner', logo: newPartnerLogo }]);
                  setNewPartnerName('');
                  setNewPartnerLogo('');
                }}
              >
                <Plus size={16}/> Add Partner Brand
              </button>
            </div>

            {/* Existing Partners List */}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'280px', overflowY:'auto', paddingRight:'4px' }}>
              {cmsPartners.map((item, idx) => (
                <div key={item.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderRadius:'12px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontSize:'13px', fontWeight:700, color:'var(--text-muted)' }}>{idx + 1}.</span>
                    {item.logo ? (
                      <div style={{ width:'36px', height:'36px', borderRadius:'6px', background:'#ffffff', padding:'4px', display:'flex', alignItems:'center', justifyContent:'center', border:'1px solid var(--border)', overflow:'hidden' }}>
                        <img src={item.logo} alt={item.name} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', transform: item.scale ? `scale(${item.scale})` : 'none' }} />
                      </div>
                    ) : (
                      <span style={{ fontSize:'18px' }}>🏢</span>
                    )}
                    <span style={{ fontWeight:700, fontSize:'14px', color:'var(--text-primary)' }}>{item.name}</span>
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    <label style={{ fontSize:'11px', color:'var(--text-muted)', fontWeight:700 }}>Scale:</label>
                    <select
                      value={item.scale || 1.0}
                      onChange={e => {
                        const val = parseFloat(e.target.value);
                        setCmsPartners(list => list.map(p => p.id === item.id ? { ...p, scale: val } : p));
                      }}
                      style={{ padding:'4px 8px', borderRadius:'6px', border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontSize:'12px', fontWeight:700, cursor:'pointer' }}
                    >
                      <option value={1.0}>1.0x (Normal)</option>
                      <option value={1.25}>1.25x</option>
                      <option value={1.5}>1.5x</option>
                      <option value={1.75}>1.75x</option>
                      <option value={2.0}>2.0x (Large)</option>
                      <option value={2.5}>2.5x</option>
                      <option value={2.9}>2.9x (Huge)</option>
                      <option value={3.5}>3.5x</option>
                    </select>

                    <button className="btn btn-danger btn-sm" onClick={() => setCmsPartners(p => p.filter(x => x.id !== item.id))}>
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'24px', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={() => setActiveCmsModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { savePartners(cmsPartners); setActiveCmsModal(null); alert('Partners published to website live!'); }}>
                <Save size={14}/> Save Partners List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CASES & VIDEOS MANAGER MODAL ═══ */}
      {activeCmsModal === 'videos' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setActiveCmsModal(null)}>
          <div className="modal" style={{ maxWidth:'650px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800, display:'flex', alignItems:'center', gap:'8px' }}>
                🎬 Cases & Videos (YouTube / IG)
              </h2>
              <button onClick={() => setActiveCmsModal(null)} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer' }}><X size={20}/></button>
            </div>

            {/* Add New Video Form */}
            <div style={{ padding:'16px', borderRadius:'14px', background:'var(--bg-secondary)', border:'1px solid var(--border)', marginBottom:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ fontSize:'14px', fontWeight:800, color:'#FFDD00' }}>Add New Video Case</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <input type="text" className="form-input" placeholder="Title (e.g. Tech Summit)" value={newVideo.title} onChange={e => setNewVideo(p => ({ ...p, title: e.target.value }))} />
                <CategoryPicker 
                  value={newVideo.category} 
                  onChange={cat => setNewVideo(p => ({ ...p, category: cat }))} 
                  placeholder="Select Category"
                />
              </div>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <input type="text" className="form-input" style={{ flex:1 }} placeholder="YouTube / Instagram link or direct MP4 URL" value={newVideo.videoUrl} onChange={e => setNewVideo(p => ({ ...p, videoUrl: e.target.value }))} />
                <label className="btn btn-outline btn-sm" style={{ cursor:'pointer', whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:'4px', flexShrink:0 }}>
                  {isUploading ? 'Uploading...' : '📁 Upload MP4'}
                  <input type="file" accept="video/*" style={{ display:'none' }} disabled={isUploading} onChange={async (e) => {
                    const file = e.target.files[0]; if (!file) return;
                    setIsUploading(true);
                    try {
                      const fileExt = file.name.split('.').pop();
                      const fileName = `video_${Math.random()}.${fileExt}`;
                      const { data, error } = await supabase.storage.from('events').upload(fileName, file);
                      if (error) throw error;
                      const publicUrl = supabase.storage.from('events').getPublicUrl(fileName).data.publicUrl;
                      setNewVideo(p => ({ ...p, videoUrl: publicUrl }));
                    } catch (err) {
                      console.error('Error uploading video:', err);
                      alert('Error uploading video file');
                    } finally {
                      setIsUploading(false);
                    }
                  }} />
                </label>
              </div>
              <input type="text" className="form-input" placeholder="Thumbnail Image URL (Optional)" value={newVideo.image} onChange={e => setNewVideo(p => ({ ...p, image: e.target.value }))} />
              <button className="btn btn-primary btn-sm" style={{ alignSelf:'flex-end' }} onClick={() => {
                if(!newVideo.title.trim() || !newVideo.videoUrl.trim()) return;
                setCmsVideos(p => [...p, { id: Date.now(), ...newVideo }]);
                setNewVideo({ title: '', category: 'Conference', videoUrl: '', image: '' });
              }}>
                <Plus size={14}/> Add Video Case
              </button>
            </div>

            {/* Videos List */}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'280px', overflowY:'auto' }}>
              {cmsVideos.map(vid => (
                <div key={vid.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 16px', borderRadius:'12px', background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'14px' }}>{vid.title}</div>
                    <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>{vid.category} &bull; {vid.videoUrl}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => setCmsVideos(p => p.filter(x => x.id !== vid.id))}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'24px', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={() => setActiveCmsModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { saveCmsVideos(cmsVideos); setActiveCmsModal(null); alert('Videos published to website live!'); }}>
                <Save size={14}/> Save Videos List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ CONTACTS EDITOR MODAL ═══ */}
      {activeCmsModal === 'contacts' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setActiveCmsModal(null)}>
          <div className="modal" style={{ maxWidth:'600px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800, display:'flex', alignItems:'center', gap:'8px' }}>
                📞 Edit Contacts & Working Hours
              </h2>
              <button onClick={() => setActiveCmsModal(null)} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer' }}><X size={20}/></button>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div className="form-group">
                <label className="form-label">Physical Address</label>
                <input type="text" className="form-input" value={cmsContacts.address} onChange={e => setCmsContacts(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div className="form-group">
                  <label className="form-label">Phone 1</label>
                  <input type="text" className="form-input" value={cmsContacts.phone1} onChange={e => setCmsContacts(p => ({ ...p, phone1: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone 2</label>
                  <input type="text" className="form-input" value={cmsContacts.phone2} onChange={e => setCmsContacts(p => ({ ...p, phone2: e.target.value }))} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div className="form-group">
                  <label className="form-label">Email 1</label>
                  <input type="text" className="form-input" value={cmsContacts.email1} onChange={e => setCmsContacts(p => ({ ...p, email1: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email 2</label>
                  <input type="text" className="form-input" value={cmsContacts.email2} onChange={e => setCmsContacts(p => ({ ...p, email2: e.target.value }))} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div className="form-group">
                  <label className="form-label">Working Hours (Mon-Sat)</label>
                  <input type="text" className="form-input" value={cmsContacts.hoursWeek} onChange={e => setCmsContacts(p => ({ ...p, hoursWeek: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Working Hours (Sunday)</label>
                  <input type="text" className="form-input" value={cmsContacts.hoursSun} onChange={e => setCmsContacts(p => ({ ...p, hoursSun: e.target.value }))} />
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'24px', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={() => setActiveCmsModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { saveCmsContacts(cmsContacts); setActiveCmsModal(null); alert('Contacts updated on website live!'); }}>
                <Save size={14}/> Save Contact Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FAQ MANAGER MODAL ═══ */}
      {activeCmsModal === 'faq' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setActiveCmsModal(null)}>
          <div className="modal" style={{ maxWidth:'640px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800, display:'flex', alignItems:'center', gap:'8px' }}>
                ❓ FAQ Questions & Answers
              </h2>
              <button onClick={() => setActiveCmsModal(null)} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer' }}><X size={20}/></button>
            </div>

            {/* Add New FAQ Form */}
            <div style={{ padding:'16px', borderRadius:'14px', background:'var(--bg-secondary)', border:'1px solid var(--border)', marginBottom:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
              <div style={{ fontSize:'14px', fontWeight:800, color:'#FFDD00' }}>Add New Q&A Item</div>
              <input type="text" className="form-input" placeholder="Question (e.g. What is included in the rental?)" value={newFaq.question} onChange={e => setNewFaq(p => ({ ...p, question: e.target.value }))} />
              <textarea className="form-textarea" rows={2} placeholder="Answer details..." value={newFaq.answer} onChange={e => setNewFaq(p => ({ ...p, answer: e.target.value }))} />
              <button className="btn btn-primary btn-sm" style={{ alignSelf:'flex-end' }} onClick={() => {
                if(!newFaq.question.trim() || !newFaq.answer.trim()) return;
                setCmsFaq(p => [...p, { id: Date.now(), ...newFaq }]);
                setNewFaq({ question: '', answer: '' });
              }}>
                <Plus size={14}/> Add FAQ Pair
              </button>
            </div>

            {/* FAQ List */}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'280px', overflowY:'auto' }}>
              {cmsFaq.map(item => (
                <div key={item.id} style={{ padding:'12px 16px', borderRadius:'12px', background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'12px' }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'14px' }}>{item.question}</div>
                    <div style={{ fontSize:'12px', color:'var(--text-secondary)', marginTop:'4px' }}>{item.answer}</div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={() => setCmsFaq(p => p.filter(x => x.id !== item.id))}>
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', marginTop:'24px', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={() => setActiveCmsModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { saveCmsFaq(cmsFaq); setActiveCmsModal(null); alert('FAQ accordion updated on website live!'); }}>
                <Save size={14}/> Save FAQ Accordion
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ═══ OUR HALLS CARDS MANAGER MODAL ═══ */}
      {activeCmsModal === 'halls' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setActiveCmsModal(null)}>
          <div className="modal" style={{ maxWidth:'720px', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800, display:'flex', alignItems:'center', gap:'8px' }}>
                🏰 Edit Our Halls & Rental Cards
              </h2>
              <button onClick={() => setActiveCmsModal(null)} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer' }}><X size={20}/></button>
            </div>

            <p style={{ fontSize:'13px', color:'var(--text-secondary)', marginBottom:'20px' }}>
              Upload new cover pictures, change prices, titles, capacity, and surface area (m²) for all hall cards displayed on your homepage.
            </p>

            {/* Halls List Editor */}
            <div style={{ display:'flex', flexDirection:'column', gap:'20px', marginBottom:'24px' }}>
              {cmsHalls.map((hall, idx) => (
                <div key={hall.id || idx} style={{ padding:'20px', borderRadius:'16px', background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontWeight:800, fontSize:'16px', color:'#FFDD00', display:'flex', alignItems:'center', gap:'8px' }}>
                      <span>Hall #{idx + 1}:</span>
                      <span style={{ color:'var(--text-primary)' }}>{hall.title || 'Untitled Hall'}</span>
                    </div>
                    <button className="btn btn-danger btn-sm" onClick={() => setCmsHalls(h => h.filter((_, i) => i !== idx))}>
                      <Trash2 size={13}/> Remove Card
                    </button>
                  </div>

                  {/* Hall Image Uploader & Preview */}
                  <div className="form-group">
                    <label className="form-label">Cover Photo (Upload Picture or Paste URL)</label>
                    <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                      <div style={{ width:'80px', height:'60px', borderRadius:'10px', overflow:'hidden', background:'#000', border:'1px solid var(--border)', flexShrink:0, position:'relative' }}>
                        {hall.image ? (
                          <img src={hall.image} alt="Cover" style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                        ) : (
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'var(--text-muted)', fontSize:'11px' }}>No Image</div>
                        )}
                      </div>
                      <input 
                        type="text" className="form-input" style={{ flex:1 }} 
                        placeholder="Image URL (https://...)" 
                        value={hall.image || ''} 
                        onChange={e => {
                          const val = e.target.value;
                          setCmsHalls(h => h.map((item, i) => i === idx ? { ...item, image: val } : item));
                        }} 
                      />
                      <label className="btn btn-outline" style={{ cursor:'pointer', whiteSpace:'nowrap', display:'inline-flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                        {isUploading ? 'Uploading...' : '📁 Upload Picture'}
                        <input type="file" accept="image/*" style={{ display:'none' }} disabled={isUploading} onChange={async (e) => {
                          const file = e.target.files[0]; if (!file) return;
                          setIsUploading(true);
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `hall_${Math.random()}.${fileExt}`;
                            const { data, error } = await supabase.storage.from('events').upload(fileName, file);
                            if (error) throw error;
                            const publicUrl = supabase.storage.from('events').getPublicUrl(fileName).data.publicUrl;
                            setCmsHalls(h => h.map((item, i) => i === idx ? { ...item, image: publicUrl } : item));
                          } catch (err) {
                            console.error('Error uploading image:', err);
                            alert('Error uploading picture');
                          } finally {
                            setIsUploading(false);
                          }
                        }} />
                      </label>
                    </div>
                  </div>

                  {/* Additional Gallery Photos */}
                  <div className="form-group" style={{ marginTop:'6px' }}>
                    <label className="form-label">Hall Photo Gallery (Multiple Photos for Detail Page)</label>
                    
                    {/* Gallery Thumbnails List */}
                    <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'10px' }}>
                      {(hall.images || []).map((imgUrl, imgIdx) => (
                        <div key={imgIdx} style={{ position:'relative', width:'90px', height:'65px', borderRadius:'10px', overflow:'hidden', border:'1px solid var(--border)', background:'#000' }}>
                          <img src={imgUrl} alt={`Gallery ${imgIdx + 1}`} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                          <button 
                            type="button"
                            onClick={() => {
                              setCmsHalls(h => h.map((item, i) => i === idx ? {
                                ...item,
                                images: (item.images || []).filter((_, gIdx) => gIdx !== imgIdx)
                              } : item));
                            }}
                            style={{
                              position:'absolute', top:'4px', right:'4px',
                              background:'rgba(239,68,68,0.9)', color:'#fff', border:'none',
                              borderRadius:'50%', width:'20px', height:'20px',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              cursor:'pointer'
                            }}
                            title="Remove Photo"
                          >
                            <X size={12}/>
                          </button>
                        </div>
                      ))}
                      {(hall.images || []).length === 0 && (
                        <div style={{ fontSize:'12px', color:'var(--text-muted)', fontStyle:'italic' }}>No gallery photos added yet. Upload photos below!</div>
                      )}
                    </div>

                    {/* Upload Gallery Photo Button */}
                    <div style={{ display:'flex', gap:'10px' }}>
                      <label className="btn btn-outline btn-sm" style={{ cursor:'pointer', display:'inline-flex', alignItems:'center', gap:'6px' }}>
                        <Plus size={14}/> {isUploading ? 'Uploading...' : '📁 Upload Gallery Photo'}
                        <input type="file" accept="image/*" style={{ display:'none' }} disabled={isUploading} onChange={async (e) => {
                          const file = e.target.files[0]; if (!file) return;
                          setIsUploading(true);
                          try {
                            const fileExt = file.name.split('.').pop();
                            const fileName = `hall_gallery_${Math.random()}.${fileExt}`;
                            const { data, error } = await supabase.storage.from('events').upload(fileName, file);
                            if (error) throw error;
                            const publicUrl = supabase.storage.from('events').getPublicUrl(fileName).data.publicUrl;
                            setCmsHalls(h => h.map((item, i) => i === idx ? {
                              ...item,
                              images: [...(item.images || []), publicUrl]
                            } : item));
                          } catch (err) {
                            console.error('Error uploading gallery photo:', err);
                            alert('Error uploading picture');
                          } finally {
                            setIsUploading(false);
                          }
                        }} />
                      </label>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <div className="form-group">
                      <label className="form-label">Hall Title</label>
                      <input type="text" className="form-input" value={hall.title || ''} onChange={e => {
                        const val = e.target.value;
                        setCmsHalls(h => h.map((item, i) => i === idx ? { ...item, title: val } : item));
                      }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Price per Hour</label>
                      <input type="text" className="form-input" value={hall.price || ''} onChange={e => {
                        const val = e.target.value;
                        setCmsHalls(h => h.map((item, i) => i === idx ? { ...item, price: val } : item));
                      }} />
                    </div>
                  </div>

                  {/* Capacity & Area */}
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                    <div className="form-group">
                      <label className="form-label">Capacity (e.g. 35-200 people)</label>
                      <input type="text" className="form-input" value={hall.capacity || ''} onChange={e => {
                        const val = e.target.value;
                        setCmsHalls(h => h.map((item, i) => i === idx ? { ...item, capacity: val } : item));
                      }} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Surface Area (e.g. 177 m²)</label>
                      <input type="text" className="form-input" value={hall.area || ''} onChange={e => {
                        const val = e.target.value;
                        setCmsHalls(h => h.map((item, i) => i === idx ? { ...item, area: val } : item));
                      }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add New Hall Card Button */}
            <button 
              className="btn btn-outline" 
              style={{ width:'100%', justifyContent:'center', padding:'12px', marginBottom:'24px' }}
              onClick={() => {
                setCmsHalls(h => [
                  ...h,
                  {
                    id: String(Date.now()),
                    title: "New Conference Space",
                    capacity: "20-100 people",
                    area: "120 m²",
                    price: "1,000,000 UZS / hour",
                    image: "https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80",
                    description: "Modern, fully-equipped hall for corporate events and meetings."
                  }
                ]);
              }}
            >
              <Plus size={16}/> Add New Hall Card
            </button>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={() => setActiveCmsModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => { saveHallsList(cmsHalls); setActiveCmsModal(null); alert('Halls cards updated on website live!'); }}>
                <Save size={14}/> Save Our Halls Cards
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ OUR ADVANTAGES MANAGER MODAL ═══ */}
      {activeCmsModal === 'advantages' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setActiveCmsModal(null)}>
          <div className="modal" style={{ maxWidth:'680px', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800, display:'flex', alignItems:'center', gap:'8px' }}>
                🌟 Our Advantages Carousel
              </h2>
              <button onClick={() => setActiveCmsModal(null)} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer' }}><X size={20}/></button>
            </div>

            {/* Add new advantage card */}
            <div style={{ padding:'20px', borderRadius:'16px', background:'var(--bg-secondary)', border:'1px solid var(--border)', marginBottom:'24px', display:'flex', flexDirection:'column', gap:'16px' }}>
              <div style={{ fontSize:'15px', fontWeight:800, color:'var(--text-primary)' }}>
                ➕ Add New Advantage Slide
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>Advantage Label / Title</label>
                <input 
                  type="text" className="form-input" 
                  placeholder="e.g. State-of-the-art technologies, High-level service..."
                  value={newAdvLabel} onChange={e => setNewAdvLabel(e.target.value)} 
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'6px' }}>Slide Image (Upload File or Paste URL)</label>
                <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                  <input 
                    type="text" className="form-input" style={{ flex:1 }} 
                    placeholder="https://images.unsplash.com/..."
                    value={newAdvImage} onChange={e => setNewAdvImage(e.target.value)} 
                  />
                  <label className="btn btn-outline" style={{ cursor:'pointer', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:'6px' }}>
                    <Plus size={14}/> {isUploading ? 'Uploading...' : 'Upload Image'}
                    <input type="file" accept="image/*" style={{ display:'none' }} disabled={isUploading} onChange={async (e) => {
                      const file = e.target.files[0]; if (!file) return;
                      setIsUploading(true);
                      const { data } = await supabase.storage.from('events').upload(`adv_${Math.random()}.${file.name.split('.').pop()}`, file);
                      if (data) {
                        const url = supabase.storage.from('events').getPublicUrl(data.path).data.publicUrl;
                        setNewAdvImage(url);
                      }
                      setIsUploading(false);
                    }} />
                  </label>
                </div>
              </div>

              <button 
                className="btn btn-primary" 
                disabled={!newAdvLabel}
                onClick={() => {
                  const item = { id: Date.now(), label: newAdvLabel, image: newAdvImage || 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80' };
                  setCmsAdvantages(prev => [...prev, item]);
                  setNewAdvLabel('');
                  setNewAdvImage('');
                }}
              >
                <Plus size={14}/> Add Slide to Carousel
              </button>
            </div>

            {/* List of advantage slides */}
            <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'24px' }}>
              {cmsAdvantages.map((adv, idx) => (
                <div key={adv.id || idx} style={{ padding:'16px', borderRadius:'14px', background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', gap:'16px', alignItems:'center' }}>
                  {adv.image && (
                    <img src={adv.image} alt={adv.label} style={{ width:'80px', height:'60px', borderRadius:'10px', objectFit:'cover' }} />
                  )}
                  <div style={{ flex:1 }}>
                    <div className="form-group" style={{ marginBottom:'8px' }}>
                      <label className="form-label" style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)' }}>Slide #{idx+1} Label</label>
                      <input 
                        type="text" className="form-input" style={{ fontSize:'13px' }}
                        value={adv.label} 
                        onChange={e => {
                          const updated = [...cmsAdvantages];
                          updated[idx].label = e.target.value;
                          setCmsAdvantages(updated);
                        }} 
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom:0 }}>
                      <label className="form-label" style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)' }}>Image URL (Upload or Paste)</label>
                      <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                        <input 
                          type="text" className="form-input" style={{ fontSize:'12px', flex:1 }}
                          value={adv.image} 
                          onChange={e => {
                            const updated = [...cmsAdvantages];
                            updated[idx].image = e.target.value;
                            setCmsAdvantages(updated);
                          }} 
                        />
                        <label className="btn btn-outline btn-sm" style={{ cursor:'pointer', whiteSpace:'nowrap', fontSize:'11px' }}>
                          Upload
                          <input type="file" accept="image/*" style={{ display:'none' }} disabled={isUploading} onChange={async (e) => {
                            const file = e.target.files[0]; if (!file) return;
                            setIsUploading(true);
                            const { data } = await supabase.storage.from('events').upload(`adv_${Math.random()}.${file.name.split('.').pop()}`, file);
                            if (data) {
                              const url = supabase.storage.from('events').getPublicUrl(data.path).data.publicUrl;
                              const updated = [...cmsAdvantages];
                              updated[idx].image = url;
                              setCmsAdvantages(updated);
                            }
                            setIsUploading(false);
                          }} />
                        </label>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="btn btn-danger btn-sm" 
                    onClick={() => setCmsAdvantages(prev => prev.filter((_, i) => i !== idx))}
                  >
                    <Trash2 size={14}/>
                  </button>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={() => setActiveCmsModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                await saveCmsAdvantages(cmsAdvantages);
                setActiveCmsModal(null);
                alert('🌟 Our Advantages carousel updated live!');
              }}>
                <Save size={14}/> Save Changes Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ LIVE ANNOUNCEMENT & PROMO BANNER MODAL ═══ */}
      {activeCmsModal === 'announcement' && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setActiveCmsModal(null)}>
          <div className="modal" style={{ maxWidth:'680px', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
              <h2 style={{ fontSize:'20px', fontWeight:800, display:'flex', alignItems:'center', gap:'8px' }}>
                📢 Live Announcement & Promo Banner
              </h2>
              <button onClick={() => setActiveCmsModal(null)} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer' }}><X size={20}/></button>
            </div>

            {/* Toggle Banner ON / OFF */}
            <div style={{ padding:'16px 20px', borderRadius:'14px', background:'var(--bg-secondary)', border:'1px solid var(--border)', marginBottom:'20px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:'15px', fontWeight:800, color:'var(--text-primary)' }}>
                  Banner Status
                </div>
                <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>
                  {cmsAnnouncement.enabled !== false ? 'Banner is currently visible at the bottom of the website' : 'Banner is hidden'}
                </div>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={cmsAnnouncement.enabled !== false}
                  onChange={e => setCmsAnnouncement(p => ({ ...p, enabled: e.target.checked }))}
                  style={{ width:'20px', height:'20px', accentColor:'#10b981', cursor:'pointer' }}
                />
                <span style={{ fontWeight:800, fontSize:'14px', color: cmsAnnouncement.enabled !== false ? '#10b981' : '#64748b' }}>
                  {cmsAnnouncement.enabled !== false ? 'LIVE ON' : 'OFF'}
                </span>
              </label>
            </div>

            {/* Form Fields */}
            <div style={{ display:'flex', flexDirection:'column', gap:'16px', marginBottom:'24px' }}>
              
              <div className="form-group">
                <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Top Badge Text</label>
                <input 
                  type="text" className="form-input" 
                  placeholder="e.g. 🔥 Special Announcement, Grand Hall Premier Venue..."
                  value={cmsAnnouncement.badge || ''}
                  onChange={e => setCmsAnnouncement(p => ({ ...p, badge: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Main Title / Heading</label>
                <input 
                  type="text" className="form-input" 
                  placeholder="e.g. KEYINGI TADBIRINGIZ UCHUN ZAL VA CHIPTALARNI TOPING..."
                  value={cmsAnnouncement.title || ''}
                  onChange={e => setCmsAnnouncement(p => ({ ...p, title: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Description / Paragraph</label>
                <textarea 
                  className="form-textarea" rows={3}
                  placeholder="Describe your announcement or promotional offer..."
                  value={cmsAnnouncement.desc || ''}
                  onChange={e => setCmsAnnouncement(p => ({ ...p, desc: e.target.value }))}
                />
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Primary Button Text</label>
                  <input 
                    type="text" className="form-input" 
                    value={cmsAnnouncement.btnPrimaryText || ''}
                    onChange={e => setCmsAnnouncement(p => ({ ...p, btnPrimaryText: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Primary Button Link</label>
                  <input 
                    type="text" className="form-input" 
                    value={cmsAnnouncement.btnPrimaryLink || ''}
                    onChange={e => setCmsAnnouncement(p => ({ ...p, btnPrimaryLink: e.target.value }))}
                  />
                </div>
              </div>

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Secondary Button Text</label>
                  <input 
                    type="text" className="form-input" 
                    value={cmsAnnouncement.btnSecondaryText || ''}
                    onChange={e => setCmsAnnouncement(p => ({ ...p, btnSecondaryText: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Secondary Button Link</label>
                  <input 
                    type="text" className="form-input" 
                    value={cmsAnnouncement.btnSecondaryLink || ''}
                    onChange={e => setCmsAnnouncement(p => ({ ...p, btnSecondaryLink: e.target.value }))}
                  />
                </div>
              </div>

              {/* Showcase Card Fields */}
              <div style={{ padding:'18px', borderRadius:'14px', background:'var(--bg-secondary)', border:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:'12px' }}>
                <div style={{ fontSize:'14px', fontWeight:800, color:'var(--text-primary)' }}>
                  🃏 Showcase Card Details (Right Side)
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)' }}>Card Title</label>
                  <input 
                    type="text" className="form-input" style={{ fontSize:'13px' }}
                    value={cmsAnnouncement.cardTitle || ''}
                    onChange={e => setCmsAnnouncement(p => ({ ...p, cardTitle: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)' }}>Card Specs / Subtitle</label>
                  <input 
                    type="text" className="form-input" style={{ fontSize:'13px' }}
                    value={cmsAnnouncement.cardSubtitle || ''}
                    onChange={e => setCmsAnnouncement(p => ({ ...p, cardSubtitle: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)' }}>Card Price / Tag</label>
                  <input 
                    type="text" className="form-input" style={{ fontSize:'13px' }}
                    value={cmsAnnouncement.cardPrice || ''}
                    onChange={e => setCmsAnnouncement(p => ({ ...p, cardPrice: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize:'11px', fontWeight:700, color:'var(--text-muted)' }}>Card Cover Image (Upload File or Paste URL)</label>
                  <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                    <input 
                      type="text" className="form-input" style={{ flex:1, fontSize:'12px' }}
                      value={cmsAnnouncement.cardImage || ''}
                      onChange={e => setCmsAnnouncement(p => ({ ...p, cardImage: e.target.value }))}
                    />
                    <label className="btn btn-outline btn-sm" style={{ cursor:'pointer', whiteSpace:'nowrap', fontSize:'11px', display:'flex', alignItems:'center', gap:'4px' }}>
                      Upload
                      <input type="file" accept="image/*" style={{ display:'none' }} disabled={isUploading} onChange={async (e) => {
                        const file = e.target.files[0]; if (!file) return;
                        setIsUploading(true);
                        const { data } = await supabase.storage.from('events').upload(`ann_${Math.random()}.${file.name.split('.').pop()}`, file);
                        if (data) {
                          const url = supabase.storage.from('events').getPublicUrl(data.path).data.publicUrl;
                          setCmsAnnouncement(p => ({ ...p, cardImage: url }));
                        }
                        setIsUploading(false);
                      }} />
                    </label>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontSize:'12px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>Ticker Tape Scrolling Text</label>
                <input 
                  type="text" className="form-input" 
                  value={cmsAnnouncement.tickerText || ''}
                  onChange={e => setCmsAnnouncement(p => ({ ...p, tickerText: e.target.value }))}
                />
              </div>

            </div>

            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end', paddingTop:'16px', borderTop:'1px solid var(--border)' }}>
              <button className="btn btn-ghost" onClick={() => setActiveCmsModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={async () => {
                await saveCmsAnnouncement(cmsAnnouncement);
                setActiveCmsModal(null);
                alert('📢 Live Announcement Banner updated!');
              }}>
                <Save size={14}/> Save Announcement Live
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TICKET DESIGNER MODAL ═══ */}
      {designTicket && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDesignTicket(null)}>
          <div className="modal" style={{ maxWidth: '640px', background: 'var(--bg-primary)', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  🎟️ Interactive Ticket Designer
                </h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customize theme and preview attendee event pass</p>
              </div>
              <button onClick={() => setDesignTicket(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Attendee Selector */}
            {mdRegs.length > 0 && (
              <div style={{ marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Select Ticket:</span>
                <select
                  className="form-input"
                  style={{ flex: 1, fontSize: '13px', background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                  value={designTicket?.id || ''}
                  onChange={e => {
                    const found = mdRegs.find(r => r.id === e.target.value);
                    if (found) setDesignTicket({ ...found, parsed: parseTicketId(found.ticket_id) });
                  }}
                >
                  {mdRegs.map(r => {
                    const p = parseTicketId(r.ticket_id);
                    return (
                      <option key={r.id} value={r.id}>
                        {r.first_name} {r.last_name} — {p.movieTitle} ({p.code})
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Theme Selector */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>Theme:</span>
              {[
                { id: 'gold', label: '✨ Gold Luxury', bg: 'linear-gradient(135deg, #1c1917, #292524)', border: '#FFDD00', text: '#FFDD00' },
                { id: 'dark', label: '🌙 Dark VIP', bg: 'linear-gradient(135deg, #09090b, #18181b)', border: '#ea580c', text: '#fb923c' },
                { id: 'neon', label: '⚡ Cyber Neon', bg: 'linear-gradient(135deg, #020617, #0f172a)', border: '#38bdf8', text: '#38bdf8' },
                { id: 'light', label: '☀️ Minimal Light', bg: '#ffffff', border: '#e2e8f0', text: '#0f172a' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setTicketDesignTheme(t.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: ticketDesignTheme === t.id ? `2px solid ${t.border}` : '1px solid var(--border)',
                    background: ticketDesignTheme === t.id ? 'rgba(255, 221, 0, 0.15)' : 'var(--bg-secondary)',
                    color: ticketDesignTheme === t.id ? 'var(--text-accent)' : 'var(--text-secondary)'
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Live Ticket Pass Badge */}
            <div id={`design-ticket-${designTicket.id}`} style={{
              borderRadius: '20px',
              padding: '24px',
              border: ticketDesignTheme === 'gold' ? '2px solid rgba(255, 221, 0, 0.5)' : ticketDesignTheme === 'dark' ? '2px solid rgba(234, 88, 12, 0.5)' : ticketDesignTheme === 'neon' ? '2px solid rgba(56, 189, 248, 0.5)' : '1px solid #cbd5e1',
              background: ticketDesignTheme === 'gold' ? 'linear-gradient(135deg, #181507 0%, #0a0802 100%)' : ticketDesignTheme === 'dark' ? 'linear-gradient(135deg, #1c0d02 0%, #0a0501 100%)' : ticketDesignTheme === 'neon' ? 'linear-gradient(135deg, #031329 0%, #010814 100%)' : '#ffffff',
              color: ticketDesignTheme === 'light' ? '#0f172a' : '#ffffff',
              boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: ticketDesignTheme === 'gold' ? '#FFDD00' : ticketDesignTheme === 'dark' ? '#fb923c' : ticketDesignTheme === 'neon' ? '#38bdf8' : '#475569' }}>
                    OFFICIAL ENTRY PASS
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: 900, marginTop: '4px', lineHeight: 1.2 }}>
                    {designTicket.parsed?.movieTitle || 'Movie Day 2026'}
                  </h3>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'monospace', padding: '4px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {designTicket.parsed?.code || designTicket.ticket_id}
                </div>
              </div>

              <div style={{ height: '1px', background: 'currentColor', opacity: 0.15, margin: '14px 0' }} />

              {/* Grid details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>ATTENDEE NAME</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '2px' }}>{designTicket.first_name} {designTicket.last_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>PHONE</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '2px' }}>{designTicket.phone}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>BRANCH</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>{designTicket.branch}</div>
                </div>
                <div>
                  <div style={{ fontSize: '10px', opacity: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>ENGLISH LEVEL</div>
                  <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px' }}>{designTicket.english_level}</div>
                </div>
              </div>

              {/* Reserved Seat Highlight */}
              <div style={{
                padding: '12px 16px',
                borderRadius: '12px',
                background: ticketDesignTheme === 'gold' ? 'rgba(255, 221, 0, 0.15)' : ticketDesignTheme === 'dark' ? 'rgba(234, 88, 12, 0.15)' : ticketDesignTheme === 'neon' ? 'rgba(56, 189, 248, 0.15)' : '#f1f5f9',
                border: '1px solid currentColor',
                opacity: 0.9,
                display: 'flex',
                alignItems: 'center',
                justify: 'space-between',
                marginBottom: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em' }}>RESERVED SEAT</div>
                  <div style={{ fontSize: '18px', fontWeight: 900 }}>{designTicket.seat || 'General Admission'}</div>
                </div>
                <div style={{ fontSize: '11px', fontWeight: 700 }}>
                  Oxford Grand Conference Hall
                </div>
              </div>

              {/* QR Code section */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px dashed currentColor', opacity: 0.85 }}>
                <div style={{ fontSize: '11px' }}>
                  <div>Scan QR at hall entrance</div>
                  <div style={{ opacity: 0.6, fontSize: '10px' }}>{new Date(designTicket.created_at).toLocaleDateString()}</div>
                </div>
                <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px' }}>
                  <QRCodeSVG
                    value={JSON.stringify({ id: designTicket.ticket_id, name: `${designTicket.first_name} ${designTicket.last_name}`, seat: designTicket.seat, movie: designTicket.parsed?.movieTitle })}
                    size={64}
                    bgColor="#ffffff"
                    fgColor="#000000"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button className="btn btn-outline" onClick={() => {
                const el = document.getElementById(`design-ticket-${designTicket.id}`);
                if (!el) return;
                const win = window.open('', '_blank');
                win.document.write(`<html><head><title>Print Pass ${designTicket.ticket_id}</title></head><body style="background:#000;display:flex;justify-content:center;padding:40px;">${el.outerHTML}<script>setTimeout(()=>{window.print();window.close();},500);</script></body></html>`);
                win.document.close();
              }} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Printer size={14} /> Print Pass
              </button>
              <button className="btn btn-primary" onClick={() => setDesignTicket(null)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EVENT MANAGEMENT WORKSPACE MODAL ═══ */}
      {selectedWorkspaceEvent && (
        <EventWorkspaceModal
          event={selectedWorkspaceEvent}
          onClose={() => setSelectedWorkspaceEvent(null)}
          mdRegs={mdRegs}
          loadMdRegs={loadMdRegs}
          deleteMdReg={deleteMdReg}
        />
      )}
    </div>
  );
}
