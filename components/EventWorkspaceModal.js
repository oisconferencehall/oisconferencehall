'use client';
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Users, Ticket, Palette, BarChart3, 
  X, Printer, RotateCcw, Search, Film, Check, Trash2, ArrowLeft, Copy, Download
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import TicketDesignerStudio from './TicketDesignerStudio';

export default function EventWorkspaceModal({ event, onClose, mdRegs = [], loadMdRegs, deleteMdReg }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [copiedLink, setCopiedLink] = useState(false);

  const eventTitleLower = (event?.title || '').toLowerCase();
  const eventSlug = eventTitleLower.replace(/[^a-z0-9]+/g, '-');

  // Filter registrations specifically for this event
  const eventRegs = mdRegs.filter(r => {
    const rawId = (r.ticket_id || '').toLowerCase();
    const branchName = (r.branch || '').toLowerCase();
    return rawId.includes(eventSlug) || rawId.includes(eventTitleLower) || branchName.includes(eventTitleLower);
  });

  const filteredRegs = eventRegs.filter(r => {
    if (branchFilter !== 'all' && r.branch !== branchFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const name = `${r.first_name || ''} ${r.last_name || ''}`.toLowerCase();
      const phone = (r.phone || '').toLowerCase();
      const ticket = (r.ticket_id || '').toLowerCase();
      if (!name.includes(q) && !phone.includes(q) && !ticket.includes(q)) return false;
    }
    return true;
  });

  // Calculate statistics
  const totalRevenue = eventRegs.length * (event.price || 0);
  const fastEduCount = eventRegs.filter(r => r.branch === 'Fast Education').length;
  const oxfordCount = eventRegs.filter(r => r.branch === 'Oxford International School').length;

  const handleCopyLink = () => {
    const link = `${window.location.origin}/registration?eventId=${event.id}&source=admin`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const exportCSV = () => {
    const rows = [['Ticket ID','Event','First Name','Last Name','Phone','Level','Branch','Seat','Registered']];
    eventRegs.forEach(r => {
      rows.push([r.ticket_id, event.title, r.first_name, r.last_name, r.phone, r.english_level, r.branch, r.seat||'', new Date(r.created_at).toLocaleString()]);
    });
    const csv = rows.map(r => r.map(c => `"${(c||'').replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `${eventSlug}_attendees.csv`;
    a.click();
  };

  const handlePrintAllTicketsA4 = async () => {
    const targetRegs = eventRegs.length > 0 ? eventRegs : mdRegs;
    if (targetRegs.length === 0) {
      alert('No registrations found for this event to print.');
      return;
    }

    const templateKey = `ticket_template_${eventSlug}`;
    let design = null;

    try {
      const { data } = await supabase.from('page_sections').select('data').eq('type', templateKey).single();
      if (data?.data && data.data.elements) {
        design = data.data;
      }
    } catch (e) {}

    if (!design || !design.elements) {
      design = {
        bgImage: event.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
        width: 800, height: 226, flipX: false, flipY: false,
        elements: [
          { id: 'el-1', type: 'text', text: 'OFFICIAL ENTRY PASS', x: 24, y: 32, fontSize: 11, fontWeight: '800', color: '#FFDD00', fontFamily: 'Outfit' },
          { id: 'el-2', type: 'text', text: event.title, x: 24, y: 52, fontSize: 26, fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit' },
          { id: 'el-3', type: 'text', text: '{first_name} {last_name}', x: 24, y: 110, fontSize: 20, fontWeight: '900', color: '#ffffff', fontFamily: 'Outfit' },
          { id: 'el-4', type: 'text', text: '{seat}', x: 24, y: 160, fontSize: 15, fontWeight: '800', color: '#FFDD00', fontFamily: 'monospace' },
          { id: 'el-5', type: 'text', text: 'Oxford Grand Conference Hall', x: 420, y: 180, fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit' },
          { id: 'el-qr', type: 'qr', x: 615, y: 35, size: 84 },
        ]
      };
    }

    const renderAttendeeTicketHtml = (r) => {
      const attendeeData = {
        first_name: r.first_name || '',
        last_name: r.last_name || '',
        movie: event.title || 'Movie Event',
        seat: r.seat || 'Reserved Pass',
        ticket_id: (r.ticket_id || '').split('::')[0] || 'MD-PASS',
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
          width: 190mm;
          height: 52mm;
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: ${design.bgImage ? `url(${design.bgImage}) center/cover no-repeat` : 'linear-gradient(135deg, #181507 0%, #0a0802 100%)'};
          border: 1px solid #cbd5e1;
          page-break-inside: avoid;
        ">
          ${elementsHtml}
        </div>
      `;
    };

    const TICKETS_PER_PAGE = 5;
    let pagesHtml = '';
    
    for (let i = 0; i < targetRegs.length; i += TICKETS_PER_PAGE) {
      const pageTickets = targetRegs.slice(i, i + TICKETS_PER_PAGE);
      const ticketsMarkup = pageTickets.map(r => renderAttendeeTicketHtml(r)).join('');
      pagesHtml += `
        <div class="a4-page">
          ${ticketsMarkup}
        </div>
      `;
    }

    let iframe = document.getElementById('a4-event-print-iframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'a4-event-print-iframe';
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
          <title>${event.title} - A4 Ticket Pass Sheet (${targetRegs.length} Attendees)</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 6mm 10mm;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
              box-sizing: border-box;
            }
            body {
              background: #ffffff !important;
              margin: 0;
              padding: 0;
              font-family: 'Outfit', sans-serif;
            }
            .a4-page {
              width: 190mm;
              height: 280mm;
              margin: 0 auto;
              padding: 4mm 0;
              display: flex;
              flex-direction: column;
              gap: 3.5mm;
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

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: '#090b10',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Outfit, sans-serif',
      overflowY: 'auto'
    }}>
      {/* ── Top Header ── */}
      <div style={{
        padding: '16px 28px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'linear-gradient(135deg, #11141d 0%, #0d0e15 100%)',
        display: 'flex',
        alignItems: 'center',
        justify: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft size={16} /> Back to Events
          </button>

          <img 
            src={event.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80'} 
            alt={event.title} 
            style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }} 
          />

          <div>
            <h1 style={{ fontSize: '20px', fontWeight: 900, margin: 0, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {event.title}
              <span style={{ fontSize: '11px', background: 'rgba(234, 88, 12, 0.2)', color: '#fb923c', border: '1px solid rgba(234, 88, 12, 0.4)', padding: '2px 8px', borderRadius: '9999px', fontWeight: 800 }}>
                MANAGEMENT HUB
              </span>
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>
              {event.date} · {event.organizer || 'Oxford Hall'} · {event.price ? `${event.price.toLocaleString()} UZS` : 'Free Event'}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button 
            onClick={handleCopyLink}
            style={{
              background: copiedLink ? '#10b981' : 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#ffffff',
              borderRadius: '10px',
              padding: '8px 14px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {copiedLink ? <Check size={14}/> : <Copy size={14}/>}
            {copiedLink ? 'Link Copied!' : 'Copy Reg Link'}
          </button>

          <button 
            onClick={handlePrintAllTicketsA4}
            style={{
              background: 'linear-gradient(135deg, #FFDD00, #FFDD00)',
              color: '#000000',
              border: 'none',
              borderRadius: '10px',
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(255, 221, 0, 0.35)'
            }}
          >
            <Printer size={15}/> Print All Tickets (A4 PDF)
          </button>

          <button 
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: '#ffffff',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* ── Workspace 5 Nav Tabs ── */}
      <div style={{
        padding: '0 28px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        background: '#0d0f17',
        display: 'flex',
        gap: '4px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'dashboard', icon: <LayoutDashboard size={16}/>, label: 'Dashboard' },
          { id: 'registrations', icon: <Users size={16}/>, label: `Registrations (${eventRegs.length})` },
          { id: 'tickets', icon: <Ticket size={16}/>, label: 'Tickets List' },
          { id: 'designer', icon: <Palette size={16}/>, label: 'Ticket Designer' },
          { id: 'statistics', icon: <BarChart3 size={16}/>, label: 'Statistics' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '14px 20px',
              fontSize: '13px',
              fontWeight: activeTab === t.id ? 800 : 600,
              cursor: 'pointer',
              border: 'none',
              borderBottom: activeTab === t.id ? '3px solid #FFDD00' : '3px solid transparent',
              background: 'transparent',
              color: activeTab === t.id ? '#FFDD00' : 'rgba(255,255,255,0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease'
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Main Workspace Body ── */}
      <div style={{ padding: '28px', flex: 1 }}>

        {/* 1. DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '28px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>TOTAL REGISTRATIONS</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#fb923c', marginTop: '4px' }}>{eventRegs.length}</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>ESTIMATED REVENUE</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#10b981', marginTop: '4px' }}>{totalRevenue.toLocaleString()} UZS</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>FAST EDUCATION ATENDEES</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#FFDD00', marginTop: '4px' }}>{fastEduCount}</div>
              </div>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>OXFORD INT'L ATTENDEES</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: '#38bdf8', marginTop: '4px' }}>{oxfordCount}</div>
              </div>
            </div>

            {/* Event Details Card */}
            <div style={{ padding: '24px', borderRadius: '20px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '300px 1fr', gap: '24px' }}>
              <img src={event.image || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80'} alt={event.title} style={{ width: '100%', height: '200px', borderRadius: '16px', objectFit: 'cover' }} />
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 10px 0' }}>{event.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                  {event.description || 'Official event organized at Oxford International School Grand Conference Hall.'}
                </p>
                <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                  <button className="btn btn-primary btn-sm" onClick={() => setActiveTab('tickets')}>
                    🎟️ View Ticket Passes
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setActiveTab('designer')}>
                    🎨 Edit Ticket Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. REGISTRATIONS LIST TAB */}
        {activeTab === 'registrations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px', flex: 1, maxWidth: '500px' }}>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Search attendee by name, phone, ticket ID..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-outline btn-sm" onClick={exportCSV}>
                  <Download size={14}/> Export CSV
                </button>
                <button className="btn btn-primary btn-sm" onClick={handlePrintAllTicketsA4}>
                  <Printer size={14}/> Print A4 PDF
                </button>
              </div>
            </div>

            <div style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.08)', textTransform: 'uppercase', fontSize: '11px', color: 'rgba(255,255,255,0.5)', textAlign: 'left' }}>
                    <th style={{ padding: '14px 16px' }}>#</th>
                    <th style={{ padding: '14px 16px' }}>TICKET ID</th>
                    <th style={{ padding: '14px 16px' }}>ATTENDEE NAME</th>
                    <th style={{ padding: '14px 16px' }}>PHONE</th>
                    <th style={{ padding: '14px 16px' }}>BRANCH</th>
                    <th style={{ padding: '14px 16px' }}>SEAT</th>
                    <th style={{ padding: '14px 16px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRegs.map((r, i) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '14px 16px', opacity: 0.5 }}>{i + 1}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#FFDD00' }}>{r.ticket_id}</td>
                      <td style={{ padding: '14px 16px', fontWeight: 700 }}>{r.first_name} {r.last_name}</td>
                      <td style={{ padding: '14px 16px' }}>{r.phone}</td>
                      <td style={{ padding: '14px 16px' }}>{r.branch}</td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', color: '#fb923c' }}>{r.seat || 'Reserved'}</td>
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => { if(confirm('Delete attendee registration?')) deleteMdReg?.(r.id); }}>
                          <Trash2 size={12}/>
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRegs.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                        No registered attendees found for this event.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. TICKETS LIST TAB */}
        {activeTab === 'tickets' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0 }}>Issued Ticket Passes for {event.title}</h3>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', margin: '2px 0 0' }}>Ready for printing on standard A4 paper</p>
              </div>
              <button className="btn btn-primary" onClick={handlePrintAllTicketsA4} style={{ background: 'linear-gradient(135deg, #FFDD00, #FFDD00)', color: '#000', fontWeight: 900, border: 'none' }}>
                <Printer size={16}/> Print All Tickets (A4 PDF)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '16px' }}>
              {eventRegs.map(r => (
                <div key={r.id} style={{ padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#FFDD00' }}>TICKET ID: {r.ticket_id}</div>
                    <div style={{ fontSize: '16px', fontWeight: 900, marginTop: '2px' }}>{r.first_name} {r.last_name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>{r.phone} · {r.branch}</div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#fb923c', marginTop: '2px' }}>{r.seat || 'Reserved Pass'}</div>
                  </div>
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent('TicketPass:' + r.ticket_id)}`} 
                    alt="QR Code" 
                    style={{ width: '64px', height: '64px', borderRadius: '8px', background: '#fff', padding: '4px' }} 
                  />
                </div>
              ))}
              {eventRegs.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>
                  No ticket passes issued yet for {event.title}.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 4. TICKET DESIGNER TAB */}
        {activeTab === 'designer' && (
          <TicketDesignerStudio onSaveSuccess={loadMdRegs} />
        )}

        {/* 5. STATISTICS TAB */}
        {activeTab === 'statistics' && (
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 900, marginBottom: '20px' }}>Analytics & Seat Occupancy Statistics</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>ATTENDEES BY BRANCH</div>
                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Fast Education</span>
                      <strong>{fastEduCount}</strong>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${eventRegs.length ? (fastEduCount / eventRegs.length) * 100 : 0}%`, height: '100%', background: '#FFDD00' }}></div>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span>Oxford Int'l</span>
                      <strong>{oxfordCount}</strong>
                    </div>
                    <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${eventRegs.length ? (oxfordCount / eventRegs.length) * 100 : 0}%`, height: '100%', background: '#38bdf8' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>CHECK-IN & SEAT STATUS</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#10b981', marginTop: '10px' }}>100%</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>All issued passes have assigned seats</div>
              </div>

              <div style={{ padding: '20px', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>AVERAGE TICKET PRICE</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: '#FFDD00', marginTop: '10px' }}>{(event.price || 0).toLocaleString()} UZS</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>Per attendee pass</div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
